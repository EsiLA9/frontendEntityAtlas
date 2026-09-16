/** Detail view for one entity. Content remains data-driven and renderer-agnostic. */
export function createDetailView({ root, registry, emit = () => {} }) {
  const getEntity = id => {
    if (typeof registry.get === 'function') return registry.get(id);
    return (typeof registry.getAll === 'function' ? registry.getAll() : registry).find(entity => entity.id === id);
  };

  const render = id => {
    const entity = getEntity(id);
    if (!entity) return false;
    const name = entity.name ?? { en: entity.en ?? '', zh: entity.cn ?? '' };
    const description = entity.description ?? { en: entity.definition ?? '', zh: entity.definition ?? '' };
    root.innerHTML = `<div class="meta">${entity.type ?? entity.layer ?? 'ENTITY'} · ${entity.family ?? ''}</div><h2 class="dialog-title">${name.en}</h2><div class="dialog-cn">${name.zh}</div><p>${description.zh || description.en}</p>`;
    const englishUse = entity.metadata?.legacyUse ?? entity.metadata?.use ?? entity.use ?? '';
    const chineseUse = entity.metadata?.legacyUseZh ?? '';
    const use = chineseUse ? `${chineseUse} / ${englishUse}` : englishUse;
    appendList(root, 'Common use / 常见用途', use ? [use] : []);
    appendList(root, 'Variants / 变体', entity.variants);
    appendList(root, 'States / 状态', entity.states);
    appendList(root, 'Parts / 组成', entity.parts);
    appendList(root, 'Behaviors / 行为', entity.behaviors);
    emit('entity:detail-rendered', { entityId: id });
    return true;
  };

  return { render, clear: () => { root.innerHTML = ''; } };
}

function appendList(root, title, values = []) {
  if (!values?.length) return;
  const block = document.createElement('section');
  block.className = 'dialog-block';
  const heading = document.createElement('h4');
  heading.textContent = title;
  block.append(heading);
  const list = document.createElement('div');
  list.className = 'states';
  values.forEach(value => {
    const item = document.createElement('span');
    item.className = 'state';
    item.textContent = typeof value === 'string'
      ? value
      : value.label ?? value.name?.zh ?? value.name?.en ?? value.name ?? '';
    list.append(item);
  });
  block.append(list);
  root.append(block);
}
