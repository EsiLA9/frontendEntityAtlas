# Disclosure 展示审计

本审计覆盖 `src/data/disclosure/index.js` 中的 3 条实体。判断依据是当前 `src/views/preview-renderer.js` 的 renderer 映射和 `src/components/entity-demo.js` 的实际分支、DOM 与事件行为。三个 renderer ID（`accordion`、`collapsible`、`disclosure`）都没有进入专用构造器映射，均由 `EntityDemo.buildDisclosure()` 渲染为单个原生 `<details>` 示例；因此不能把它描述成完整的 Accordion、Collapsible 组件或多条目展开系统。

## 通用实现的实际行为

- 可见结构：一个 `<details class="entity-demo__disclosure">`，其中包含可聚焦的 `<summary>展开说明 / Show details</summary>` 和一个 `<p>` 内容段。
- 初始状态：关闭；代码没有设置 `open` 属性。
- 展开/收起：点击 summary 或使用原生键盘激活会切换内容的可见性；`toggle` 事件将状态输出更新为 `Expanded / 已展开` 或 `Collapsed / 已收起`。
- 键盘：原生 `<summary>` 提供 Enter 与 Space 的展开/收起语义；代码没有实现 Accordion 专用的方向键头部导航、单项/多项策略或自定义焦点管理。
- 限制：演示只有一个 details 项，没有专用的 Trigger、Chevron、AccordionItem、动画、禁用/加载状态，也不会验证或展示“保留内容状态”等声明行为。

## 逐条审计

| Entity | Claimed concept | Actual demo | Visible result | Interaction | Match | Significance | Gap |
|---|---|---|---|---|---|---|---|
| `accordion` — Accordion / 手风琴 | **Definition:** 由多个彼此协调的可折叠区段组成，用于展示或隐藏相关内容。<br>**Use:** 用于设置分区、常见问题、高级选项和分组的编辑器属性。 | `preview.renderer = accordion` 未在 `preview-renderer.js` 的专用构造器映射中注册；实际回退到 `EntityDemo`，由 `buildDisclosure()` 创建一个原生 `<details>`。 | 用户只能看到一个 `展开说明 / Show details` summary 和一段可展开的说明文字；没有 `常规 / 外观 / 高级` 等多个区段，也没有同时展开/互斥展开的组关系。 | 点击 summary，或聚焦 summary 后按 Enter/Space，可在关闭与展开之间切换；`toggle` 事件更新 `Expanded / 已展开` 或 `Collapsed / 已收起` 状态文字。 | **Low** | **Low** — 能明显展示“可折叠内容”这一共同基础，但单个 details 不能让用户理解 Accordion 的多条目协调、单项展开或多项展开行为。 | 缺少 Accordion 容器、多个 AccordionItem、各自的 header/panel、单项/多项展开策略、头部方向键导航，以及声明中的 Chevron、Disabled、Loading 和动画状态。 |
| `collapsible` — Collapsible / 可折叠区域 | **Definition:** 由一个控件和一个内容区域组成，可显示或隐藏可选区域。<br>**Use:** 适用于单个可选设置组、侧边栏区段或局部详情块。 | `preview.renderer = collapsible` 未使用专用 Collapsible 构造器；实际由 `EntityDemo.buildDisclosure()` 渲染为一个原生 `<details>`/`<summary>` 与内容段组合。 | 一个单独的 `展开说明 / Show details` 触发项；展开后显示一段附加说明，收起后该段隐藏。 | 点击 summary，或使用原生 Enter/Space 键盘激活，可切换可见性；`toggle` 监听器报告 `Expanded / 已展开` 与 `Collapsed / 已收起`。 | **Medium** | **High** — 单个“触发控件 + 内容区域”的核心揭示/隐藏行为直接可见且可操作，足以说明基本 Collapsible 关系。 | 仍是通用 details demo；没有独立 Trigger/Icon/Label 组件、侧边栏或面板变体、动画、禁用/加载状态，也未专门验证内容状态保留。 |
| `disclosure` — Disclosure / 披露控件 | **Definition:** 一种轻量且具有语义的机制，用于渐进式展示额外信息。<br>**Use:** 用于高级选项、解释、详情和不应占据初始视图主要空间的内容。 | `preview.renderer = disclosure` 未使用专用构造器；实际由 `EntityDemo.buildDisclosure()` 渲染原生 `<details>` 与 `<summary>`。 | 初始只显示 `展开说明 / Show details`；展开后出现附加说明段落，原生 details/summary 关系与内容显隐清楚可见。 | 点击 summary，或按 Enter/Space，可打开/关闭 details；`toggle` 事件把预览状态输出为 `Expanded / 已展开` 或 `Collapsed / 已收起`。 | **High** | **High** — 原生 details 正好展示按需揭示、减少初始内容负担以及 summary 与内容的语义关联；关键行为对用户明显可感知。 | 内容只是单段通用说明；未展示高级选项表单、详细解释、嵌套 disclosure、Disabled 状态或自定义 marker/transition。 |

## 统计

按 `Match` 统计：High **1**、Medium **1**、Low **1**；共 **3** 条审计记录。按 `Significance` 统计：High **2**、Medium **0**、Low **1**。翻译字段 `definitionZh` 和 `useZh` 已为 3 条实体全部补齐。
