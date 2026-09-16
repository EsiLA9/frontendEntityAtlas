import {
  ComponentBase,
  createElement,
  getDocument,
  isActivationKey,
} from '../primitives/ui-utils.js';

const text = value => String(value ?? '');
const entityLabel = entity => entity.name?.zh ?? entity.cn ?? entity.name?.en ?? entity.en ?? entity.id ?? 'Entity';
const entityEnglish = entity => entity.name?.en ?? entity.en ?? entity.id ?? 'Entity';

/**
 * A small, framework-free demo for entities that do not yet have a dedicated
 * renderer. It deliberately demonstrates behavior, not just appearance.
 */
export class EntityDemo extends ComponentBase {
  constructor(config = {}) {
    super(config);
    this.options = { ...this.options, ...config };
    this.entity = config.entity ?? this.entity;
    this.statusText = 'Ready / 就绪';
    this.step = 1;
  }

  render() {
    const doc = getDocument(this.context);
    const root = createElement(doc, 'div', {
      className: 'entity-demo',
      dataComponent: 'entity-demo',
      dataEntityId: this.entity.id,
      dataState: 'ready',
    });
    const stage = createElement(doc, 'div', { className: 'entity-demo__stage' });
    const caption = createElement(doc, 'div', { className: 'entity-demo__caption' }, [
      createElement(doc, 'span', { className: 'entity-demo__eyebrow' }, [entityEnglish(this.entity)]),
      createElement(doc, 'span', { className: 'entity-demo__hint' }, ['LIVE MINI DEMO']),
    ]);
    const status = createElement(doc, 'output', { className: 'entity-demo__status', ariaLive: 'polite' }, [this.statusText]);
    this.status = status;
    this.buildDemo(doc, stage);
    root.append(caption, stage, status);
    return root;
  }

  kind() {
    return text(this.entity.rendererId ?? this.entity.preview?.renderer ?? this.entity.metadata?.preview?.renderer ?? this.entity.id).toLowerCase();
  }

  scenario() {
    return text(this.entity.preview?.scenario ?? this.entity.metadata?.preview?.scenario).toLowerCase();
  }

  has(...values) {
    const value = this.kind();
    return values.includes(value) || values.some(item => value.includes(item));
  }

  setStatus(message, state = 'active') {
    this.statusText = message;
    if (this.status) this.status.textContent = message;
    if (this.root) this.root.dataset.state = state;
    this.emit('entity-demo:change', { state, message });
  }

  control(doc, tag, label, handler, attributes = {}) {
    const button = createElement(doc, tag, { ...attributes, type: tag === 'button' ? 'button' : undefined }, [label]);
    if (handler) this.listen(button, 'click', handler);
    return button;
  }

