import { defineEntity } from './entity-schema.js';

const noop = () => {};

function assertId(id, label = 'id') {
  if (typeof id !== 'string' || id.trim() === '') throw new TypeError(label + ' must be a non-empty string.');
  return id.trim().toLowerCase();
}

function normalizeRenderer(renderer) {
  if (typeof renderer === 'function') return Object.freeze({ mount: renderer, update: null, unmount: null });
  if (!renderer || typeof renderer !== 'object' || typeof renderer.mount !== 'function') {
    throw new TypeError('Renderer must provide a mount(host, props, context) function.');
  }
  return Object.freeze({
    mount: renderer.mount,
    update: typeof renderer.update === 'function' ? renderer.update : null,
    unmount: typeof renderer.unmount === 'function' ? renderer.unmount : null,
  });
}

/**
 * Entity definitions and rendering implementations are registered separately.
 * This is the dependency-inversion seam: data authors do not import DOM code,
 * and renderers do not need to know which page owns them.
 */
export function createEntityRegistry({ allowCustomFamily = false, onChange = noop } = {}) {
  if (typeof onChange !== 'function') throw new TypeError('onChange must be a function.');
  const entities = new Map();
  const renderers = new Map();
  const subscribers = new Set();

  const notify = (change) => {
    onChange(change);
    for (const subscriber of [...subscribers]) subscriber(change);
  };

  const register = (input, { replace = false, renderer } = {}) => {
    const entity = defineEntity(input, { allowCustomFamily });
    if (entities.has(entity.id) && !replace) throw new Error('Entity already registered: ' + entity.id);
    entities.set(entity.id, entity);
    if (renderer !== undefined) registerRenderer(entity.id, renderer, { replace });
    notify({ type: replace ? 'entity:replaced' : 'entity:registered', id: entity.id, entity });
    return entity;
  };

  const registerMany = (inputs, options = {}) => {
    if (!Array.isArray(inputs)) throw new TypeError('registerMany expects an array.');
    return inputs.map((input) => register(input, options));
  };

  const unregister = (id) => {
    const entityId = assertId(id);
    const entity = entities.get(entityId);
    if (!entity) return false;
    entities.delete(entityId);
    renderers.delete(entityId);
    notify({ type: 'entity:unregistered', id: entityId, entity });
    return true;
  };

  const registerRenderer = (id, renderer, { replace = false } = {}) => {
    const entityId = assertId(id, 'entityId');
    if (renderers.has(entityId) && !replace) throw new Error('Renderer already registered: ' + entityId);
    const adapter = normalizeRenderer(renderer);
    renderers.set(entityId, adapter);
    notify({ type: replace ? 'renderer:replaced' : 'renderer:registered', id: entityId, renderer: adapter });
    return adapter;
  };

  const unregisterRenderer = (id) => renderers.delete(assertId(id, 'entityId'));
  const get = (id) => entities.get(assertId(id)) ?? null;
  const has = (id) => entities.has(assertId(id));
  const getRenderer = (id) => renderers.get(assertId(id, 'entityId')) ?? null;

  const list = (filter = {}) => {
    const predicate = typeof filter === 'function'
      ? filter
      : (entity) => Object.entries(filter ?? {}).every(([key, expected]) => {
        if (key === 'tags' && Array.isArray(expected)) return expected.every((tag) => entity.tags.includes(tag));
        if (key === 'search' && typeof expected === 'string') {
          const haystack = [
            entity.id,
            entity.family,
            entity.layer,
            entity.name.en,
            entity.name.zh,
            entity.description.en,
            entity.description.zh,
            ...entity.aliases,
            ...entity.tags,
          ].join(' ').toLowerCase();
          return haystack.includes(expected.toLowerCase());
        }
        return entity[key] === expected;
      });
    return [...entities.values()].filter(predicate);
  };

  const subscribe = (listener) => {
    if (typeof listener !== 'function') throw new TypeError('Registry subscriber must be a function.');
    subscribers.add(listener);
    return () => subscribers.delete(listener);
  };

  const snapshot = () => Object.freeze({
    entities: Object.freeze([...entities.values()]),
    rendererIds: Object.freeze([...renderers.keys()]),
  });

  return Object.freeze({
    register,
    registerMany,
    unregister,
    get,
    has,
    list,
    subscribe,
    snapshot,
    registerRenderer,
    unregisterRenderer,
    getRenderer,
  });
}

export { normalizeRenderer as createRendererAdapter };

