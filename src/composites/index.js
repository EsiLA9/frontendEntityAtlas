/**
 * Composite layer boundary. Composite renderers combine primitives and
 * components while remaining independent from a particular view.
 */
export function createCompositeRenderer({ mount, update = null, unmount = null } = {}) {
  if (typeof mount !== 'function') throw new TypeError('Composite renderer requires mount(host, props, context).');
  return Object.freeze({ mount, update, unmount });
}
