import {
  ComponentBase,
  appendContent,
  createElement,
  entityDescription,
  entityLabel,
  getDocument,
  makeId,
  setAttributes
} from "../primitives/ui-utils.js";

/** A native dialog with a predictable open/close event contract. */
export class Modal extends ComponentBase {
  constructor(config = {}) {
    super(config);
    this.options = {
      title: entityLabel(this.entity, "Dialog"),
      content: entityDescription(this.entity, ""),
      dismissible: true,
      closeOnBackdrop: true,
      confirmLabel: "Confirm",
      cancelLabel: "Cancel",
      showCancel: false,
      open: false,
      busy: false,
      ...this.options
    };
    this.titleId = makeId(this.context, this.entity.id || "modal");
    this._closeReason = "native";
  }

  render() {
    const doc = getDocument(this.context);
    const dialog = createElement(doc, "dialog", {
      className: "ui-modal",
      dataComponent: "modal",
      dataEntityId: this.entity.id,
      dataEntityEn: this.entity.en,
      ariaModal: true,
      ariaLabelledBy: this.titleId
    });
    const surface = createElement(doc, "div", { className: "ui-modal__surface" });
    const header = createElement(doc, "header", { className: "ui-modal__header" });
    const title = createElement(doc, "h2", { id: this.titleId, className: "ui-modal__title" }, [this.options.title]);
    header.append(title);
    if (this.options.dismissible) {
      const close = createElement(doc, "button", { type: "button", className: "ui-modal__close", ariaLabel: "Close dialog" }, ["×"]);
      this.listen(close, "click", (event) => this.close({ event, reason: "close-button" }));
      header.append(close);
      this.closeButton = close;
    }
    const body = createElement(doc, "div", { className: "ui-modal__body" });
    appendContent(body, typeof this.options.content === "function"
      ? (docNode) => this.options.content({ entity: this.entity, context: this.context, document: docNode })
      : this.options.content);
    const footer = createElement(doc, "footer", { className: "ui-modal__footer" });
    if (this.options.showCancel) {
      const cancel = createElement(doc, "button", { type: "button", className: "ui-button ui-button--secondary" }, [this.options.cancelLabel]);
      this.listen(cancel, "click", (event) => {
        this.emit("modal:cancel", { event });
        this.options.onCancel?.(event, this.entity, this);
        this.close({ event, reason: "cancel" });
      });
      footer.append(cancel);
      this.cancelButton = cancel;
    }
    if (this.options.confirmLabel) {
      const confirm = createElement(doc, "button", {
        type: "button",
        className: "ui-button ui-button--primary",
        disabled: this.options.busy,
        ariaBusy: this.options.busy
      }, [this.options.busy ? "Working…" : this.options.confirmLabel]);
      this.listen(confirm, "click", (event) => {
        if (this.options.busy) return;
        this.emit("modal:confirm", { event });
        this.options.onConfirm?.(event, this.entity, this);
      });
      footer.append(confirm);
      this.confirmButton = confirm;
    }
    surface.append(header, body, footer);
    dialog.append(surface);

    this.listen(dialog, "cancel", (event) => {
      if (!this.options.dismissible) {
        event.preventDefault();
        return;
      }
      this._closeReason = "escape";
    });
    this.listen(dialog, "click", (event) => {
      if (this.options.closeOnBackdrop && event.target === dialog) this.close({ event, reason: "backdrop" });
    });
    this.listen(dialog, "close", (event) => {
      this.options.open = false;
      this.emit("modal:close", { event, reason: this._closeReason });
      this.options.onClose?.(this._closeReason, event, this.entity, this);
      this._closeReason = "native";
    });
    return dialog;
  }

  open({ reason = "programmatic" } = {}) {
    if (!this.root) return this;
    if (this.root.open) return this;
    this.options.open = true;
    if (typeof this.root.showModal === "function" && this.root.isConnected) {
      try {
        this.root.showModal();
      } catch {
        this.root.setAttribute("open", "");
      }
    } else {
      this.root.setAttribute("open", "");
    }
    this.emit("modal:open", { reason });
    (this.confirmButton || this.cancelButton || this.closeButton)?.focus();
    return this;
  }

  close({ event = null, reason = "programmatic" } = {}) {
    if (!this.root) return this;
    this._closeReason = reason;
    if (typeof this.root.close === "function" && this.root.open) this.root.close();
    else if (this.root.hasAttribute("open")) {
      this.root.removeAttribute("open");
      this.options.open = false;
      this.emit("modal:close", { event, reason });
    }
    return this;
  }

  setBusy(busy) {
    this.options.busy = Boolean(busy);
    if (this.confirmButton) {
      this.confirmButton.disabled = this.options.busy;
      this.confirmButton.textContent = this.options.busy ? "Working…" : this.options.confirmLabel;
      setAttributes(this.confirmButton, { ariaBusy: this.options.busy });
    }
    return this;
  }
}
