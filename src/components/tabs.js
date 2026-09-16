import {
  ComponentBase,
  appendContent,
  createElement,
  entityLabel,
  getDocument,
  makeId,
  setAttributes
} from "../primitives/ui-utils.js";

function normalizeTab(item, index) {
  if (typeof item === "string") return { id: `tab-${index + 1}`, label: item, content: "" };
  return {
    id: item.id || `tab-${index + 1}`,
    label: item.label || item.en || item.cn || `Tab ${index + 1}`,
    content: item.content ?? item.description ?? "",
    disabled: Boolean(item.disabled),
    ...item
  };
}

/** A WAI-ARIA tabs widget with arrow/Home/End keyboard navigation. */
export class Tabs extends ComponentBase {
  constructor(config = {}) {
    super(config);
    this.options = {
      label: entityLabel(this.entity, "Tabs"),
      items: [],
      activeId: undefined,
      orientation: "horizontal",
      ...this.options
    };
    this.items = (this.options.items.length ? this.options.items : (this.entity.tabs || this.entity.items || [])).map(normalizeTab);
    this.activeId = this.options.activeId || this.items.find((item) => !item.disabled)?.id || this.items[0]?.id;
    this.tabsId = makeId(this.context, this.entity.id || "tabs");
  }

  render() {
    const doc = getDocument(this.context);
    const root = createElement(doc, "div", {
      className: "ui-tabs",
      dataComponent: "tabs",
      dataEntityId: this.entity.id,
      dataEntityEn: this.entity.en,
      dataState: this.activeId,
      ariaLabel: this.options.label
    });
    const tabList = createElement(doc, "div", {
      className: "ui-tabs__list",
      role: "tablist",
      ariaOrientation: this.options.orientation
    });
    const panels = createElement(doc, "div", { className: "ui-tabs__panels" });
    const tabs = [];
    this.items.forEach((item, index) => {
      const tabId = `${this.tabsId}-tab-${index + 1}`;
      const panelId = `${this.tabsId}-panel-${index + 1}`;
      const selected = item.id === this.activeId;
      const tab = createElement(doc, "button", {
        type: "button",
        id: tabId,
        className: `ui-tabs__tab${selected ? " is-active" : ""}`,
        role: "tab",
        ariaSelected: selected,
        ariaControls: panelId,
        tabIndex: selected ? 0 : -1,
        disabled: item.disabled
      }, [item.label]);
      const panel = createElement(doc, "section", {
        id: panelId,
        className: "ui-tabs__panel",
        role: "tabpanel",
        ariaLabelledBy: tabId,
        tabIndex: 0,
        hidden: !selected
      });
      appendContent(panel, typeof item.render === "function" ? (docNode) => item.render({ item, entity: this.entity, context: this.context, document: docNode }) : item.content);
      this.listen(tab, "click", (event) => this.select(item.id, { event }));
      tabs.push(tab);
      tabList.append(tab);
      panels.append(panel);
    });
    this.listen(tabList, "keydown", (event) => this.handleKeydown(event, tabs));
    root.append(tabList, panels);
    this.tabList = tabList;
    this.tabNodes = tabs;
    return root;
  }

  handleKeydown(event, tabs) {
    const current = tabs.indexOf(event.target);
    if (current < 0) return;
    const horizontal = this.options.orientation !== "vertical";
    const forward = horizontal ? "ArrowRight" : "ArrowDown";
    const backward = horizontal ? "ArrowLeft" : "ArrowUp";
    let next = null;
    if (event.key === forward) next = this.findEnabled(current, 1, tabs);
    if (event.key === backward) next = this.findEnabled(current, -1, tabs);
    if (event.key === "Home") next = this.findEnabled(-1, 1, tabs);
    if (event.key === "End") next = this.findEnabled(tabs.length, -1, tabs);
    if (next != null) {
      event.preventDefault();
      tabs[next].focus();
      this.select(this.items[next].id, { event, focus: false });
    }
  }

  findEnabled(start, direction, tabs) {
    let index = start + direction;
    while (index >= 0 && index < tabs.length) {
      if (!this.items[index].disabled) return index;
      index += direction;
    }
    return null;
  }

  select(id, { event = null, focus = true, emitChange = true } = {}) {
    const item = this.items.find((candidate) => candidate.id === id);
    if (!item || item.disabled) return this;
    const changed = this.activeId !== id;
    this.activeId = id;
    this.options.activeId = id;
    if (!this.root) return this;
    this.root.dataset.state = id;
    this.tabNodes.forEach((tab, index) => {
      const selected = this.items[index].id === id;
      setAttributes(tab, { ariaSelected: selected, tabIndex: selected ? 0 : -1 });
      tab.classList.toggle("is-active", selected);
      const panel = this.root.ownerDocument.getElementById(tab.getAttribute("aria-controls"));
      if (panel) panel.hidden = !selected;
      if (selected && focus) tab.focus();
    });
    if (changed && emitChange) {
      this.emit("tabs:change", { event, activeId: id, item });
      this.options.onChange?.(item, event, this.entity, this);
    }
    return this;
  }

  setItems(items) {
    this.items = items.map(normalizeTab);
    this.activeId = this.items.find((item) => item.id === this.activeId && !item.disabled)?.id || this.items.find((item) => !item.disabled)?.id;
    if (this.root) this.update();
    return this;
  }
}
