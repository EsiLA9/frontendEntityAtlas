import {
  ENTITY_FAMILIES,
  ENTITY_LAYERS,
  ENTITY_SCHEMA_VERSION,
  normalizeEntity,
  validateEntity,
} from '../core/entity-schema.js';

import actions from './actions/index.js';
import advanced from './advanced/index.js';
import commands from './commands/index.js';
import disclosure from './disclosure/index.js';
import display from './display/index.js';
import feedback from './feedback/index.js';
import forms from './forms/index.js';
import layout from './layout/index.js';
import navigation from './navigation/index.js';
import overlays from './overlays/index.js';
import selection from './selection/index.js';

/**
 * The category modules intentionally remain author-friendly. This file is the
 * only seam that turns their legacy vocabulary into the core entity contract.
 */
export {
  actions,
  advanced,
  commands,
  disclosure,
  display,
  feedback,
  forms,
  layout,
  navigation,
  overlays,
  selection,
};

const LEGACY_FAMILY_ALIASES = Object.freeze({
  actions: 'actions',
  commands: 'commands',
  'data-display': 'data-display',
  disclosure: 'disclosure',
  feedback: 'feedback',
  forms: 'forms',
  inputs: 'inputs',
  interaction: 'interaction',
  layout: 'layout',
  navigation: 'navigation',
  overlay: 'overlay',
  overlays: 'overlay',
  selection: 'selection',
});

const LEGACY_TYPE_TO_LAYER = Object.freeze({
  primitive: 'primitive',
  'display-primitive': 'primitive',
  component: 'component',
  overlay: 'component',
  'overlay-ui': 'component',
  composite: 'composite',
  'composite-part': 'composite',
  pattern: 'pattern',
  'primitive-pattern': 'pattern',
  'interaction-pattern': 'pattern',
  'behavior-pattern': 'pattern',
  'semantic-pattern': 'pattern',
  'interaction-system': 'feature-ui',
  container: 'container',
  'feature-ui': 'feature-ui',
});

/* Advanced is a deliberately broad authoring bucket. These IDs restore the
 * 16-family ontology from entity-schema.js without editing the source data. */
const ADVANCED_FAMILY_BY_ID = Object.freeze({
  filter: 'selection',
  'query-builder': 'structured-editing',
  'builder-editor': 'structured-editing',
  'layer-editor': 'structured-editing',
  'drag-and-drop': 'interaction',
  'selection-system': 'interaction',
  wizard: 'navigation',
  stepper: 'navigation',
  'master-detail': 'workspace',
  'list-detail-inspector': 'workspace',
  dashboard: 'workspace',
  chart: 'data-display',
  'event-timeline': 'data-display',
  'editor-timeline': 'workspace',
  'graph-editor': 'workspace',
  'canvas-workspace': 'workspace',
  'image-media-interaction': 'interaction',
  carousel: 'navigation',
  'notification-system': 'feedback',
  'activity-history': 'data-display',
  'help-guidance': 'feedback',
  'mode-switcher': 'selection',
  preview: 'workspace',
  diff: 'data-display',
  inspector: 'workspace',
  'browser-explorer': 'collection',
  'collection-editor': 'collection',
  'object-editor': 'structured-editing',
  'enum-editor': 'structured-editing',
  'range-bounds-editor': 'structured-editing',
  'vector-editor': 'structured-editing',
  'resource-asset-field': 'structured-editing',
  'reorderable-list': 'collection',
  sortable: 'collection',
});

const CATEGORY_SOURCES = Object.freeze([
  { id: 'actions', family: 'actions', sourcePath: 'src/data/actions/index.js', values: actions },
  { id: 'navigation', family: 'navigation', sourcePath: 'src/data/navigation/index.js', values: navigation },
  { id: 'selection', family: 'selection', sourcePath: 'src/data/selection/index.js', values: selection },
  { id: 'forms', family: 'forms', sourcePath: 'src/data/forms/index.js', values: forms },
  { id: 'feedback', family: 'feedback', sourcePath: 'src/data/feedback/index.js', values: feedback },
  { id: 'overlays', family: 'overlay', sourcePath: 'src/data/overlays/index.js', values: overlays },
  { id: 'disclosure', family: 'disclosure', sourcePath: 'src/data/disclosure/index.js', values: disclosure },
  { id: 'layout', family: 'layout', sourcePath: 'src/data/layout/index.js', values: layout },
  { id: 'commands', family: 'commands', sourcePath: 'src/data/commands/index.js', values: commands },
  { id: 'display', family: 'data-display', sourcePath: 'src/data/display/index.js', values: display },
  {
    id: 'advanced',
    familyById: ADVANCED_FAMILY_BY_ID,
    sourcePath: 'src/data/advanced/index.js',
    values: advanced,
  },
]);