  buildDemo(doc, stage) {
    const scenario = this.scenario();
    if (scenario && typeof this[`buildScenario_${scenario.replace(/[^a-z0-9]+/g, '_')}`] === 'function') {
      this[`buildScenario_${scenario.replace(/[^a-z0-9]+/g, '_')}`](doc, stage);
      return;
    }
    const kind = this.kind();
    if (this.has('button', 'action', 'command', 'shortcut')) return this.buildAction(doc, stage);
    if (this.has('text-field', 'textarea', 'search', 'reference', 'code-viewer')) return this.buildText(doc, stage);
    if (this.has('number', 'range', 'vector', 'bounds', 'slider')) return this.buildNumber(doc, stage);
    if (this.has('checkbox')) return this.buildCheckbox(doc, stage);
    if (this.has('radio', 'segmented', 'enum')) return this.buildChoice(doc, stage);
    if (this.has('select', 'combobox', 'picker')) return this.buildSelect(doc, stage);
    if (this.has('date', 'time')) return this.buildDate(doc, stage);
    if (this.has('color')) return this.buildColor(doc, stage);
    if (this.has('file', 'asset', 'resource')) return this.buildFile(doc, stage);
    if (this.has('breadcrumb', 'pagination', 'sidebar', 'navigation', 'menu', 'link')) return this.buildNavigation(doc, stage);
    if (this.has('accordion', 'collapsible', 'disclosure')) return this.buildDisclosure(doc, stage);
    if (this.has('alert', 'toast', 'snackbar', 'notification', 'activity', 'history')) return this.buildFeedback(doc, stage);
    if (this.has('dialog', 'drawer', 'sheet', 'popover', 'hover-card', 'confirmation')) return this.buildOverlay(doc, stage);
    if (this.has('table', 'grid', 'list', 'tree', 'property', 'definition', 'json', 'badge', 'tag', 'chip', 'avatar', 'display')) return this.buildDataDisplay(doc, stage);
    if (this.has('layout', 'stack', 'flex', 'split', 'container', 'panel', 'scroll')) return this.buildLayout(doc, stage);
    if (this.has('drag', 'reorder', 'sortable')) return this.buildDrag(doc, stage);
    if (this.has('wizard', 'stepper')) return this.buildStepper(doc, stage);
    if (this.has('master', 'inspector', 'browser', 'explorer')) return this.buildMasterDetail(doc, stage);
    if (this.has('carousel', 'media', 'image')) return this.buildCarousel(doc, stage);
    if (this.has('chart', 'dashboard', 'timeline', 'graph', 'canvas', 'workspace')) return this.buildWorkspace(doc, stage);
    if (this.has('filter', 'query', 'editor', 'builder', 'preview', 'diff', 'object', 'collection')) return this.buildEditor(doc, stage);
    return this.buildGeneric(doc, stage);
  }

  buildScenario_menu(doc, stage) {
    const trigger = this.control(doc, 'button', '⋯ 更多操作 / More', () => { menu.hidden = !menu.hidden; this.setStatus(menu.hidden ? 'Menu closed / 菜单已关闭' : 'Menu open / 菜单已打开'); }, { className: 'entity-demo__primary', ariaHaspopup: 'menu', ariaExpanded: 'false' });
    const menu = createElement(doc, 'div', { className: 'entity-demo__menu', role: 'menu', hidden: true });
    [['✎ 重命名 / Rename', 'Renamed'], ['⧉ 复制 / Duplicate', 'Duplicated'], ['✓ 显示网格 / Show grid', 'Grid toggled'], ['🗑 删除 / Delete', 'Delete requested']].forEach(([label, result], index) => {
      if (index === 2) menu.append(createElement(doc, 'div', { className: 'entity-demo__separator', role: 'separator' }));
      const item = this.control(doc, 'button', label, () => { if (index !== 3) menu.hidden = true; this.setStatus(`${result} / ${label.split(' / ')[0]}`); }, { className: 'entity-demo__menu-item', role: 'menuitem' });
      menu.append(item);
    });
    stage.append(trigger, menu);
  }

  buildScenario_context_menu(doc, stage) {
    const target = createElement(doc, 'div', { className: 'entity-demo__context-target', tabIndex: 0 }, ['document.md · 右键这里 / Right-click here']);
    const menu = createElement(doc, 'div', { className: 'entity-demo__menu entity-demo__context-popup', role: 'menu', hidden: true });
    ['打开 / Open', '重命名 / Rename', '复制 / Duplicate', '删除 / Delete'].forEach(label => {
      const item = this.control(doc, 'button', label, () => { menu.hidden = true; this.setStatus(`Context action: ${label}`); }, { className: 'entity-demo__menu-item', role: 'menuitem' });
      menu.append(item);
    });
    this.listen(target, 'contextmenu', event => { event.preventDefault(); menu.hidden = false; menu.style.left = `${Math.min(event.offsetX, 120)}px`; menu.style.top = `${Math.min(event.offsetY, 45)}px`; this.setStatus('Context menu open / 上下文菜单已打开'); });
    stage.append(createElement(doc, 'div', { className: 'entity-demo__context-shell' }, [target, menu]));
  }

  buildScenario_link(doc, stage) {
    const link = createElement(doc, 'a', { className: 'entity-demo__real-link', href: '#documentation' }, ['打开文档 / Open documentation ↗']);
    this.listen(link, 'click', () => this.setStatus('Navigated to documentation / 已导航到文档'));
    stage.append(link);
  }

