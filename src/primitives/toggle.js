import {
  ComponentBase,
  createElement,
  entityLabel,
  getDocument,
  setAttributes,
  setDisabled
} from "./ui-utils.js";

/** A switch control represented by a native button for keyboard support. */
export class Toggle extends ComponentBase {
  constructor(config = {}) {
    super(config);
    this.options = {
      label: entityLabel(this.entity, "Toggle"),
      checked: false,
      disabled: false,
      onLabel: "On",
      offLabel: "Off",
      ...this.options
    };
    this.checked = Boolean(this.options.checked);
  }

  render() {
    const doc = getDocument(this.context);
    const button = createElement(doc, "button", {
      type: "button",
      className: `ui-toggle${this.checked ? " is-checked" : ""}`,
      dataComponent: "toggle",
      dataEntityId: this.entity.id,
      dataEntityEn: this.entity.en,
      ariaLabel: this.options.ariaLabel || this.options.label,
      ariaChecked: this.checked,
      ariaDisabled: this.options.disabled,
      disabled: this.options.disabled
    });
    button.append(
      createElement(doc, "span", { className: "ui-toggle__track", ariaHidden: true }, [
        createElement(doc, "span", { className: "ui-toggle__thumb" })
      ]),
      createElement(doc, "span", { className: "ui-toggle__label" }, [this.checked ? this.options.onLabel : this.options.offLabel])
    );
    this.listen(button, "click", (event) => {
      if (this.options.disabled) return;
      this.setChecked(!this.checked, { event });
    });
    return button;
  }

  setChecked(checked, { event = null, emitChange = true } = {}) {
    const next = Boolean(checked);
    const changed = next !== this.checked;
    this.checked = next;
    this.options.checked = next;
    if (this.root) {
      this.root.classList.toggle("is-checked", next);
      setAttributes(this.root, { ariaChecked: next });
      const label = this.root.querySelector(".ui-toggle__label");
      if (label) label.textContent = next ? this.options.onLabel : this.options.offLabel;
    }
    if (changed && emitChange) {
      this.emit("toggle:change", { event, checked: next });
      this.options.onChange?.(next, event, this.entity, this);
    }
    return this;
  }

  setDisabled(disabled) {
    this.options.disabled = Boolean(disabled);
    if (this.root) setDisabled(this.root, this.options.disabled);
    return this;
  }
}
