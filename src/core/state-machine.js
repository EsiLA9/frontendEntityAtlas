/**
 * Framework-neutral state primitives. Components can use a state machine for
 * local UI states and a store for shared application state without importing a
 * page, DOM node or framework runtime.
 */

function freezeSnapshot(value) {
  if (value && typeof value === 'object') return Object.freeze({ ...value });
  return value;
}

function assertEvent(event) {
  if (typeof event !== 'string' || event.trim() === '') {
    throw new TypeError('State event must be a non-empty string.');
  }
  return event.trim();
}

function notifySubscribers(subscribers, nextState, action, previousState) {
  for (const subscriber of [...subscribers]) subscriber(nextState, action, previousState);
}

/**
 * A reducer store for cross-component state. Actions are plain objects with a
 * required type; the reducer remains the only state mutation authority.
 */
export function createStore({ name = 'app', initialState, reducer, eventBus = null } = {}) {
  if (typeof reducer !== 'function') throw new TypeError('Store reducer must be a function.');
  let state = initialState;
  const subscribers = new Set();

  const getState = () => state;
  const subscribe = (listener, { selector = (value) => value, equality = Object.is } = {}) => {
    if (typeof listener !== 'function') throw new TypeError('Store subscriber must be a function.');
    let selected = selector(state);
    const wrapped = (nextState, action, previousState) => {
      const nextSelected = selector(nextState);
      if (!equality(selected, nextSelected)) {
        const previousSelected = selected;
        selected = nextSelected;
        listener(nextSelected, previousSelected, action, previousState);
      }
    };
    subscribers.add(wrapped);
    return () => subscribers.delete(wrapped);
  };

  const dispatch = (action) => {
    if (!action || typeof action !== 'object' || typeof action.type !== 'string' || action.type.trim() === '') {
      throw new TypeError('A dispatched action must have a non-empty string type.');
    }
    const previousState = state;
    const nextState = reducer(previousState, action);
    if (nextState === undefined) throw new Error('Reducer "' + name + '" returned undefined for ' + action.type + '.');
    state = nextState;
    if (!Object.is(previousState, nextState)) {
      notifySubscribers(subscribers, state, action, previousState);
      if (eventBus && typeof eventBus.emit === 'function') {
        eventBus.emit('store:' + name + ':changed', { previousState, state, action }, { source: name });
      }
    }
    return state;
  };

  const replaceState = (nextState, action = { type: '@@replace' }) => {
    const previousState = state;
    state = nextState;
    if (!Object.is(previousState, state)) {
      notifySubscribers(subscribers, state, action, previousState);
      if (eventBus && typeof eventBus.emit === 'function') {
        eventBus.emit('store:' + name + ':changed', { previousState, state, action }, { source: name });
      }
    }
    return state;
  };

  return Object.freeze({ name, getState, subscribe, dispatch, replaceState });
}

/**
 * Declarative finite state machine. A transition may be a target state string
 * or an object with target, guard and effect. Effects receive an immutable
 * transition description and may return a replacement context.
 */
export function createStateMachine({
  id = 'machine',
  initial,
  states = {},
  context = {},
  eventBus = null,
  strict = false,
} = {}) {
  if (typeof initial !== 'string' || initial.trim() === '') throw new TypeError('Machine initial state is required.');
  if (!states || typeof states !== 'object' || Array.isArray(states)) throw new TypeError('Machine states must be an object.');
  if (!Object.prototype.hasOwnProperty.call(states, initial)) throw new Error('Unknown initial state: ' + initial);

  let current = initial;
  let machineContext = context;
  let sequence = 0;
  const subscribers = new Set();

  const snapshot = () => freezeSnapshot({
    id,
    value: current,
    context: machineContext,
    sequence,
  });

  const getSnapshot = () => snapshot();
  const subscribe = (listener) => {
    if (typeof listener !== 'function') throw new TypeError('Machine subscriber must be a function.');
    subscribers.add(listener);
    return () => subscribers.delete(listener);
  };

  const send = (eventName, payload) => {
    const event = assertEvent(eventName);
    const stateDefinition = states[current] ?? {};
    const rawTransition = stateDefinition.on?.[event];
    if (rawTransition === undefined) {
      if (strict) throw new Error('No transition for ' + event + ' from ' + current + '.');
      return { changed: false, handled: false, reason: 'unhandled', snapshot: getSnapshot() };
    }
    const transition = typeof rawTransition === 'string' ? { target: rawTransition } : rawTransition;
    if (!transition || typeof transition.target !== 'string'
      || !Object.prototype.hasOwnProperty.call(states, transition.target)) {
      throw new Error('Invalid transition target for ' + event + ' from ' + current + '.');
    }
    const transitionInfo = Object.freeze({
      id,
      event,
      payload,
      from: current,
      to: transition.target,
      context: machineContext,
    });
    if (typeof transition.guard === 'function' && !transition.guard(transitionInfo)) {
      return { changed: false, handled: true, reason: 'guard-rejected', snapshot: getSnapshot() };
    }

    const previous = getSnapshot();
    const exit = states[current].onExit;
    if (typeof exit === 'function') exit(transitionInfo);
    if (typeof transition.effect === 'function') {
      const nextContext = transition.effect(transitionInfo);
      if (nextContext !== undefined) machineContext = nextContext;
    }
    current = transition.target;
    sequence += 1;
    const next = getSnapshot();
    const enter = states[current].onEnter;
    if (typeof enter === 'function') enter(Object.freeze({ ...transitionInfo, context: machineContext }));
    notifySubscribers(subscribers, next, event, previous);
    if (eventBus && typeof eventBus.emit === 'function') {
      eventBus.emit('state:' + id + ':changed', { previous, next, event, payload }, { source: id });
    }
    return { changed: previous.value !== next.value || previous.context !== next.context, handled: true, snapshot: next };
  };

  const reset = (nextState = initial, nextContext = context) => {
    if (!Object.prototype.hasOwnProperty.call(states, nextState)) throw new Error('Unknown reset state: ' + nextState);
    current = nextState;
    machineContext = nextContext;
    sequence += 1;
    const next = getSnapshot();
    notifySubscribers(subscribers, next, '@@reset', null);
    if (eventBus && typeof eventBus.emit === 'function') {
      eventBus.emit('state:' + id + ':changed', { previous: null, next, event: '@@reset' }, { source: id });
    }
    return next;
  };

  return Object.freeze({ id, getSnapshot, subscribe, send, reset });
}

