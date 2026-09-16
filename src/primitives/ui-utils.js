/**
 * Small, framework-free utilities shared by the atlas UI layer.
 *
 * A context may provide:
 *   - document: a document-like object (useful for tests or embedded views)
 *   - emit(type, payload): an event sink
 *   - eventBus.emit(type, payload): an equivalent event sink
 *   - idPrefix: a stable prefix for generated ids
 */

let idSequence = 0;

const attributeAliases = {
  className: "class",
  htmlFor: "for",
  tabIndex: "tabindex",
  ariaLabel: "aria-label",
  ariaDescribedBy: "aria-describedby",
  ariaControls: "aria-controls",
  ariaExpanded: "aria-expanded",
  ariaHidden: "aria-hidden",
  ariaPressed: "aria-pressed",
  ariaSelected: "aria-selected",
  ariaChecked: "aria-checked",
  ariaDisabled: "aria-disabled",
  ariaBusy: "aria-busy",
  ariaLive: "aria-live",
  ariaModal: "aria-modal",
  ariaLabelledBy: "aria-labelledby",
  ariaOrientation: "aria-orientation",
  ariaValueMin: "aria-valuemin",
  ariaValueMax: "aria-valuemax",
  ariaValueNow: "aria-valuenow",
  ariaValueText: "aria-valuetext",
  dataComponent: "data-component",
  dataEntityId: "data-entity-id",
  dataEntityEn: "data-entity-en",
  dataState: "data-state"
};

export function getDocument(context = {}) {
  if (context && context.document) return context.document;
  if (typeof document !== "undefined") return document;
  throw new Error("A document is required to render an atlas UI component.");
}

export function toEntityId(entity, fallback = "entity") {
  const value = entity && (entity.id ?? entity.en ?? entity.cn);
  return String(value || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, "-")
    .replace(/^-+|-+$/g, "") || fallback;
}

export function entityLabel(entity, fallback = "Entity") {
  if (!entity) return fallback;
  return entity.label || entity.en || entity.cn || fallback;
}

export function entityDescription(entity, fallback = "") {
  if (!entity) return fallback;
  return entity.definition || entity.def || entity.description || entity.use || fallback;
}

export function makeId(context = {}, hint = "element") {
  const prefix = String(context.idPrefix || "atlas").replace(/[^a-z0-9_-]+/gi, "-");
  idSequence += 1;
  return `${prefix}-${toEntityId({ id: hint }, "element")}-${idSequence}`;
}

export function emit(context, type, payload = {}) {
  if (context && typeof context.emit === "function") {
    return context.emit(type, payload);
  }
  if (context && context.eventBus && typeof context.eventBus.emit === "function") {
    return context.eventBus.emit(type, payload);
  }
  if (context && typeof context.onEvent === "function") {
    return context.onEvent(type, payload);
  }
  return undefined;
}

export function setAttributes(element, attributes = {}) {
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === "children" || key === "on") return;

    if (key === "style" && value && typeof value === "object") {
      Object.assign(element.style, value);
      return;
    }

    if (key === "dataset" && value && typeof value === "object") {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        if (dataValue != null) element.dataset[dataKey] = String(dataValue);
      });
      return;
    }

    const attribute = attributeAliases[key] || key;
    if (value === false || value == null) {
      if (value === false && attribute.startsWith("aria-")) element.setAttribute(attribute, "false");
      else element.removeAttribute(attribute);
    } else if (value === true) {
      element.setAttribute(attribute, attribute.startsWith("aria-") ? "true" : "");
    } else {
      element.setAttribute(attribute, String(value));
    }
  });
  return element;
}

export function createElement(doc, tagName, attributes = {}, children = []) {
  const element = doc.createElement(tagName);
  setAttributes(element, attributes);
  appendContent(element, children);
  return element;
}

export function appendContent(parent, content) {
  if (content == null || content === false) return parent;
  if (Array.isArray(content)) {
    content.forEach((item) => appendContent(parent, item));
    return parent;
  }
  if (typeof content === "function") {
    return appendContent(parent, content(parent.ownerDocument));
  }
  if (typeof content === "object" && typeof content.nodeType === "number") {
    parent.append(content);
    return parent;
  }
  parent.append(parent.ownerDocument.createTextNode(String(content)));
  return parent;
}

export function mountTarget(container, context = {}) {
  const target = typeof container === "string"
    ? getDocument(context).querySelector(container)
    : container;
  if (!target || typeof target.append !== "function") {
    throw new Error("mount(container) needs a DOM element or a matching selector.");
  }
  return target;
}

export function isActivationKey(event) {
  return event.key === "Enter" || event.key === " ";
}

export function clamp(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(Math.max(number, min), max);
}

export function setDisabled(element, disabled) {
  element.disabled = Boolean(disabled);
  setAttributes(element, { ariaDisabled: Boolean(disabled) });
  return element;
}

export class ComponentBase {
  constructor({ entity = {}, context = {}, ...options } = {}) {
    this.entity = entity || {};
    this.context = context || {};
    this.options = options;
    this.root = null;
    this._cleanups = [];
  }

  render() {
    throw new Error(`${this.constructor.name}.render() must be implemented.`);
  }

  mount(container) {
    const target = mountTarget(container, this.context);
    if (this.root && this.root.isConnected) return this.root;
    this.root = this.render();
    target.append(this.root);
    if (typeof this.afterMount === "function") this.afterMount();
    return this.root;
  }

  update() {
    this.clearListeners();
    const next = this.render();
    if (this.root && this.root.parentNode) {
      this.root.replaceWith(next);
    }
    this.root = next;
    return next;
  }

  listen(target, eventName, handler, options) {
    target.addEventListener(eventName, handler, options);
    this._cleanups.push(() => target.removeEventListener(eventName, handler, options));
    return handler;
  }

  clearListeners() {
    this._cleanups.splice(0).forEach((cleanup) => cleanup());
  }

  emit(type, detail = {}) {
    return emit(this.context, type, {
      entity: this.entity,
      component: this.constructor.name,
      ...detail
    });
  }

  focus() {
    const focusTarget = this.root && (this.root.matches?.("button, input, textarea, select, [tabindex]")
      ? this.root
      : this.root?.querySelector?.("button, input, textarea, select, [tabindex]"));
    focusTarget?.focus();
  }

  unmount() {
    this.root?.remove();
    this.root = null;
  }

  destroy() {
    this.clearListeners();
    this.unmount();
  }
}