const ACCESSIBILITY_HINTS = Object.freeze({
  button: { role: 'button', keyboard: ['Enter', 'Space'] },
  'icon-button': { role: 'button', keyboard: ['Enter', 'Space'] },
  'split-button': { role: 'button', keyboard: ['Enter', 'Space', 'ArrowDown'] },
  'toggle-button': { role: 'button', keyboard: ['Enter', 'Space'] },
  'floating-action-button': { role: 'button', keyboard: ['Enter', 'Space'] },
  'link-button': { role: 'link', keyboard: ['Enter'] },
  link: { role: 'link', keyboard: ['Enter'] },
  'text-field': { role: 'textbox', keyboard: [] },
  textarea: { role: 'textbox', keyboard: [] },
  'search-field': { role: 'searchbox', keyboard: ['Enter', 'Escape'] },
  'number-field': { role: 'spinbutton', keyboard: ['ArrowUp', 'ArrowDown'] },
  checkbox: { role: 'checkbox', keyboard: ['Space'] },
  'radio-group': { role: 'radiogroup', keyboard: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] },
  switch: { role: 'switch', keyboard: ['Space'] },
  slider: { role: 'slider', keyboard: ['ArrowLeft', 'ArrowRight', 'Home', 'End'] },
  select: { role: 'combobox', keyboard: ['Enter', 'ArrowDown', 'Escape'] },
  combobox: { role: 'combobox', keyboard: ['ArrowDown', 'ArrowUp', 'Enter', 'Escape'] },
  'multi-select': { role: 'listbox', keyboard: ['ArrowDown', 'ArrowUp', 'Space', 'Escape'] },
  'segmented-control': { role: 'radiogroup', keyboard: ['ArrowLeft', 'ArrowRight'] },
  'reference-field': { role: 'combobox', keyboard: ['Enter', 'Escape'] },
  tabs: { role: 'tablist', keyboard: ['ArrowLeft', 'ArrowRight', 'Home', 'End'] },
  breadcrumb: { role: 'navigation', keyboard: ['Tab'] },
  pagination: { role: 'navigation', keyboard: ['Tab', 'Enter'] },
  'sidebar-navigation': { role: 'navigation', keyboard: ['Tab', 'Enter'] },
  'tree-navigation': { role: 'tree', keyboard: ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'] },
  'tree-view': { role: 'tree', keyboard: ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'] },
  menu: { role: 'menu', keyboard: ['ArrowUp', 'ArrowDown', 'Enter', 'Escape'] },
  'context-menu': { role: 'menu', keyboard: ['ArrowUp', 'ArrowDown', 'Enter', 'Escape'] },
  toolbar: { role: 'toolbar', keyboard: ['Tab', 'ArrowLeft', 'ArrowRight'] },
  dialog: { role: 'dialog', keyboard: ['Tab', 'Escape'] },
  drawer: { role: 'dialog', keyboard: ['Tab', 'Escape'] },
  sheet: { role: 'dialog', keyboard: ['Tab', 'Escape'] },
  tooltip: { role: 'tooltip', keyboard: ['Escape'] },
  alert: { role: 'alert', keyboard: [] },
  toast: { role: 'status', keyboard: ['Escape'] },
  snackbar: { role: 'status', keyboard: ['Escape'] },
  'progress-bar': { role: 'progressbar', keyboard: [] },
  spinner: { role: 'status', keyboard: [] },
  'status-indicator': { role: 'status', keyboard: [] },
  table: { role: 'table', keyboard: ['Tab', 'ArrowUp', 'ArrowDown'] },
  'data-grid': { role: 'grid', keyboard: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] },
  list: { role: 'list', keyboard: ['Tab'] },
  card: { role: 'article', keyboard: ['Tab'] },
});