  buildScenario_breadcrumb(doc, stage) {
    const nav = createElement(doc, 'nav', { className: 'entity-demo__breadcrumb', ariaLabel: 'Breadcrumb' });
    ['Home', 'Projects', 'Atlas', 'Components'].forEach((label, index, items) => { nav.append(createElement(doc, 'a', { href: `#${label.toLowerCase()}` }, [label])); if (index < items.length - 1) nav.append(createElement(doc, 'span', { ariaHidden: 'true' }, [' / '])); });
    this.listen(nav, 'click', event => { if (event.target.tagName === 'A') this.setStatus(`Ancestor: ${event.target.textContent}`); });
    stage.append(nav);
  }

  buildScenario_pagination(doc, stage) {
    let page = 3;
    const collection = createElement(doc, 'div', { className: 'entity-demo__collection' }, ['Results 21–30 of 120 / 第 21–30 条，共 120 条']);
    const controls = createElement(doc, 'div', { className: 'entity-demo__pagination', role: 'navigation', ariaLabel: 'Pagination' });
    const render = () => { controls.replaceChildren(); [['‹', -1], ['1', 1], ['2', 2], ['3', 3], ['4', 4], ['›', 1]].forEach(([label, delta], index) => { const button = this.control(doc, 'button', label, () => { page = index === 0 ? Math.max(1, page - 1) : index === 5 ? Math.min(12, page + 1) : delta; collection.textContent = `Results ${(page - 1) * 10 + 1}–${page * 10} of 120 / 第 ${(page - 1) * 10 + 1}–${page * 10} 条，共 120 条`; render(); this.setStatus(`Page ${page} / 第 ${page} 页`); }, { className: page === delta && index > 0 && index < 5 ? 'is-selected' : '', ariaCurrent: page === delta && index > 0 && index < 5 ? 'page' : undefined }); controls.append(button); }); };
    render(); stage.append(collection, controls);
  }

  buildScenario_split_pane(doc, stage) {
    const shell = createElement(doc, 'div', { className: 'entity-demo__split-pane' });
    const left = createElement(doc, 'div', { className: 'entity-demo__pane' }, ['Navigator']);
    const divider = createElement(doc, 'button', { className: 'entity-demo__divider', ariaLabel: 'Resize panes', title: 'Drag to resize' }, ['⋮']);
    const right = createElement(doc, 'div', { className: 'entity-demo__pane' }, ['Editor']);
    let resizing = false;
    this.listen(divider, 'pointerdown', event => { resizing = true; divider.setPointerCapture?.(event.pointerId); });
    this.listen(divider, 'pointermove', event => { if (!resizing) return; const rect = shell.getBoundingClientRect(); const ratio = Math.max(.25, Math.min(.75, (event.clientX - rect.left) / rect.width)); shell.style.setProperty('--split', `${ratio * 100}%`); this.setStatus(`Pane width ${Math.round(ratio * 100)}% / 面板宽度`); });
    this.listen(divider, 'pointerup', () => { resizing = false; });
    shell.append(left, divider, right); stage.append(shell, createElement(doc, 'small', { className: 'entity-demo__constraint-note' }, ['drag divider · resizable adjacent panes / 拖动分隔线调整相邻面板']));
  }

  buildScenario_text(doc, stage) { stage.append(createElement(doc, 'div', { className: 'entity-demo__text-sample' }, [createElement(doc, 'strong', {}, ['Heading / 标题']), createElement(doc, 'p', {}, ['Control how the workspace looks and behaves. / 控制工作区的外观与行为。']), createElement(doc, 'small', {}, ['Caption · Last updated 2 minutes ago / 说明文字'])])); }
  buildScenario_icon(doc, stage) { stage.append(createElement(doc, 'div', { className: 'entity-demo__icon-sample' }, ['ⓘ Information', '✓ Success', '⚠ Warning', '✕ Error'])); }
  buildScenario_avatar(doc, stage) { stage.append(createElement(doc, 'div', { className: 'entity-demo__avatar-sample' }, [createElement(doc, 'span', {}, ['AS']), createElement(doc, 'strong', {}, ['Airi Sato']), createElement(doc, 'small', {}, ['fallback initials / 首字母回退'])])); }
  buildScenario_badge(doc, stage) { stage.append(createElement(doc, 'div', { className: 'entity-demo__badge-sample' }, ['Inbox ', createElement(doc, 'b', {}, ['12']), ' Build ', createElement(doc, 'b', {}, ['Failed'])])); }

