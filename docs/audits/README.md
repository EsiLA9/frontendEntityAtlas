# Demo audit index

这些审计由各概念族 agent 分别完成，依据当前 `preview-renderer.js`、`EntityDemo` 和专用组件的真实 DOM/事件行为，而不是依据 `preview.example` 或概念文本推断。`High / Medium / Low` 是“声明与当前展示是否相合”的诚实评级，不是组件质量评分。

| Concept family | Entities | High | Medium | Low | Audit |
|---|---:|---:|---:|---:|---|
| Actions | 6 | 1 | 2 | 3 | [actions.md](./actions.md) |
| Navigation | 6 | 1 | 0 | 5 | [navigation.md](./navigation.md) |
| Selection | 7 | 1 | 1 | 5 | [selection.md](./selection.md) |
| Forms | 17 | 6 | 3 | 8 | [forms.md](./forms.md) |
| Feedback | 10 | 3 | 0 | 7 | [feedback.md](./feedback.md) |
| Overlays | 6 | 2 | 0 | 4 | [overlays.md](./overlays.md) |
| Disclosure | 3 | 1 | 1 | 1 | [disclosure.md](./disclosure.md) |
| Layout | 14 | 0 | 2 | 12 | [layout.md](./layout.md) |
| Commands | 8 | 0 | 0 | 8 | [commands.md](./commands.md) |
| Data Display | 13 | 1 | 2 | 10 | [display.md](./display.md) |
| Advanced | 34 | 3 | 11 | 20 | [advanced.md](./advanced.md) |
| **Total** | **124** | **19** | **22** | **83** | **11/11 complete** |

## Reading the result

- 19 High rows already have a dedicated or semantically strong demo.
- 22 Medium rows show a meaningful slice of the claimed behavior but omit important structure.
- 83 Low rows have a working miniature interaction, but the current renderer is too generic to claim the full component/pattern.

The Low rows are the implementation backlog: the audit identifies exactly which visible part, state, event, or relationship must be added before a concept can be upgraded.