const RELATED_ENTITY_IDS = Object.freeze({
  button: ['icon-button', 'toggle-button', 'split-button'],
  'icon-button': ['button'],
  'toggle-button': ['button', 'switch'],
  link: ['link-button'],
  'link-button': ['link'],
  select: ['combobox', 'multi-select', 'picker'],
  combobox: ['select', 'picker'],
  'multi-select': ['select'],
  tabs: ['segmented-control'],
  accordion: ['collapsible', 'disclosure'],
  collapsible: ['accordion', 'disclosure'],
  dialog: ['drawer', 'sheet', 'popover'],
  drawer: ['dialog', 'sheet'],
  alert: ['toast', 'snackbar'],
  table: ['data-grid'],
  list: ['tree-view'],
  sortable: ['reorderable-list'],
  'reorderable-list': ['sortable'],
});

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function slug(value) {
  return text(value)
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function localePair(value, { enFallback = '', zhFallback = '' } = {}) {
  if (isRecord(value)) {
    const en = text(value.en ?? value.enUS ?? value.english) || text(enFallback);
    const zh = text(value.zh ?? value.cn ?? value.chinese) || text(zhFallback) || en;
    return { en, zh };
  }

  const sameText = text(value);
  const en = sameText || text(enFallback);
  return { en, zh: sameText || text(zhFallback) || en };
}

function legacyName(source) {
  return localePair(source.name ?? source.title, {
    enFallback: source.en ?? source.id,
    zhFallback: source.cn ?? source.zh ?? source.en ?? source.id,
  });
}

function legacyDescription(source) {
  const original = source.description ?? source.definition ?? source.def ?? source.use;
  if (isRecord(original)) return localePair(original, { enFallback: source.definition ?? source.use ?? '', zhFallback: source.descriptionZh ?? source.definitionZh ?? source.definitionCn ?? '' });
  const en = text(original) || text(source.definition ?? source.use);
  const zh = text(source.descriptionZh ?? source.definitionZh ?? source.definitionCn) || en;
  return { en, zh };
}

function normalizedFamily(value) {
  const key = slug(value);
  if (Object.prototype.hasOwnProperty.call(LEGACY_FAMILY_ALIASES, key)) {
    return LEGACY_FAMILY_ALIASES[key];
  }
  return ENTITY_FAMILIES.includes(key) ? key : null;
}

function normalizedType(value) {
  return slug(value);
}

function addWarning(warnings, details) {
  warnings.push(Object.freeze({
    severity: details.severity ?? 'warning',
    code: details.code,
    source: details.source,
    index: details.index,
    entityId: details.entityId ?? null,
    message: details.message,
    issues: details.issues ? Object.freeze([...details.issues]) : Object.freeze([]),
  }));
}

function resolveFamily(source, category, warnings, index) {
  const sourceLabel = category.sourcePath;
  const mappedFamily = category.familyById?.[source?.id] ?? category.family ?? null;
  const declaredFamily = normalizedFamily(source?.family);

  if (mappedFamily && !ENTITY_FAMILIES.includes(mappedFamily)) {
    addWarning(warnings, {
      severity: 'error',
      code: 'unmapped-family',
      source: sourceLabel,
      index,
      entityId: source?.id,
      message: `映射后的 family 不在核心契约中：${mappedFamily}。`,
    });
    return '';
  }

  if (declaredFamily && mappedFamily && declaredFamily !== mappedFamily && !category.familyById) {
    addWarning(warnings, {
      code: 'family-overridden',
      source: sourceLabel,
      index,
      entityId: source?.id,
      message: `使用分类适配的 family=${mappedFamily} 覆盖旧字段 family=${source.family}。`,
    });
  } else if (!declaredFamily && !category.familyById && source?.family !== undefined) {
    addWarning(warnings, {
      code: 'unknown-legacy-family',
      source: sourceLabel,
      index,
      entityId: source?.id,
      message: `无法识别旧 family=${String(source.family)}，改用分类 family=${mappedFamily}。`,
    });
  }

  if (!mappedFamily) {
    addWarning(warnings, {
      severity: 'error',
      code: 'missing-family-mapping',
      source: sourceLabel,
      index,
      entityId: source?.id,
      message: '实体没有可用的核心 family 映射。',
    });
  }

  return mappedFamily ?? '';
}

function resolveLayer(source, category, warnings, index) {
  const sourceLabel = category.sourcePath;
  const explicitLayer = slug(source?.layer);
  if (explicitLayer && ENTITY_LAYERS.includes(explicitLayer)) return explicitLayer;

  if (explicitLayer && !ENTITY_LAYERS.includes(explicitLayer)) {
    addWarning(warnings, {
      code: 'invalid-explicit-layer',
      source: sourceLabel,
      index,
      entityId: source?.id,
      message: `旧 layer=${source.layer} 不是核心层级，将尝试从 type 推导。`,
    });
  }

  const layer = LEGACY_TYPE_TO_LAYER[normalizedType(source?.type)];
  if (!layer) {
    addWarning(warnings, {
      severity: 'error',
      code: 'unmapped-type',
      source: sourceLabel,
      index,
      entityId: source?.id,
      message: `无法将旧 type=${String(source?.type ?? '')} 映射到核心 layer。`,
    });
  }
  return layer ?? '';
}

function accessibilitySeed(source, rendererId) {
  const hint = ACCESSIBILITY_HINTS[rendererId] ?? {};
  const sourceAccessibility = isRecord(source?.accessibility) ? source.accessibility : {};
  return {
    role: text(sourceAccessibility.role) || hint.role || '',
    keyboard: Array.isArray(sourceAccessibility.keyboard)
      ? [...sourceAccessibility.keyboard]
      : [...(hint.keyboard ?? [])],
    notes: sourceAccessibility.notes ?? hint.notes ?? { en: '', zh: '' },
  };
}

function relationSeed(source) {
  if (Array.isArray(source?.relations)) return source.relations;
  return (RELATED_ENTITY_IDS[source?.id] ?? []).map((targetId) => ({
    type: 'related',
    targetId,
  }));
}

function behaviorSeeds(source) {
  if (!Array.isArray(source?.behaviors)) return [];
  return source.behaviors.map((behavior, index) => {
    if (isRecord(behavior)) {
      const name = behavior.name ?? behavior.label ?? behavior.id ?? `behavior-${index + 1}`;
      return {
        ...behavior,
        name,
        description: behavior.description ?? name,
      };
    }
    return {
      id: slug(behavior) || `behavior-${index + 1}`,
      name: localePair(behavior),
      description: localePair(behavior),
    };
  });
}

function adaptLegacyEntity(source, category, index, warnings) {
  if (!isRecord(source)) {
    addWarning(warnings, {
      severity: 'error',
      code: 'entity-object-required',
      source: category.sourcePath,
      index,
      message: '分类实体必须是对象；该条目将保留在 invalidEntities 中。',
    });
    return source;
  }

  const rendererId = text(source.rendererId) || text(source.preview?.renderer) || null;
  if (!rendererId) {
    addWarning(warnings, {
      code: 'missing-renderer',
      source: category.sourcePath,
      index,
      entityId: source.id,
      message: '实体没有 preview.renderer 或 rendererId，核心实体将使用 null rendererId。',
    });
  }

  return {
    schemaVersion: ENTITY_SCHEMA_VERSION,
    id: source.id ?? '',
    name: legacyName(source),
    description: legacyDescription(source),
    aliases: Array.isArray(source.aliases) ? [...source.aliases] : [],
    variants: Array.isArray(source.variants) ? [...source.variants] : [],
    states: Array.isArray(source.states) ? [...source.states] : [],
    parts: Array.isArray(source.parts) ? [...source.parts] : [],
    behaviors: behaviorSeeds(source),
    relations: relationSeed(source),
    accessibility: accessibilitySeed(source, rendererId),
    tags: Array.isArray(source.tags) ? [...source.tags] : [],
    rendererId,
    layer: resolveLayer(source, category, warnings, index),
    family: resolveFamily(source, category, warnings, index),
    metadata: {
      sourcePath: category.sourcePath,
      sourceCategory: category.id,
      legacyFamily: source.family ?? null,
      legacyType: source.type ?? null,
      legacyUse: source.use ?? null,
      legacyUseZh: source.useZh ?? source.usageZh ?? source.useCN ?? null,
      preview: isRecord(source.preview) ? { ...source.preview } : null,
    },
  };
}

function buildCatalog() {
  const warnings = [];
  const invalidEntities = [];
  const records = [];

  for (const category of CATEGORY_SOURCES) {
    if (!Array.isArray(category.values)) {
      addWarning(warnings, {
        severity: 'error',
        code: 'category-array-required',
        source: category.sourcePath,
        message: '分类入口必须导出数组；该分类未被静默忽略。',
      });
      continue;
    }
    category.values.forEach((raw, index) => records.push({ raw, category, index }));
  }

  const rawEntities = records.map(({ raw }) => raw);
  const entities = [];
  const entityById = new Map();

  for (const record of records) {
    const seed = adaptLegacyEntity(record.raw, record.category, record.index, warnings);
    let entity;
    let validation;

    try {
      entity = normalizeEntity(seed);
      validation = validateEntity(entity);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      addWarning(warnings, {
        severity: 'error',
        code: 'normalization-exception',
        source: record.category.sourcePath,
        index: record.index,
        entityId: record.raw?.id,
        message: `实体规范化异常：${message}`,
      });
      invalidEntities.push({ raw: record.raw, source: record.category.sourcePath, index: record.index, issues: [] });
      continue;
    }

    if (!validation.valid) {
      addWarning(warnings, {
        severity: 'error',
        code: 'invalid-entity',
        source: record.category.sourcePath,
        index: record.index,
        entityId: record.raw?.id,
        message: '适配后的实体未通过核心 schema 校验；该条目不会进入 entities。',
        issues: validation.issues,
      });
      invalidEntities.push({
        raw: record.raw,
        source: record.category.sourcePath,
        index: record.index,
        issues: validation.issues,
      });
      continue;
    }

    if (entityById.has(entity.id)) {
      const previous = entityById.get(entity.id);
      const duplicateIssue = {
        path: 'id',
        code: 'duplicate-id',
        message: `已由 ${previous.metadata.sourcePath} 定义。`,
      };
      addWarning(warnings, {
        severity: 'error',
        code: 'duplicate-id',
        source: record.category.sourcePath,
        index: record.index,
        entityId: entity.id,
        message: `实体 ID 重复：${entity.id}；保留先出现的定义。`,
        issues: [duplicateIssue],
      });
      invalidEntities.push({
        raw: record.raw,
        source: record.category.sourcePath,
        index: record.index,
        issues: [duplicateIssue],
      });
      continue;
    }

    entityById.set(entity.id, entity);
    entities.push(entity);
  }

  const knownIds = new Set(entityById.keys());
  for (const entity of entities) {
    for (const relation of entity.relations) {
      if (!knownIds.has(relation.targetId)) {
        addWarning(warnings, {
          code: 'dangling-relation',
          source: entity.metadata.sourcePath,
          entityId: entity.id,
          message: `关系目标不存在：${relation.targetId}。`,
          issues: [{ path: 'relations', code: 'dangling-relation', message: relation.targetId }],
        });
      }
    }
  }

  return {
    rawEntities: Object.freeze([...rawEntities]),
    entities: Object.freeze([...entities]),
    entityById,
    invalidEntities: Object.freeze([...invalidEntities]),
    dataWarnings: Object.freeze([...warnings]),
  };
}

const catalog = buildCatalog();

/** The unmodified author-facing records, flattened in category order. */
export const rawEntities = catalog.rawEntities;

/** Canonical, schema-validated entities. Invalid records are excluded and reported. */
export const entities = catalog.entities;

/** Records excluded from entities, with their source location and schema issues. */
export const invalidEntities = catalog.invalidEntities;

/** Structured diagnostics; errors are never silently discarded during module load. */
export const dataWarnings = catalog.dataWarnings;
export const dataErrors = Object.freeze(dataWarnings.filter((warning) => warning.severity === 'error'));

export const entityById = catalog.entityById;
export const families = Object.freeze([...new Set(entities.map((entity) => entity.family))]);

/**
 * Returns the canonical entity seed by ID. Passing an entity-like object is
 * also supported for callers that already hold a record and want a lookup.
 */
export function getEntitySeed(idOrEntity) {
  const id = isRecord(idOrEntity) ? idOrEntity.id : idOrEntity;
  const entityId = slug(id);
  return entityId ? entityById.get(entityId) ?? null : null;
}

export const findEntity = getEntitySeed;
export const entityCatalog = entities;

export default entities;
