/**
 * Small synchronous event bus used as the communication boundary between
 * entities. It has no knowledge of DOM events or a particular view.
 */

const WILDCARD = '*';
const noop = () => {};

function assertEventType(type) {
  if (typeof type !== 'string' || type.trim() === '') {
    throw new TypeError('Event type must be a non-empty string.');
  }
  return type.trim();
}

function assertHandler(handler) {
  if (typeof handler !== 'function') throw new TypeError('Event handler must be a function.');
}

/**
 * @param {{onError?: (error: unknown, event: object) => void}} options
 */
export function createEventBus({ onError = noop } = {}) {
  if (typeof onError !== 'function') throw new TypeError('onError must be a function.');

  const listeners = new Map();
  let sequence = 0;

  const getListeners = (type) => {
    if (!listeners.has(type)) listeners.set(type, []);
    return listeners.get(type);
  };

  const removeEntry = (type, entry) => {
    const bucket = listeners.get(type);
    if (!bucket) return false;
    const index = bucket.indexOf(entry);
    if (index === -1) return false;
    bucket.splice(index, 1);
    if (bucket.length === 0) listeners.delete(type);
    return true;
  };

  const on = (type, handler, { once = false, priority = 0, signal } = {}) => {
    const eventType = assertEventType(type);
    assertHandler(handler);
    if (signal && signal.aborted) return noop;

    const entry = { handler, once: Boolean(once), priority: Number(priority) || 0 };
    const bucket = getListeners(eventType);
    bucket.push(entry);
    bucket.sort((a, b) => b.priority - a.priority);

    const unsubscribe = () => removeEntry(eventType, entry);
    if (signal && typeof signal.addEventListener === 'function') {
      signal.addEventListener('abort', unsubscribe, { once: true });
    }
    return unsubscribe;
  };

  const once = (type, handler, options = {}) => on(type, handler, { ...options, once: true });

  const off = (type, handler) => {
    const eventType = assertEventType(type);
    const bucket = listeners.get(eventType);
    if (!bucket) return false;
    const matches = bucket.filter((entry) => entry.handler === handler);
    matches.forEach((entry) => removeEntry(eventType, entry));
    return matches.length > 0;
  };

  const emit = (type, detail, meta = {}) => {
    const eventType = assertEventType(type);
    const event = Object.freeze({
      type: eventType,
      detail,
      source: meta.source ?? null,
      timestamp: meta.timestamp ?? Date.now(),
      sequence: ++sequence,
    });
    const errors = [];
    const targets = [
      ...(listeners.get(eventType) ?? []),
      ...(listeners.get(WILDCARD) ?? []),
    ].sort((a, b) => b.priority - a.priority);

    for (const entry of targets) {
      if (entry.once) {
        removeEntry(listeners.get(eventType)?.includes(entry) ? eventType : WILDCARD, entry);
      }
      try {
        entry.handler(event);
      } catch (error) {
        errors.push(error);
        onError(error, event);
      }
    }
    return Object.freeze({ event, errors: Object.freeze(errors) });
  };

  const clear = (type) => {
    if (type === undefined) {
      listeners.clear();
      return;
    }
    listeners.delete(assertEventType(type));
  };

  const listenerCount = (type) => {
    if (type === undefined) {
      return [...listeners.values()].reduce((total, bucket) => total + bucket.length, 0);
    }
    return listeners.get(assertEventType(type))?.length ?? 0;
  };

  return Object.freeze({ on, once, off, emit, clear, listenerCount });
}

export { WILDCARD as EVENT_WILDCARD };

