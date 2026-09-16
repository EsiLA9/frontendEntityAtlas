import {
  ComponentBase,
  appendContent,
  createElement,
  entityDescription,
  entityLabel,
  getDocument,
  setAttributes
} from "../primitives/ui-utils.js";

/** A persistent status message with semantic severity and optional dismissal. */
export class Alert extends ComponentBase {
  constructor(config = {}) {
    super(config);
    this.options = {
      title: entityLabel(this.entity, "Alert"),
      message: entityDescription(this.entity, ""),
      severity: "info",
      dismissible: false,
      dismissed: false,
      role: undefined,
      ...this.options
    };
    this.dismissed = Boolean(this.options.dismissed);
  }

  render() {
    const doc = getDocument(this.context);
    const { severity, title, message, dismissible } = this.options;
    const root = createElement(doc, "div", {
      className: `ui-alert ui-alert--${severity}${this.dismissed ? " is-dismissed" : ""}`,
      dataComponent: "alert",
      dataEntityId: this.entity.id,
      dataEntityEn: this.entity.en,
      dataState: this.dismissed ? "dismissed" : severity,
      role: this.options.role || (severity === "error" || severity === "warning" ? "alert" : "status"),
      ariaLive: severity === "error" ? "assertive" : "polite",
      hidden: this.dismissed
    });
    const body = createElement(doc, "div", { className: "ui-alert__body" });
    if (title) body.append(createElement(doc, "strong", { className: "ui-alert__title" }, [title]));
    appendContent(body, createElement(doc, "div", { className: "ui-alert__message" }, [message]));
    root.append(body);
    if (dismissible) {
      const close = createElement(doc, "button", {
        type: "button",
        className: "ui-alert__close",
        ariaLabel: "Dismiss alert"
      }, ["×"]);
      this.listen(close, "click", (event) => this.dismiss({ event, reason: "close-button" }));
      root.append(close);
      this.closeButton = close;
    }
    return root;
  }

  dismiss({ event = null, reason = "programmatic" } = {}) {
    if (this.dismissed) return this;
    this.dismissed = true;
    this.options.dismissed = true;
    if (this.root) {
      this.root.hidden = true;
      this.root.classList.add("is-dismissed");
      setAttributes(this.root, { dataState: "dismissed", ariaHidden: true });
    }
    this.emit("alert:dismiss", { event, reason });
    this.options.onDismiss?.(reason, event, this.entity, this);
    return this;
  }

  restore() {
    this.dismissed = false;
    this.options.dismissed = false;
    if (this.root) {
      this.root.hidden = false;
      this.root.classList.remove("is-dismissed");
      setAttributes(this.root, { dataState: this.options.severity, ariaHidden: false });
    }
    return this;
  }

  setMessage(message) {
    this.options.message = message;
    const messageNode = this.root?.querySelector(".ui-alert__message");
    if (messageNode) {
      messageNode.replaceChildren();
      appendContent(messageNode, message);
    }
    return this;
  }
}
