import {
  ComponentBase,
  appendContent,
  createElement,
  entityDescription,
  entityLabel,
  getDocument,
  makeId,
  setAttributes
} from "./ui-utils.js";

/** A focusable tooltip trigger with hover, focus, click, and Escape behavior. */
export class Tooltip extends ComponentBase {
  constructor(config = {}) {
    super(config);
    this.options = {
      label: entityLabel(this.entity, "Tooltip"),
      triggerLabel: "ⓘ",
      content: entityDescription(this.entity, "Additional information"),
      placement: "top",
      ...this.options
    };
    this.tooltipId = makeId(this.context, this.entity.id || "tooltip");
    this._hideTimer = null;
  }

  render() {
    const doc = getDocument(this.context);
    const root = createElement(doc, "div", {
      className: "ui-tooltip",
      dataComponent: "tooltip",
      dataEntityId: this.entity.id,
      dataEntityEn: this.entity.en,
      dataState: "hidden"
    });
    const trigger = createElement(doc, "button", {
      type: "button",
      className: "ui-tooltip__trigger",
      ariaLabel: this.options.ariaLabel || this.options.label,
      ariaDescribedBy: this.tooltipId,
      ariaExpanded: false
    });
    appendContent(trigger, this.options.trigger ?? this.options.triggerLabel);
    const panel = createElement(doc, "span", {
      id: this.tooltipId,
      className: `ui-tooltip__content ui-tooltip__content--${this.options.placement}`,
      role: "tooltip",
      hidden: true
    });
    appendContent(panel, this.options.content);
    root.append(trigger, panel);
    this.trigger = trigger;
    this.panel = panel;

    this.listen(trigger, "mouseenter", () => this.show("hover"));
    this.listen(trigger, "focus", () => this.show("focus"));
    this.listen(trigger, "mouseleave", () => this.scheduleHide());
    this.listen(trigger, "blur", () => this.scheduleHide());
    this.listen(trigger, "click", () => {
      if (this.panel.hidden) this.show("click");
      else this.hide("click");
    });
    this.listen(trigger, "keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        this.hide("escape");
      }
    });
    return root;
  }

  show(reason = "programmatic") {
    if (!this.panel) return this;
    clearTimeout(this._hideTimer);
    this.panel.hidden = false;
    setAttributes(this.root, { dataState: "visible" });
    setAttributes(this.trigger, { ariaExpanded: true });
    this.emit("tooltip:show", { reason });
    return this;
  }

  hide(reason = "programmatic") {
    if (!this.panel) return this;
    clearTimeout(this._hideTimer);
    this.panel.hidden = true;
    setAttributes(this.root, { dataState: "hidden" });
    setAttributes(this.trigger, { ariaExpanded: false });
    this.emit("tooltip:hide", { reason });
    return this;
  }

  scheduleHide() {
    clearTimeout(this._hideTimer);
    this._hideTimer = setTimeout(() => this.hide("pointer-leave"), 120);
    return this;
  }

  setContent(content) {
    this.options.content = content;
    if (this.panel) {
      this.panel.replaceChildren();
      appendContent(this.panel, content);
    }
    return this;
  }

  destroy() {
    clearTimeout(this._hideTimer);
    super.destroy();
  }
}