  buildScenario_filter(doc, stage) {
    const items = [['Yuuka', 'Millennium'], ['Noa', 'Millennium'], ['Hina', 'Gehenna'], ['Aru', 'Gehenna'], ['Hoshino', 'Abydos'], ['Shiroko', 'Abydos']];
    const list = createElement(doc, 'div', { className: 'entity-demo__filter-list' }); const select = createElement(doc, 'select', { ariaLabel: 'School filter' }, ['All schools', 'Millennium', 'Gehenna', 'Abydos'].map(value => createElement(doc, 'option', { value }, [value]))); const apply = this.control(doc, 'button', 'Apply / 应用', () => { const selected = select.value; const filtered = selected === 'All schools' ? items : items.filter(([, school]) => school === selected); list.replaceChildren(...filtered.map(([name, school]) => createElement(doc, 'div', {}, [`${name} · ${school}`]))); this.setStatus(`${filtered.length} results / 个结果`); }); apply.click(); stage.append(createElement(doc, 'div', { className: 'entity-demo__before-after' }, [createElement(doc, 'strong', {}, ['Collection · 6 students / 集合 · 6 名学生']), select, apply]), list);
  }

  buildScenario_undo_redo(doc, stage) { let value = 'A'; const canvas = createElement(doc, 'div', { className: 'entity-demo__history-canvas' }, ['Canvas: A']); const history = []; let cursor = 0; const update = () => { canvas.textContent = `Canvas: ${value}`; undo.disabled = cursor === 0; redo.disabled = cursor === history.length; }; const edit = this.control(doc, 'button', 'Edit → B', () => { history.splice(cursor); history.push(value = 'B'); cursor = history.length; update(); }); const undo = this.control(doc, 'button', 'Undo ↶', () => { cursor--; value = cursor ? history[cursor - 1] : 'A'; update(); this.setStatus('Undo → A / 已撤销'); }); const redo = this.control(doc, 'button', 'Redo ↷', () => { value = history[cursor]; cursor++; update(); this.setStatus('Redo → B / 已重做'); }); stage.append(canvas, edit, undo, redo); update(); }

  buildScenario_diff(doc, stage) { stage.append(createElement(doc, 'div', { className: 'entity-demo__diff' }, [createElement(doc, 'pre', {}, ['Before\nname: "A"\nlevel: 2']), createElement(doc, 'pre', {}, ['After\nname: "B"\nlevel: 3\n+ enabled: true'])])); }

  buildAction(doc, stage) {
    const button = this.control(doc, 'button', '执行动作 / Run action', () => {
      button.textContent = '✓ 已触发 / Triggered';
      this.setStatus('Action emitted / 动作已触发');
    }, { className: 'entity-demo__primary' });
    stage.append(button);
  }

  buildText(doc, stage) {
    const field = createElement(doc, this.has('textarea') ? 'textarea' : 'input', { className: 'entity-demo__input', placeholder: '输入内容 / Type here…', ariaLabel: entityLabel(this.entity) });
    if (field.tagName === 'TEXTAREA') field.rows = 2;
    this.listen(field, 'input', () => this.setStatus(`Value: ${field.value || 'empty'} / 已输入`));
    stage.append(field);
  }

  buildNumber(doc, stage) {
    const field = createElement(doc, 'input', { className: 'entity-demo__input entity-demo__number', type: 'number', min: 0, max: 100, value: 40, ariaLabel: entityLabel(this.entity) });
    const minus = this.control(doc, 'button', '−', () => { field.stepDown(); this.setStatus(`Value: ${field.value}`); });
    const plus = this.control(doc, 'button', '+', () => { field.stepUp(); this.setStatus(`Value: ${field.value}`); });
    stage.append(minus, field, plus);
  }

