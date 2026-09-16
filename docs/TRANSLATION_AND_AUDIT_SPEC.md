# Translation and demo audit contract

## Translation fields

Source records remain author-friendly and keep their English fields unchanged:

- `definition`: the canonical English definition
- `definitionZh`: natural Simplified Chinese definition
- `use`: the canonical English usage description
- `useZh`: natural Simplified Chinese usage description

Do not translate IDs, `preview.renderer`, `type`, or the English values in `variants`, `states`, `parts`, and `behaviors`. Those values are identifiers for the AI-facing vocabulary and must remain stable. A category agent may improve wording only when an existing English sentence is grammatically incorrect, and must not change its meaning.

## Audit fields

Each category audit is a Markdown document under `docs/audits/` and must include every entity ID in that category. Each row records:

| Field | Meaning |
|---|---|
| Entity | Stable entity ID and bilingual name |
| Claimed concept | What the source definition/use says the entity is for |
| Actual demo | The dedicated renderer or `EntityDemo` route currently used |
| Visible result | The concrete controls/content a user can see |
| Interaction | The action that can be performed in the preview |
| Match | `High`, `Medium`, or `Low` correspondence to the claim |
| Significance | Whether the demo makes the defining behavior obvious, not merely decorative |
| Gap | A specific limitation, or `None` |

Use `Low` when the preview is only a generic state toggle or when it presents a different concept. Do not infer an interaction merely from the entity's `behaviors` text; inspect `src/views/preview-renderer.js` and `src/components/entity-demo.js`.

## Acceptance rule

The final catalog is acceptable when every entity has bilingual definition/use content and every audit row truthfully describes the currently rendered demo. A high count of `Medium` or `Low` rows is useful evidence for the next renderer implementation phase; it is not a reason to inflate the rating.
