/**
 * Gallery view. It knows how to display and filter entities, but not where
 * entity data comes from or how a preview is implemented.
 */
export function createAtlasView({ root, registry, renderPreview, emit = () => {} }) {
  let category = 'all';
  let query = '';

  const getEntities = () => {
    if (typeof registry.getAll === 'function') return registry.getAll();
    if (typeof registry.list === 'function') return registry.list();
    return Array.isArray(registry) ? registry : [];
  };

  const matches = entity => {
    const text = [entity.en, entity.cn, entity.name?.en, entity.name?.zh, entity.family, entity.type, entity.layer, entity.definition, entity.description?.en, entity.description?.zh, entity.use, entity.metadata?.use]
      .filter(Boolean).join(' ').toLocaleLowerCase();
    const inCategory = category === 'all' || entity.family === category || entity.category === category;
    return inCategory && text.includes(query);
  };

  const draw = () => {
    const entities = getEntities().filter(matches);
    root.innerHTML = '';
    root.setAttribute('aria-live', 'polite');

    if (!entities.length) {
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = '没有匹配的实体。试试英文、中文或组件用途。';
      root.append(empty);
      return;
    }

    entities.forEach((entity, index) => {
      const card = document.createElement('article');
      card.className = 'entity-card';
      card.tabIndex = 0;
      card.dataset.entityId = entity.id;
      const name = entity.name ?? { en: entity.en ?? '', zh: entity.cn ?? '' };
      card.innerHTML = `<div class="card-top"><span class="meta">${String(index + 1).padStart(2, '0')} / ${entity.type ?? entity.layer ?? 'ENTITY'}</span><span class="meta">${entity.family ?? ''}</span></div><h3>${name.en}</h3><div class="cn">${name.zh}</div>`;

      const preview = document.createElement('div');
      preview.className = 'preview';
      renderPreview(entity, preview, { emit });
      card.append(preview);

      const definition = document.createElement('p');
      definition.className = 'definition';
      definition.textContent = entity.description?.zh ?? entity.description?.en ?? entity.definition ?? '';
      card.append(definition);

      const open = () => emit('entity:open', { entityId: entity.id });
      card.addEventListener('click', event => {
        if (!event.target.closest('.preview')) open();
      });
      card.addEventListener('keydown', event => {
        if ((event.key === 'Enter' || event.key === ' ') && event.target === card) {
          event.preventDefault();
          open();
        }
      });
      root.append(card);
    });
  };

  return {
    setCategory(nextCategory = 'all') { category = nextCategory; draw(); },
    setQuery(nextQuery = '') { query = nextQuery.trim().toLocaleLowerCase(); draw(); },
    refresh: draw,
    getFilterState: () => ({ category, query })
  };
}
