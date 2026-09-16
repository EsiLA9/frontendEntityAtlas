/**
 * Rendering is an adapter boundary. Core owns lifecycle and dependency
 * lookup; a DOM, canvas, test, or future framework adapter owns actual output.
 */

const noop = () => {};

function assertRenderer(renderer) {
  if (!renderer || typeof renderer.mount !== 'function') {
    throw new TypeError('A renderer with mount(host, props, context) is required.');
  }
  return renderer;
}

function resolveId(ref) {
  if (typeof ref === 'string' && ref.trim() !== '') return ref.trim().toLowerCase();
  if (ref && typeof ref === 'object' && typeof ref.id === 'string') return ref.id.trim().toLowerCase();
  throw new TypeError('An entity reference must be an ID or an entity-like object with an id.');
}

/**
 * Creates the stable context passed to a renderer. mount returns a lifecycle
 * handle rather than exposing adapter-specific internals to the caller.
 */
export function createRenderContext({
  registry = null,
  eventBus = null,
  store = null,
  stateMachine = null,
  host = null,
  parent = null,
  scope = {},
  services = {},
  adapters = {},
} = {}) {
  const activeHandles = new Set();
  const frozenScope = Object.freeze({ ...scope });
  const frozenServices = Object.freeze({ ...services });

  const getEntity = (ref) => {
    if (ref && typeof ref === 'object' && ref.id) return ref;
    if (!registry || typeof registry.get !== 'function') return null;
    return registry.get(resolveId(ref));
  };

  const getRenderer = (ref) => {
    const id = resolveId(ref);
    if (Object.prototype.hasOwnProperty.call(adapters, id)) return adapters[id];
    if (!registry || typeof registry.getRenderer !== 'function') return null;
    return registry.getRenderer(id);
  };

  const emit = (type, detail, meta = {}) => {
    if (!eventBus || typeof eventBus.emit !== 'function') return null;
    return eventBus.emit(type, detail, { ...meta, source: meta.source ?? frozenScope.id ?? null });
  };

  const subscribe = (type, handler, options) => {
    if (!eventBus || typeof eventBus.on !== 'function') return noop;
    return eventBus.on(type, handler, options);
  };

  const getState = () => {
    if (stateMachine && typeof stateMachine.getSnapshot === 'function') return stateMachine.getSnapshot();
    if (store && typeof store.getState === 'function') return store.getState();
    return undefined;
  };

  const dispatch = (action) => {
    if (!store || typeof store.dispatch !== 'function') throw new Error('Render context has no state store.');
    return store.dispatch(action);
  };

  const send = (event, payload) => {
    if (!stateMachine || typeof stateMachine.send !== 'function') throw new Error('Render context has no state machine.');
    return stateMachine.send(event, payload);
  };

  const mount = (ref, props = {}, hostOverride = host) => {
    const id = resolveId(ref);
    const entity = getEntity(ref);
    if (!entity) throw new Error('Entity is not registered: ' + id);
    const renderer = assertRenderer(getRenderer(ref));
    const rendererContext = createRenderContext({
      registry,
      eventBus,
      store,
      stateMachine,
      host: hostOverride,
      parent: context,
      scope: { ...frozenScope, entityId: id },
      services: frozenServices,
      adapters,
    });
    let instance = renderer.mount(hostOverride, props, rendererContext);
    const lifecycle = {
      entity,
      host: hostOverride,
      get instance() {
        return instance;
      },
      update(nextProps = {}) {
        if (typeof renderer.update === 'function') {
          const nextInstance = renderer.update(instance, nextProps, rendererContext);
          if (nextInstance !== undefined) instance = nextInstance;
        }
        return instance;
      },
      unmount() {
        if (!activeHandles.has(lifecycle)) return false;
        activeHandles.delete(lifecycle);
        if (typeof renderer.unmount === 'function') renderer.unmount(instance, rendererContext);
        return true;
      },
    };
    activeHandles.add(lifecycle);
    return Object.freeze(lifecycle);
  };

  const unmountAll = () => {
    for (const lifecycle of [...activeHandles]) lifecycle.unmount();
  };

  const child = (overrides = {}) => createRenderContext({
    registry,
    eventBus,
    store,
    stateMachine,
    host: overrides.host ?? host,
    parent: context,
    scope: { ...frozenScope, ...(overrides.scope ?? {}) },
    services: { ...frozenServices, ...(overrides.services ?? {}) },
    adapters: { ...adapters, ...(overrides.adapters ?? {}) },
  });

  const context = Object.freeze({
    registry,
    eventBus,
    store,
    stateMachine,
    host,
    parent,
    scope: frozenScope,
    services: frozenServices,
    getEntity,
    getRenderer,
    getState,
    dispatch,
    send,
    emit,
    subscribe,
    mount,
    child,
    unmountAll,
  });

  return context;
}

export const createRenderingContext = createRenderContext;

