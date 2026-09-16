import {
  ComponentBase,
  clamp,
  createElement,
  entityLabel,
  getDocument,
  setAttributes
} from "./ui-utils.js";

/** A determinate progress bar, optionally promoted to an accessible slider. */
export class ProgressBar extends ComponentBase {
  constructor(config = {}) {
    super(config);
    this.options = {
      label: entityLabel(this.entity, "Progress"),
      value: 0,
      min: 0,
      max: 100,
      step: 1,
      indeterminate: false,
      interactive: false,
      showValue: true,
      status: "in-progress",
      ...this.options
    };
    this.value = clamp(this.options.value, this.options.min, this.options.max);
  }

  render() {
    const doc = getDocument(this.context);
    const interactive = Boolean(this.options.interactive);
    const root = createElement(doc, "div", {
      className: `ui-progress-bar${this.options.indeterminate ? " is-indeterminate" : ""}`,
      dataComponent: "progress-bar",
      dataEntityId: this.entity.id,
      dataEntityEn: this.entity.en,
      dataState: this.options.status,
      role: interactive ? "slider" : "progressbar",
      tabIndex: interactive ? 0 : null,
      ariaLabel: this.options.ariaLabel || this.options.label,
      ariaValueMin: this.options.min,
      ariaValueMax: this.options.max,
      ariaValueNow: this.options.indeterminate ? null : this.value,
      ariaValueText: this.options.indeterminate ? "Loading" : `${this.value}`
    });
    const track = createElement(doc, "div", { className: "ui-progress-bar__track" });
    const fill = createElement(doc, "div", { className: "ui-progress-bar__fill" });
    const valueLabel = createElement(doc, "span", { className: "ui-progress-bar__value" }, [this.options.indeterminate ? "Loading…" : `${this.value}%`]);
    fill.style.width = this.options.indeterminate ? "35%" : `${this.percentage()}%`;
    track.append(fill);
    root.append(track);
    if (this.options.showValue) root.append(valueLabel);
    this.fill = fill;
    this.valueLabel = valueLabel;

    if (interactive) {
      this.listen(root, "keydown", (event) => {
        let next = null;
        if (event.key === "ArrowRight" || event.key === "ArrowUp") next = this.value + this.options.step;
        if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = this.value - this.options.step;
        if (event.key === "Home") next = this.options.min;
        if (event.key === "End") next = this.options.max;
        if (next != null) {
          event.preventDefault();
          this.setValue(next, { event });
        }
      });
      this.listen(root, "click", (event) => {
        const bounds = root.getBoundingClientRect?.();
        if (!bounds || !bounds.width) return;
        const ratio = (event.clientX - bounds.left) / bounds.width;
        this.setValue(this.options.min + ratio * (this.options.max - this.options.min), { event });
      });
    }
    return root;
  }

  percentage() {
    const range = this.options.max - this.options.min;
    return range ? ((this.value - this.options.min) / range) * 100 : 0;
  }

  setValue(value, { event = null, emitChange = true } = {}) {
    const next = clamp(value, this.options.min, this.options.max);
    const changed = next !== this.value;
    this.value = next;
    this.options.value = next;
    if (this.fill) this.fill.style.width = `${this.percentage()}%`;
    if (this.valueLabel && this.options.showValue) this.valueLabel.textContent = `${next}%`;
    if (this.root) setAttributes(this.root, { ariaValueNow: next, ariaValueText: `${next}`, dataState: next >= this.options.max ? "complete" : this.options.status });
    if (changed && emitChange) {
      this.emit("progress-bar:change", { event, value: next, percentage: this.percentage() });
      this.options.onChange?.(next, event, this.entity, this);
    }
    return this;
  }

  setIndeterminate(indeterminate) {
    this.options.indeterminate = Boolean(indeterminate);
    if (this.root) this.update();
    return this;
  }
}
