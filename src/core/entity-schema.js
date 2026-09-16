/**
 * The data contract shared by the atlas, component implementations and views.
 *
 * This module is deliberately DOM-free. An entity describes what a UI thing
 * is; a renderer registered elsewhere decides how it is displayed.
 */

export const ENTITY_SCHEMA_VERSION = 1;

export const ENTITY_LAYERS = Object.freeze([
  'primitive',
  'component',
  'composite',
  'pattern',
  'container',
  'feature-ui',
]);

// These are the 16 top-level groups proposed in sol_todo.md.
export const ENTITY_FAMILIES = Object.freeze([
  'actions',
  'inputs',
  'selection',
  'navigation',
  'commands',
  'data-display',
  'feedback',
  'overlay',
  'disclosure',
  'layout',
  'forms',
  'collection',
  'structured-editing',
  'workspace',
  'interaction',
  'application-state',
]);

export const ENTITY_ID_PATTERN = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/;
export const EVENT_TYPE_PATTERN = /^[a-z][a-z0-9]*(?::[a-z0-9._-]+)+$/;

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function deepFreeze(value, seen = new WeakSet()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

function slugify(value) {
  return String(value ?? '')
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function localized(value) {
  if (typeof value === 'string') return { en: value, zh: value };
  if (!isRecord(value)) return { en: '', zh: '' };
  return {
    en: typeof value.en === 'string' ? value.en : '',
    zh: typeof value.zh === 'string' ? value.zh : '',
  };
}

function descriptor(value, fallbackId, fallbackName) {
  if (typeof value === 'string') {
    const id = slugify(value) || fallbackId;
    return { id, name: localized(value) };
  }

  const source = isRecord(value) ? value : {};
  const name = localized(source.name ?? source.label ?? fallbackName ?? source.id ?? '');
  const id = slugify(source.id ?? name.en ?? name.zh) || fallbackId;
  const result = { id, name };

  if (typeof source.description === 'string' || isRecord(source.description)) {
    result.description = localized(source.description);
  }
  if (typeof source.role === 'string') result.role = source.role;
  if (typeof source.required === 'boolean') result.required = source.required;
  if (typeof source.event === 'string') result.event = source.event;
  if (Array.isArray(source.inputs)) result.inputs = [...source.inputs];
  if (Array.isArray(source.outputs)) result.outputs = [...source.outputs];
  return result;
}

function descriptorList(value, fallbackId, fallbackName) {
  if (!Array.isArray(value) || value.length === 0) {
    return [descriptor({ id: fallbackId, name: fallbackName }, fallbackId, fallbackName)];
  }
  return value.map((item, index) => descriptor(item, fallbackId + '-' + (index + 1), fallbackName));
}

/**
 * Converts author-friendly entity input into the canonical shape.
 * Normalization is non-destructive and returns a frozen object.
 */
export function normalizeEntity(input) {
  const source = isRecord(input) ? input : {};
  const result = {
    schemaVersion: Number.isInteger(source.schemaVersion)
      ? source.schemaVersion
      : ENTITY_SCHEMA_VERSION,
    id: typeof source.id === 'string' ? source.id.trim().toLowerCase() : '',
    layer: typeof source.layer === 'string' ? source.layer.trim().toLowerCase() : '',
    family: typeof source.family === 'string' ? source.family.trim().toLowerCase() : '',
    name: localized(source.name ?? source.title),
    description: localized(source.description ?? source.definition ?? source.def),
    aliases: Array.isArray(source.aliases) ? [...source.aliases] : [],
    variants: descriptorList(source.variants, 'default', { en: 'Default', zh: '默认' }),
    states: descriptorList(source.states, 'default', { en: 'Default', zh: '默认' }),
    parts: Array.isArray(source.parts)
      ? source.parts.map((item, index) => descriptor(item, 'part-' + (index + 1)))
      : [],
    behaviors: Array.isArray(source.behaviors)
      ? source.behaviors.map((item, index) => descriptor(item, 'behavior-' + (index + 1)))
      : [],
    relations: Array.isArray(source.relations)
      ? source.relations.map((item) => {
        if (typeof item === 'string') return { type: 'related', targetId: item };
        const relation = isRecord(item) ? item : {};
        return {
          type: typeof relation.type === 'string' ? relation.type : 'related',
          targetId: typeof relation.targetId === 'string' ? relation.targetId : '',
        };
      })
      : [],
    accessibility: isRecord(source.accessibility)
      ? {
        role: typeof source.accessibility.role === 'string' ? source.accessibility.role : '',
        keyboard: Array.isArray(source.accessibility.keyboard) ? [...source.accessibility.keyboard] : [],
        notes: localized(source.accessibility.notes),
      }
      : { role: '', keyboard: [], notes: { en: '', zh: '' } },
    tags: Array.isArray(source.tags) ? [...source.tags] : [],
    rendererId: typeof source.rendererId === 'string' ? source.rendererId.trim() : null,
    preview: isRecord(source.preview)
      ? { ...source.preview }
      : (isRecord(source.metadata?.preview) ? { ...source.metadata.preview } : {}),
    metadata: isRecord(source.metadata) ? { ...source.metadata } : {},
  };

  return deepFreeze(result);
}

function issue(path, code, message, severity = 'error') {
  return { path, code, message, severity };
}

function validateLocalized(value, path, issues, required = true) {
  if (!isRecord(value)) {
    issues.push(issue(path, 'localized-text', '必须是包含 en 和 zh 字段的对象。'));
    return;
  }
  for (const locale of ['en', 'zh']) {
    if (required && (typeof value[locale] !== 'string' || value[locale].trim() === '')) {
      issues.push(issue(path + '.' + locale, 'missing-locale', '必须提供非空的 ' + locale + ' 文本。'));
    } else if (hasOwn(value, locale) && typeof value[locale] !== 'string') {
      issues.push(issue(path + '.' + locale, 'invalid-locale', locale + ' 必须是字符串。'));
    }
  }
}

function validateDescriptors(value, path, issues, { requireDescription = false } = {}) {
  if (!Array.isArray(value)) {
    issues.push(issue(path, 'array-required', '必须是数组。'));
    return;
  }
  const ids = new Set();
  value.forEach((item, index) => {
    const itemPath = path + '[' + index + ']';
    if (!isRecord(item)) {
      issues.push(issue(itemPath, 'object-required', '每一项必须是对象。'));
      return;
    }
    if (typeof item.id !== 'string' || !ENTITY_ID_PATTERN.test(item.id)) {
      issues.push(issue(itemPath + '.id', 'invalid-id', '必须使用小写字母、数字、点或连字符组成的稳定 ID。'));
    } else if (ids.has(item.id)) {
      issues.push(issue(itemPath + '.id', 'duplicate-id', '重复的 ID：' + item.id + '。'));
    } else {
      ids.add(item.id);
    }
    validateLocalized(item.name, itemPath + '.name', issues);
    if (requireDescription || hasOwn(item, 'description')) {
      validateLocalized(item.description, itemPath + '.description', issues, requireDescription);
    }
    if (hasOwn(item, 'required') && typeof item.required !== 'boolean') {
      issues.push(issue(itemPath + '.required', 'invalid-boolean', '必须是布尔值。'));
    }
    if (hasOwn(item, 'event') && (typeof item.event !== 'string' || !EVENT_TYPE_PATTERN.test(item.event))) {
      issues.push(issue(itemPath + '.event', 'invalid-event', '必须是类似 interaction:activate 的事件名。'));
    }
  });
}

/**
 * Returns structured errors instead of throwing, which is useful for authoring
 * tools and CI checks that want to show all invalid paths at once.
 */
export function validateEntity(entity, { allowCustomFamily = false } = {}) {
  const issues = [];
  if (!isRecord(entity)) {
    return { valid: false, issues: [issue('$', 'object-required', '实体定义必须是对象。')], value: entity };
  }

  if (entity.schemaVersion !== ENTITY_SCHEMA_VERSION) {
    issues.push(issue('schemaVersion', 'unsupported-version', '当前只支持 schemaVersion=' + ENTITY_SCHEMA_VERSION + '。'));
  }
  if (typeof entity.id !== 'string' || !ENTITY_ID_PATTERN.test(entity.id)) {
    issues.push(issue('id', 'invalid-id', '实体 ID 必须使用小写字母开头，并可包含数字、点或连字符。'));
  }
  if (!ENTITY_LAYERS.includes(entity.layer)) {
    issues.push(issue('layer', 'invalid-layer', 'layer 必须是：' + ENTITY_LAYERS.join(', ') + '。'));
  }
  if (!allowCustomFamily && !ENTITY_FAMILIES.includes(entity.family)) {
    issues.push(issue('family', 'invalid-family', 'family 必须是 sol_todo 定义的分类之一：' + ENTITY_FAMILIES.join(', ') + '。'));
  } else if (typeof entity.family !== 'string' || !ENTITY_ID_PATTERN.test(entity.family)) {
    issues.push(issue('family', 'invalid-family-id', 'family 必须是稳定的小写 ID。'));
  }

  validateLocalized(entity.name, 'name', issues);
  validateLocalized(entity.description, 'description', issues);
  for (const field of ['aliases', 'tags']) {
    if (!Array.isArray(entity[field]) || entity[field].some((item) => typeof item !== 'string')) {
      issues.push(issue(field, 'string-array-required', '必须是字符串数组。'));
    }
  }
  validateDescriptors(entity.variants, 'variants', issues, { requireDescription: false });
  validateDescriptors(entity.states, 'states', issues, { requireDescription: false });
  validateDescriptors(entity.parts, 'parts', issues, { requireDescription: false });
  validateDescriptors(entity.behaviors, 'behaviors', issues, { requireDescription: true });

  if (!Array.isArray(entity.relations)) {
    issues.push(issue('relations', 'array-required', '必须是数组。'));
  } else {
    entity.relations.forEach((relation, index) => {
      const path = 'relations[' + index + ']';
      if (!isRecord(relation)) {
        issues.push(issue(path, 'object-required', '关系必须是对象。'));
        return;
      }
      if (typeof relation.type !== 'string' || relation.type.trim() === '') {
        issues.push(issue(path + '.type', 'missing-relation-type', '必须提供关系类型。'));
      }
      if (typeof relation.targetId !== 'string' || !ENTITY_ID_PATTERN.test(relation.targetId)) {
        issues.push(issue(path + '.targetId', 'invalid-id', '必须是稳定的实体 ID。'));
      }
    });
  }

  if (!isRecord(entity.accessibility)) {
    issues.push(issue('accessibility', 'object-required', '必须是对象。'));
  } else {
    if (entity.accessibility.role !== '' && typeof entity.accessibility.role !== 'string') {
      issues.push(issue('accessibility.role', 'invalid-role', 'role 必须是字符串。'));
    }
    if (!Array.isArray(entity.accessibility.keyboard) || entity.accessibility.keyboard.some((key) => typeof key !== 'string')) {
      issues.push(issue('accessibility.keyboard', 'string-array-required', 'keyboard 必须是字符串数组。'));
    }
    validateLocalized(entity.accessibility.notes, 'accessibility.notes', issues, false);
  }
  if (entity.rendererId !== null && (typeof entity.rendererId !== 'string' || entity.rendererId.trim() === '')) {
    issues.push(issue('rendererId', 'invalid-renderer-id', 'rendererId 必须是非空字符串或 null。'));
  }

  return { valid: issues.every((item) => item.severity !== 'error'), issues, value: entity };
}

export class EntitySchemaError extends Error {
  constructor(message, issues, entity) {
    super(message);
    this.name = 'EntitySchemaError';
    this.issues = Object.freeze([...issues]);
    this.entity = entity;
  }
}

/** Normalize, validate and freeze an entity for registry insertion. */
export function defineEntity(input, options = {}) {
  const entity = normalizeEntity(input);
  const result = validateEntity(entity, options);
  if (!result.valid) {
    throw new EntitySchemaError(
      'Invalid entity definition' + (entity.id ? ': ' + entity.id : '') + '.',
      result.issues,
      entity,
    );
  }
  return entity;
}

export const assertValidEntity = defineEntity;
