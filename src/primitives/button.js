import {
  ComponentBase,
  createElement,
  entityLabel,
  getDocument,
  setDisabled
} from "./ui-utils.js";

/** A semantic button with loading, disabled, and keyboard-friendly states. */
export class Button extends ComponentBase {
  constructor(config = {}) {
    super(config);
    this.options = {
      label: entityLabel(this.entity, "Button"),
      variant: "default",
      type: "button",
      disabled: false,
      loading: false,
      icon: null,
      iconOnly: false,
      value: undefined,
      ...this.options
    };
  }

  render() {
    const doc = getDocument(this.context);
    const {
      label,
      variant,
      type,
      disabled,
      loading,
      icon,
      iconOnly,
      value
    } = this.options;
    const button = createElement(doc, "button", {
      type,
      className: `ui-button ui-button--${variant}`,
      dataComponent: "button",
      dataEntityId: this.entity.id,
      dataEntityEn: this.entity.en,
      ariaLabel: this.options.ariaLabel || (iconOnly ? label : null),
      ariaBusy: loading,
      disabled: Boolean(disabled || loading)
    });

    if (icon) button.append(typeof icon === "object" ? icon : createElement(doc, "span", { className: "ui-button__icon", ariaHidden: true }, [icon]));
    if (!iconOnly) button.append(createElement(doc, "span", { className: "ui-button__label" }, [loading ? (this.options.loadingLabel || "Loading…") : label]));
    if (loading) button.append(createElement(doc, "span", { className: "ui-button__status", ariaHidden: true }, ["…"]));

    this.listen(button, "click", (event) => {
      if (this.options.disabled || this.options.loading) {
        event.preventDefault();
        return;
      }
      this.emit("button:click", { event, value, label });
      this.options.onClick?.(event, this.entity, this);
    });
    return button;
  }

  setDisabled(disabled) {
    this.options.disabled = Boolean(disabled);
    if (this.root) setDisabled(this.root, this.options.disabled || this.options.loading);
    return this;
  }

  setLoading(loading) {
    this.options.loading = Boolean(loading);
    if (this.root) this.update();
    return this;
  }

  setLabel(label) {
    this.options.label = String(label);
    const labelNode = this.root?.querySelector(".ui-button__label");
    if (labelNode && !this.options.loading) labelNode.textContent = this.options.label;
    return this;
  }
}