  buildCheckbox(doc, stage) {
    const label = createElement(doc, 'label', { className: 'entity-demo__choice' });
    const input = createElement(doc, 'input', { type: 'checkbox' });
    const textNode = createElement(doc, 'span', {}, ['选择这一项 / Select this option']);
    label.append(input, textNode);
    this.listen(input, 'change', () => this.setStatus(input.checked ? 'Checked / 已选中' : 'Unchecked / 未选中'));
    stage.append(label);
  }

  buildChoice(doc, stage) {
    const group = createElement(doc, 'div', { className: 'entity-demo__choice-group', role: 'radiogroup', ariaLabel: entityLabel(this.entity) });
    ['Option A / 选项 A', 'Option B / 选项 B', 'Option C / 选项 C'].forEach((labelText, index) => {
      const label = createElement(doc, 'label', { className: 'entity-demo__choice' });
      const input = createElement(doc, 'input', { type: 'radio', name: `demo-${this.entity.id}`, checked: index === 0 });
      this.listen(input, 'change', () => { if (input.checked) this.setStatus(`Selected: ${labelText}`); });
      label.append(input, labelText);
      group.append(label);
    });
    stage.append(group);
  }

  buildSelect(doc, stage) {
    const select = createElement(doc, 'select', { className: 'entity-demo__select', ariaLabel: entityLabel(this.entity) });
    ['Default / 默认', 'Primary / 主要', 'Secondary / 次要'].forEach((label, index) => select.append(createElement(doc, 'option', { value: index }, [label])));
    this.listen(select, 'change', () => this.setStatus(`Selected: ${select.options[select.selectedIndex].textContent}`));
    stage.append(select);
  }

  buildDate(doc, stage) {
    const input = createElement(doc, 'input', { className: 'entity-demo__input', type: this.has('time') ? 'datetime-local' : 'date', ariaLabel: entityLabel(this.entity) });
    this.listen(input, 'change', () => this.setStatus(input.value ? `Selected: ${input.value}` : 'No date / 未选择日期'));
    stage.append(input);
  }

  buildColor(doc, stage) {
    const input = createElement(doc, 'input', { className: 'entity-demo__color', type: 'color', value: '#ff745e', ariaLabel: entityLabel(this.entity) });
    this.listen(input, 'input', () => this.setStatus(`Color: ${input.value}`));
    stage.append(input);
  }

  buildFile(doc, stage) {
    const input = createElement(doc, 'input', { className: 'entity-demo__file', type: 'file', ariaLabel: entityLabel(this.entity) });
    const label = createElement(doc, 'label', { className: 'entity-demo__file-label' }, ['选择文件 / Choose file']);
    label.append(input);
    this.listen(input, 'change', () => this.setStatus(input.files?.[0] ? `Selected: ${input.files[0].name}` : 'No file / 未选择文件'));
    stage.append(label);
  }

  buildNavigation(doc, stage) {
    const nav = createElement(doc, 'nav', { className: 'entity-demo__nav', ariaLabel: entityLabel(this.entity) });
    ['Home', 'Entities', 'Current'].forEach((label, index) => {
      const link = this.control(doc, 'button', label + (index === 2 ? ' · 当前' : ''), () => {
        nav.querySelectorAll('button').forEach(item => item.classList.remove('is-active'));
        link.classList.add('is-active');
        this.setStatus(`Navigated to ${label}`);
      }, { className: index === 2 ? 'is-active' : '' });
      nav.append(link);
    });
    stage.append(nav);
  }

  buildDisclosure(doc, stage) {
    const disclosure = createElement(doc, 'details', { className: 'entity-demo__disclosure' });
    const summary = createElement(doc, 'summary', {}, ['展开说明 / Show details']);
    const content = createElement(doc, 'p', {}, [this.entity.metadata?.use ?? '附加内容 / Additional content']);
    disclosure.append(summary, content);
    this.listen(disclosure, 'toggle', () => this.setStatus(disclosure.open ? 'Expanded / 已展开' : 'Collapsed / 已收起'));
    stage.append(disclosure);
  }

