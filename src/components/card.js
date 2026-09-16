import {
  ComponentBase,
  appendContent,
  createElement,
  entityDescription,
  entityLabel,
  getDocument,
  isActivationKey,
  setAttributes
} from "../primitives/ui-utils.js";

/** A semantic content card that can be static, selectable, or keyboard-activated. */
export class Card extends ComponentBase {
  constructor(config = {}) {
    super(config);
    this.options = {
      title: entityLabel(this.entity, "Card"),
      subtitle: this.entity.cn || "",
      description: entityDescription(this.entity, ""),
      meta: [],
      states: this.entity.states || [],
      preview: null,
      clickable: false,
      selected: false,
      loading: false,
      ...this.options
    };
    this.selected = Boolean(this.options.selected);
  }

  render() {
    const doc = getDocument(this.context);
    const clickable = Boolean(this.options.clickable);
    const root = createElement(doc, this.options.as || "article", {
      className: `ui-card${this.selected ? " is-selected" : ""}${clickable ? " is-clickable" : ""}${this.options.loading ? " is-loading" : ""}`,
      dataComponent: "card",
      dataEntityId: this.entity.id,
      dataEntityEn: this.entity.en,
      dataState: this.options.loading ? "loading" : (this.selected ? "selected" : "rest"),
      role: clickable ? "button" : null,
      tabIndex: clickable ? 0 : null,
      ariaPressed: clickable ? this.selected : null
    });
    const meta = Array.isArray(this.options.meta) ? this.options.meta : [this.options.meta];
    if (meta.length) root.append(createElement(doc, "div", { className: "ui-card__meta" }, meta.map((item) => createElement(doc, "span", {}, [item]))));
    const heading = createElement(doc, "header", { className: "ui-card__header" });
    heading.append(createElement(doc, "h3", { className: "ui-card__title" }, [this.options.title]));
    if (this.options.subtitle) heading.append(createElement(doc, "div", { className: "ui-card__subtitle" }, [this.options.subtitle]));
    root.append(heading);
    if (this.options.loading) {
      root.append(createElement(doc, "div", { className: "ui-card__loading", role: "status", ariaLabel: "Loading" }, ["Loading…"]));
    } else {
      if (this.options.preview != null || this.options.renderPreview) {
        const preview = createElement(doc, "div", { className: "ui-card__preview" });
        appendContent(preview, this.options.renderPreview
          ? (docNode) => this.options.renderPreview({ entity: this.entity, context: this.context, document: docNode })
          : this.options.preview);
        root.append(preview);
      }
      if (this.options.description) root.append(createElement(doc, "p", { className: "ui-card__description" }, [this.options.description]));
      const states = (this.options.states || []).map((state) => typeof state === "string" ? state : (state.label || state.en || state.cn || ""));
      if (states.length) root.append(createElement(doc, "div", { className: "ui-card__states" }, states.map((state) => createElement(doc, "span", { className: "ui-card__state" }, [state]))));
    }
    if (this.options.footer != null) {
      const footer = createElement(doc, "footer", { className: "ui-card__footer" });
      appendContent(footer, this.options.footer);
      root.append(footer);
    }
    if (clickable) {
      this.listen(root, "click", (event) => this.activate(event));
      this.listen(root, "keydown", (event) => {
        if (isActivationKey(event)) {
          event.preventDefault();
          this.activate(event);
        }
      });
    }
    return root;
  }

  activate(event = null) {
    if (!this.options.clickable || this.options.loading) return this;
    this.emit("card:activate", { event, selected: this.selected });
    this.options.onActivate?.(event, this.entity, this);
    return this;
  }

  setSelected(selected, { emitChange = false, event = null } = {}) {
    const next = Boolean(selected);
    const changed = next !== this.selected;
    this.selected = next;
    this.options.selected = next;
    if (this.root) {
      this.root.classList.toggle("is-selected", next);
      setAttributes(this.root, { ariaPressed: this.options.clickable ? next : null, dataState: next ? "selected" : "rest" });
    }
    if (changed && emitChange) this.emit("card:selection", { event, selected: next });
    return this;
  }
}
