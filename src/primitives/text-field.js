import {
  ComponentBase,
  createElement,
  entityLabel,
  getDocument,
  makeId,
  setDisabled
} from "./ui-utils.js";

/** A labelled single-line input or multiline textarea. */
export class TextField extends ComponentBase {
  constructor(config = {}) {
    super(config);
    this.options = {
      label: entityLabel(this.entity, "Text field"),
      value: "",
      placeholder: "",
      type: "text",
      name: undefined,
      helperText: "",
      error: "",
      invalid: false,
      required: false,
      disabled: false,
      readOnly: false,
      multiline: false,
      rows: 4,
      ...this.options
    };
    this.controlId = makeId(this.context, this.entity.id || "text-field");
  }

  render() {
    const doc = getDocument(this.context);
    const { label, helperText, error, invalid, required, disabled, readOnly, multiline, rows } = this.options;
    const describedBy = makeId(this.context, "text-field-description");
    const root = createElement(doc, "div", {
      className: `ui-text-field${invalid ? " is-invalid" : ""}`,
      dataComponent: "text-field",
      dataEntityId: this.entity.id,
      dataEntityEn: this.entity.en,
      dataState: invalid ? "invalid" : (this.options.value ? "filled" : "empty")
    });
    const labelNode = createElement(doc, "label", { className: "ui-text-field__label", htmlFor: this.controlId }, [label]);
    if (required) labelNode.append(createElement(doc, "span", { className: "ui-text-field__required", ariaHidden: true }, [" *"]));

    const controlAttributes = {
      id: this.controlId,
      className: "ui-text-field__control",
      name: this.options.name,
      type: multiline ? undefined : this.options.type,
      placeholder: this.options.placeholder,
      required: Boolean(required),
      disabled: Boolean(disabled),
      readOnly: Boolean(readOnly),
      ariaInvalid: Boolean(invalid),
      ariaDescribedBy: helperText || error ? describedBy : null,
      ariaLabel: label ? null : (this.options.ariaLabel || entityLabel(this.entity, "Text field"))
    };
    const input = createElement(doc, multiline ? "textarea" : "input", controlAttributes);
    if (multiline) input.rows = rows;
    input.value = this.options.value ?? "";
    const description = createElement(doc, "div", {
      id: describedBy,
      className: `ui-text-field__description${error ? " ui-text-field__error" : ""}`,
      ariaLive: error ? "polite" : null
    }, [error || helperText]);

    root.append(labelNode, input);
    if (error || helperText) root.append(description);
    this.input = input;
    this.listen(input, "input", (event) => {
      this.options.value = input.value;
      this.emit("text-field:input", { event, value: input.value });
      this.options.onInput?.(input.value, event, this.entity, this);
    });
    this.listen(input, "change", (event) => {
      this.options.value = input.value;
      this.emit("text-field:change", { event, value: input.value });
      this.options.onChange?.(input.value, event, this.entity, this);
    });
    return root;
  }

  getValue() {
    return this.input?.value ?? this.options.value ?? "";
  }

  setValue(value, { emitChange = false } = {}) {
    this.options.value = value == null ? "" : String(value);
    if (this.input) this.input.value = this.options.value;
    if (emitChange) this.emit("text-field:change", { value: this.options.value, programmatic: true });
    return this;
  }

  setInvalid(invalid, error = this.options.error) {
    this.options.invalid = Boolean(invalid);
    this.options.error = error || "";
    if (this.root) this.update();
    return this;
  }

  setDisabled(disabled) {
    this.options.disabled = Boolean(disabled);
    if (this.input) setDisabled(this.input, this.options.disabled);
    return this;
  }
}
