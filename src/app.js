import { createEntityRegistry, createEventBus } from './core/index.js';
import entities from './data/index.js';
import { createAtlasView } from './views/atlas-view.js';
import { createDetailView } from './views/detail-view.js';
import { renderPreview } from './views/preview-renderer.js';

const $ = selector => document.querySelector(selector);
const eventBus = createEventBus();
const registry = createEntityRegistry({ allowCustomFamily: true });
registry.registerMany(entities);

const cards = $('#cards');
const dialog = $('#entity-dialog');
const detailView = createDetailView({ root: $('#dialog-content'), registry, emit: (type, detail) => eventBus.emit(type, detail, { source: 'detail-view' }) });
const atlasView = createAtlasView({
  root: cards,
  registry,
  renderPreview,
  emit: (type, detail) => eventBus.emit(type, detail, { source: 'atlas-view' }),
});

function familyLabel(family) {
  return family.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join(' ');
}

function setupFilters() {
  const families = [...new Set(registry.list().map(entity => entity.family))].sort();
  const categories = [{ id: 'all', label: 'All / 全部' }, ...families.map(id => ({ id, label: `${familyLabel(id)} / ${id}` }))];
  $('#category-nav').innerHTML = categories.map((item, index) => `<button class="${index === 0 ? 'active' : ''}" data-category="${item.id}">${item.label}</button>`).join('');
  $('#filter-row').innerHTML = families.map(id => `<button class="tag" data-category="${id}">${familyLabel(id)}</button>`).join('');
  document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-category]').forEach(item => item.classList.toggle('active', item.dataset.category === button.dataset.category));
    atlasView.setCategory(button.dataset.category);
  }));
}

function openEntity(entityId) {
  if (!detailView.render(entityId)) return;
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

eventBus.on('entity:open', event => openEntity(event.detail.entityId));
$('#search-input').addEventListener('input', event => atlasView.setQuery(event.target.value));
$('.dialog-close').addEventListener('click', () => dialog.close?.());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close?.(); });
$('.contrast-toggle').addEventListener('click', event => {
  const high = document.body.classList.toggle('high-contrast');
  event.currentTarget.setAttribute('aria-pressed', String(high));
  event.currentTarget.innerHTML = high ? '亮度 <span>●</span>' : '亮度 <span>○</span>';
});

setupFilters();
atlasView.refresh();