  buildFeedback(doc, stage) {
    const message = createElement(doc, 'div', { className: 'entity-demo__message' }, ['✓ 操作成功 / Action succeeded']);
    const dismiss = this.control(doc, 'button', '×', () => { message.hidden = true; this.setStatus('Dismissed / 已关闭'); }, { className: 'entity-demo__dismiss', ariaLabel: 'Dismiss' });
    stage.append(message, dismiss);
  }

  buildOverlay(doc, stage) {
    const trigger = this.control(doc, 'button', '打开 / Open', () => {
      panel.hidden = !panel.hidden;
      this.setStatus(panel.hidden ? 'Closed / 已关闭' : 'Open / 已打开');
    }, { className: 'entity-demo__primary' });
    const panel = createElement(doc, 'div', { className: 'entity-demo__panel', hidden: true }, [
      createElement(doc, 'strong', {}, [`${entityEnglish(this.entity)} / ${entityLabel(this.entity)}`]),
      createElement(doc, 'span', {}, [this.entity.metadata?.use ?? 'Focused surface / 聚焦内容']),
    ]);
    stage.append(trigger, panel);
  }

  buildDataDisplay(doc, stage) {
    if (this.has('table', 'grid')) {
      const table = createElement(doc, 'table', { className: 'entity-demo__table' });
      const head = createElement(doc, 'thead');
      head.append(createElement(doc, 'tr', {}, ['Name / 名称', 'State / 状态'].map(label => createElement(doc, 'th', {}, [label]))));
      const body = createElement(doc, 'tbody');
      ['Button', 'Select', 'Dialog'].forEach((label, index) => {
        const row = createElement(doc, 'tr', { tabIndex: 0 });
        row.append(createElement(doc, 'td', {}, [label]), createElement(doc, 'td', {}, [index === 1 ? 'Active' : 'Ready']));
        this.listen(row, 'click', () => { body.querySelectorAll('tr').forEach(item => item.classList.remove('is-selected')); row.classList.add('is-selected'); this.setStatus(`Selected row: ${label}`); });
        body.append(row);
      });
      table.append(head, body);
      stage.append(table);
      return;
    }
    const list = createElement(doc, 'div', { className: 'entity-demo__list' });
    ['Primary item / 主项目', 'Secondary item / 次项目', 'More items / 更多项目'].forEach(label => {
      const item = this.control(doc, 'button', label, () => { list.querySelectorAll('button').forEach(node => node.classList.remove('is-selected')); item.classList.add('is-selected'); this.setStatus(`Selected: ${label}`); }, { className: 'entity-demo__list-item' });
      list.append(item);
    });
    stage.append(list);
  }

  buildLayout(doc, stage) {
    const layout = createElement(doc, 'div', { className: `entity-demo__layout ${this.has('split') ? 'is-split' : ''}` });
    ['A', 'B', 'C'].forEach(label => layout.append(createElement(doc, 'span', {}, [label])));
    const swap = this.control(doc, 'button', '切换布局 / Switch', () => { layout.classList.toggle('is-split'); this.setStatus('Layout changed / 布局已改变'); });
    stage.append(layout, swap);
  }

  buildDrag(doc, stage) {
    const list = createElement(doc, 'div', { className: 'entity-demo__drag-list' });
    ['Layer A', 'Layer B', 'Layer C'].forEach(label => {
      const item = createElement(doc, 'button', { className: 'entity-demo__drag-item', draggable: true }, [`≡ ${label}`]);
      this.listen(item, 'dragstart', () => { item.classList.add('is-dragging'); this.setStatus(`Dragging: ${label}`); });
      this.listen(item, 'dragend', () => { item.classList.remove('is-dragging'); this.setStatus('Dropped / 已放置'); });
      this.listen(item, 'click', () => { list.append(item); this.setStatus(`Reordered: ${label}`); });
      list.append(item);
    });
    stage.append(list);
  }

