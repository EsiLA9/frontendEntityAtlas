import { Button, ProgressBar, Skeleton, TextField, Toggle, Tooltip } from '../primitives/index.js';
import { Alert, Card, EntityDemo, Modal, Tabs } from '../components/index.js';

const constructors = Object.freeze({
  button: Button, 'icon-button': Button, 'link-button': Button,
  'text-field': TextField, 'search-field': TextField,
  switch: Toggle, toggle: Toggle, 'toggle-button': Toggle,
  progress: ProgressBar, 'progress-bar': ProgressBar,
  tooltip: Tooltip, 'hover-card': Tooltip, skeleton: Skeleton,
  alert: Alert, card: Card, tabs: Tabs,
});

function uiEntity(entity) {
  const use = entity.metadata?.use ?? entity.metadata?.legacyUse ?? entity.use ?? '';
  return {
    ...entity,
    en: entity.name?.en ?? entity.en ?? entity.id,
    cn: entity.name?.zh ?? entity.cn ?? entity.id,
    definition: entity.description?.en ?? entity.definition ?? '',
    use,
    metadata: { ...entity.metadata, use },
  };
}

function optionsFor(entity, context) {
  const source = uiEntity(entity);
  const renderer = entity.rendererId ?? entity.metadata?.preview?.renderer ?? entity.id;
  const common = { entity: source, context, ariaLabel: `${source.en} / ${source.cn}` };
  if (renderer === 'button' || renderer === 'icon-button' || renderer === 'link-button') return { ...common, label: source.metadata?.preview?.example ?? '保存 / Save', variant: 'primary' };
  if (renderer === 'text-field' || renderer === 'search-field') return { ...common, label: source.cn, placeholder: '输入内容…', helperText: source.use };
  if (renderer === 'switch' || renderer === 'toggle' || renderer === 'toggle-button') return { ...common, label: source.cn, onLabel: 'On / 开启', offLabel: 'Off / 关闭' };
  if (renderer === 'progress-bar' || renderer === 'progress') return { ...common, label: source.cn, value: 63, interactive: true };
  if (renderer === 'tabs') return { ...common, label: source.cn, items: [{ id: 'overview', label: '概览 Overview', content: '内容面板 Content panel' }, { id: 'details', label: '详情 Details', content: '更多信息 More details' }] };
  if (renderer === 'alert') return { ...common, title: source.cn, message: source.use, severity: 'success', dismissible: true };
  if (renderer === 'modal' || renderer === 'dialog') return { ...common, title: `${source.en} / ${source.cn}`, content: source.use, showCancel: true };
  if (renderer === 'tooltip' || renderer === 'hover-card') return { ...common, triggerLabel: 'ⓘ', content: source.use || source.definition };
  if (renderer === 'skeleton') return { ...common, lines: 2, width: '85%' };
  return { ...common, title: source.cn, subtitle: source.en, description: source.use || source.definition, clickable: false };
}

/** Mount the best available interactive implementation for an entity. */
export function renderPreview(entity, host, { emit = () => {} } = {}) {
  const rendererId = entity.rendererId ?? entity.metadata?.preview?.renderer ?? '';
  if (rendererId === 'modal' || rendererId === 'dialog') {
    const source = uiEntity(entity);
    const context = { document: host.ownerDocument, idPrefix: `preview-${entity.id}`, emit };
    const modal = new Modal(optionsFor(entity, context));
    modal.mount(host);
    const trigger = new Button({
      entity: source,
      context,
      label: '打开 / Open',
      variant: 'primary',
      onClick: () => modal.open({ reason: 'preview-trigger' }),
    });
    trigger.mount(host);
    return Object.freeze({ trigger, modal, destroy: () => { trigger.destroy(); modal.destroy(); } });
  }
  const Component = constructors[rendererId] ?? EntityDemo;
  const context = { document: host.ownerDocument, idPrefix: `preview-${entity.id}`, emit };
  const component = new Component(optionsFor(entity, context));
  component.mount(host);
  return component;
}

export function availableRendererIds() {
  return Object.freeze(Object.keys(constructors));
}
