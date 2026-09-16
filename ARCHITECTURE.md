# Frontend Entity Atlas architecture

## Goal

Turn the atlas into a browsable vocabulary system where the same entity can be rendered as a card, a detail view, a comparison item, or a live interactive preview without duplicating its definition.

## Dependency direction

```text
data → core contracts → primitives → components → composites/patterns → views → app entry
```

The arrow describes who may consume whom. Lower layers must not import a page or a feature. Views receive dependencies through arguments so the page can replace a renderer, registry, or event sink without changing the components.

## Entity contract

Each entity is plain data. Its minimum vocabulary is:

```js
{
  id, en, cn, family, type,
  definition, use,
  variants, states, parts, behaviors,
  preview
}
```

`preview` identifies a renderer; it does not contain DOM or event handlers. `states`, `parts`, and `behaviors` are written for both human readers and AI retrieval.

## Runtime contract

- A registry owns entity lookup and category queries.
- An event bus carries user intent (`entity:open`, `preview:change`, `search:change`) without coupling a component to the gallery.
- A state machine owns transitions for interactive previews.
- Components expose a small mount/render interface and receive an event sink or callback as a dependency.
- Views compose components and decide layout; they do not redefine entity facts.

## Delivery phases

1. Core contract and first data families. **Completed:** 16 core primitives, 124 catalog entities.
2. Primitive and component renderers. **Completed:** 6 primitives and 4 components, with a renderer boundary and generic-card fallback.
3. Gallery/detail views and application entry migration. **Completed:** the HTML entry now loads `src/app.js` as a native ES module.
4. Composite and pattern families from `sol_todo.md`. **Cataloged:** data is present; dedicated renderers can be added by `preview.renderer` without changing the catalog.
5. Search, comparison, state inspection, and regression checks. **In progress:** search and detail inspection are wired; comparison and richer state inspection remain the next extension point.
