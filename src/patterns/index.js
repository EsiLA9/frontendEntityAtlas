/**
 * Pattern layer boundary. Patterns coordinate composites and state/event
 * protocols for task-level interactions such as Master–Detail or Wizard.
 */
export function createPatternRenderer({ mount, update = null, unmount = null } = {}) {
  if (typeof mount !== 'function') throw new TypeError('Pattern renderer requires mount(host, props, context).');
  return Object.freeze({ mount, update, unmount });
}
