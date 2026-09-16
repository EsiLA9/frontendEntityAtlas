import {
  ComponentBase,
  createElement,
  entityLabel,
  getDocument
} from "./ui-utils.js";

/** A content placeholder that exposes loading state to assistive technology. */
export class Skeleton extends ComponentBase {
  constructor(config = {}) {
    super(config);
    this.options = {
      label: entityLabel(this.entity, "Loading content"),
      lines: 1,
      width: "100%",
      height: "1rem",
      loaded: false,
      ...this.options
    };
  }

  render() {
    const doc = getDocument(this.context);
    const root = createElement(doc, "div", {
      className: `ui-skeleton${this.options.loaded ? " is-loaded" : ""}`,
      dataComponent: "skeleton",
      dataEntityId: this.entity.id,
      dataEntityEn: this.entity.en,
      dataState: this.options.loaded ? "loaded" : "loading",
      role: "status",
      ariaLabel: this.options.label,
      ariaBusy: !this.options.loaded,
      hidden: Boolean(this.options.loaded)
    });
    const lines = Math.max(1, Number(this.options.lines) || 1);
    for (let index = 0; index < lines; index += 1) {
      const line = createElement(doc, "span", {
        className: "ui-skeleton__line",
        ariaHidden: true,
        style: {
          width: index === lines - 1 && lines > 1 ? "72%" : this.options.width,
          height: this.options.height
        }
      });
      root.append(line);
    }
    return root;
  }

  setLoaded(loaded) {
    this.options.loaded = Boolean(loaded);
    if (this.root) this.update();
    return this;
  }
}
