# Actions 展示审计

本审计覆盖 `src/data/actions/index.js` 中的 6 条实体。判断依据是当前 `src/views/preview-renderer.js` 的 renderer 映射、`src/components/entity-demo.js` 的分支逻辑，以及对应专用组件的实际 DOM 和事件行为。`Match` 表示实体声明与当前 demo 的对应程度；`Significance` 表示定义中的关键行为是否能被用户明显感知。

## 逐条审计

| Entity | Claimed concept | Actual demo | Visible result | Interaction | Match | Significance | Gap |
|---|---|---|---|---|---|---|---|
| `button` — Button / 按钮 | **Definition:** 让系统执行一个明确动作的控件。<br>**Use:** 保存、提交、删除、打开、确认或启动任务。 | `preview.renderer = button`，使用专用 `Button` renderer；预览参数使用 primary variant 和 `保存 / Save` 标签。 | 一个可操作的 primary button，显示 `保存 / Save`。初始状态不是 loading 或 disabled。 | 点击会发出 `button:click` 事件；当前页面没有为该事件配置可见结果，因此按钮外观和文字不会改变。 | **High** | **High** — 控件本身、动作标签和真实点击事件都清楚表达“执行一个动作”。 | 缺少可见的保存成功/失败反馈，也没有在预览中演示 loading、disabled 或 submit 状态。 |
| `icon-button` — Icon Button / 图标按钮 | **Definition:** 主要通过图标呈现可见标签的按钮。<br>**Use:** 用于关闭、编辑、复制、删除、展开，或触发紧凑的辅助操作。 | `preview.renderer = icon-button`，映射到专用 `Button` renderer；没有传入 `icon` 或 `iconOnly` 配置。 | 一个普通的 primary button，标签为 `× / Close`；`×` 和文字都作为按钮标签显示，没有独立的图标按钮外观或 tooltip。 | 点击会发出 `button:click` 事件；没有显示 tooltip，也没有额外的关闭目标。 | **Medium** | **Medium** — 用户能看到并点击一个紧凑关闭动作，但无法明确体验“图标作为主要可见标签”的专门形态。 | 未演示 icon-only 结构、可访问名称与图标的分离、tooltip、badge 或 loading 状态。 |
| `split-button` — Split Button / 分裂按钮 | **Definition:** 将一个立即执行的动作与相关替代选项组合在一起的成对控件。<br>**Use:** 在保留常用导出、发布、下载或创建操作的同时，将其他变体放在附近。 | `preview.renderer = split-button` 没有专用构造器；由于 `EntityDemo.kind()` 中的名称匹配 `button`，实际走 `EntityDemo.buildAction()`。 | 只有一个通用按钮 `执行动作 / Run action`，没有分隔线、下拉箭头或菜单。 | 点击后按钮文字变为 `✓ 已触发 / Triggered`，状态输出变为 `Action emitted / 动作已触发`。 | **Low** | **Low** — 能说明“有一个动作按钮”，但不能让用户观察默认动作与替代动作菜单之间的关系。 | 缺少 primary action、menu trigger、菜单展开、替代操作选择和键盘菜单导航。 |
| `toggle-button` — Toggle Button / 切换按钮 | **Definition:** 会改变并表示一个持久的开/关或选中/未选中值的按钮。<br>**Use:** 用于粗体格式、收藏状态、面板可见性或编辑器工具模式。 | `preview.renderer = toggle-button`，映射到专用 `Toggle` renderer；它以带轨道和滑块的 toggle/switch 形态呈现。 | 一个初始为关闭的切换控件，显示轨道、滑块和 `Off / 关闭`；打开后显示 `On / 开启`。 | 点击会在开/关之间切换，更新视觉状态和 `aria-checked`，并发出 `toggle:change` 事件。 | **Medium** | **Medium** — 持久值的变化清晰可见，但当前呈现更接近 switch，而不是带 pressed 语义的 toggle button。 | 未演示粗体、收藏、面板/工具模式等具体应用，也没有 exclusive group 或 multi-select group。 |
| `floating-action-button` — Floating Action Button / 悬浮动作按钮 | **Definition:** 悬浮在页面内容之上的醒目动作按钮。<br>**Use:** 用于在工作区中创建、撰写、添加或启动最重要的操作。 | `preview.renderer = floating-action-button` 没有专用构造器；由于名称匹配 `button`，实际走 `EntityDemo.buildAction()`。 | 一个位于普通 demo stage 内的通用按钮 `执行动作 / Run action`，不是悬浮在内容之上的 `+ / Add` 按钮。 | 点击后按钮文字变为 `✓ 已触发 / Triggered`，状态输出变为 `Action emitted / 动作已触发`。 | **Low** | **Low** — 只有“触发动作”这一层行为可见，位置、视觉强调和工作区主动作都没有被表达。 | 缺少悬浮定位、elevation、扩展/收起标签、视口适配和 `+ / Add` 主动作。 |
| `link-button` — Link Button / 链接按钮 | **Definition:** 保留导航语义、但以动作控件的样式或位置呈现的链接。<br>**Use:** 用于前往相关页面、打开详情视图或展示次要目的地。 | `preview.renderer = link-button`，映射到专用 `Button` renderer；当前生成的是 `button` 元素，而不是链接元素。 | 一个 primary button，显示 `查看详情 / View details`；没有 `href`、外部目标或链接样式。 | 点击只发出 `button:click` 事件，不会导航、不改变历史记录，也不会打开详情页。 | **Low** | **Low** — 标签暗示了目的地，但用户无法实际执行导航，链接语义也不可见。 | 缺少 `a`/`href` 导航、外部目标、浏览器历史保留、visited/active 状态和 Enter 导航演示。 |

## 统计

按 `Match` 统计：High **1**、Medium **2**、Low **3**；共 **6** 条审计记录。翻译字段 `definitionZh` 和 `useZh` 已为 6 条实体全部补齐。