  buildStepper(doc, stage) {
    const label = createElement(doc, 'strong', {}, [`Step ${this.step} / 步骤 ${this.step}`]);
    const steps = createElement(doc, 'div', { className: 'entity-demo__steps' }, ['01 基础', '02 内容', '03 发布']);
    const back = this.control(doc, 'button', '←', () => { this.step = Math.max(1, this.step - 1); label.textContent = `Step ${this.step} / 步骤 ${this.step}`; this.setStatus('Previous step / 上一步'); });
    const next = this.control(doc, 'button', '→', () => { this.step = this.step >= 3 ? 1 : this.step + 1; label.textContent = `Step ${this.step} / 步骤 ${this.step}`; this.setStatus('Next step / 下一步'); });
    stage.append(steps, label, back, next);
  }

  buildMasterDetail(doc, stage) {
    const shell = createElement(doc, 'div', { className: 'entity-demo__master-detail' });
    const master = createElement(doc, 'div', { className: 'entity-demo__master' });
    const detail = createElement(doc, 'div', { className: 'entity-demo__detail' }, ['Select an item / 选择项目']);
    ['Entity A', 'Entity B', 'Entity C'].forEach(label => {
      const item = this.control(doc, 'button', label, () => { detail.textContent = `${label} · properties / 属性`; master.querySelectorAll('button').forEach(node => node.classList.remove('is-selected')); item.classList.add('is-selected'); this.setStatus(`Selected: ${label}`); }, { className: 'entity-demo__list-item' });
      master.append(item);
    });
    shell.append(master, detail);
    stage.append(shell);
  }

  buildCarousel(doc, stage) {
    let index = 1;
    const slide = createElement(doc, 'div', { className: 'entity-demo__slide' }, [`Slide ${index} / 幻灯片 ${index}`]);
    const prev = this.control(doc, 'button', '‹', () => { index = index <= 1 ? 3 : index - 1; slide.textContent = `Slide ${index} / 幻灯片 ${index}`; this.setStatus(`Slide ${index}`); });
    const next = this.control(doc, 'button', '›', () => { index = index >= 3 ? 1 : index + 1; slide.textContent = `Slide ${index} / 幻灯片 ${index}`; this.setStatus(`Slide ${index}`); });
    stage.append(prev, slide, next);
  }

  buildWorkspace(doc, stage) {
    const workspace = createElement(doc, 'div', { className: 'entity-demo__workspace' });
    ['Node A', 'Node B', 'Node C'].forEach((label, index) => {
      const node = createElement(doc, 'button', { className: 'entity-demo__node', draggable: true, style: { '--node-index': index } }, [label]);
      this.listen(node, 'click', () => { node.classList.toggle('is-selected'); this.setStatus(`${label} selected / 已选择`); });
      this.listen(node, 'dragend', () => this.setStatus(`${label} moved / 已移动`));
      workspace.append(node);
    });
    stage.append(workspace);
  }

  buildEditor(doc, stage) {
    const row = createElement(doc, 'div', { className: 'entity-demo__editor' });
    const select = createElement(doc, 'select', { ariaLabel: 'Editor field' }, ['AND / 且', 'OR / 或'].map((label, index) => createElement(doc, 'option', { value: index }, [label])));
    const input = createElement(doc, 'input', { className: 'entity-demo__input', value: 'value', ariaLabel: 'Editor value' });
    const save = this.control(doc, 'button', '应用 / Apply', () => this.setStatus(`Applied ${select.value}: ${input.value}`), { className: 'entity-demo__primary' });
    row.append(select, input, save);
    stage.append(row);
  }

  buildGeneric(doc, stage) {
    const button = this.control(doc, 'button', '切换状态 / Toggle state', () => {
      const active = this.root?.dataset.state === 'active';
      this.setStatus(active ? 'Ready / 就绪' : 'Active / 已激活', active ? 'ready' : 'active');
    }, { className: 'entity-demo__primary' });
    const note = createElement(doc, 'span', { className: 'entity-demo__generic-note' }, [`${this.entity.states?.length ?? 0} states · ${this.entity.behaviors?.length ?? 0} behaviors`]);
    stage.append(button, note);
  }
}

export default EntityDemo;
