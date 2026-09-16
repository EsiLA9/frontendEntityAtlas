可以。你真正需要的不是普通的“UI 组件大全”，而是一套**前端交互组件分类学 / UI Vocabulary**：以后你可以直接对本地 AI 说“这里用 `Selection / Combobox / Multi-select`，不要用普通 Select”，而不是双方都说“下拉框”却理解成不同东西。

而且为了方便和 AI 对齐，我建议颗粒度固定成：

**交互族 → 组件 → Variant → State → Part → Behavior**

例如：

> `Selection → Select → Searchable Select → Open → Trigger/Input/Listbox/Option → keyboard navigation`

这比直接列 HTML 控件细得多，也比把每个 CSS 小零件都算一个组件更实用。

下面我先给你一份可以直接作为“前端组件词典”的超详细基线。

---

# 0. 先统一：什么叫一个“组件”

建议让你的本地 AI 永远区分下面 6 层。

| 层级 | 含义 | 示例 |
|---|---|---|
| **Primitive** | 最小 UI 原语 | Button、Input、Icon |
| **Component** | 独立可复用交互单元 | Select、Tabs、Slider |
| **Composite** | 多组件组合 | SearchBox、DatePicker、FileUploader |
| **Pattern** | 完成某种交互任务的结构 | Master-Detail、Command Palette |
| **Container** | 管理内容布局/区域 | Panel、Drawer、Sidebar |
| **Feature UI** | 具体业务功能 | Theme Editor、Shop Editor |

以后最好不要把“商店”“角色编辑器”“设置页面”叫 component。

它们属于 **Feature UI**，内部由 Component / Composite / Pattern 组成。

---

# 1. Action / 动作组件

这是用户**要求系统执行某件事**的组件族。

## 1.1 Button

最基础动作组件。

### Variant

- Primary Button
- Secondary Button
- Tertiary Button
- Ghost Button
- Outline Button
- Text Button
- Link Button
- Destructive Button
- Success Button
- Icon Button
- Icon + Text Button
- Split Button
- Toggle Button
- Floating Action Button / FAB
- Circular Button
- Square Button
- Compact Button
- Full-width Button

### State

- Default
- Hover
- Focus
- Focus-visible
- Active / Pressed
- Disabled
- Loading
- Selected
- Unselected
- Success
- Error

### 常见 Part

```text
Button
├─ Container
├─ LeadingIcon
├─ Label
├─ TrailingIcon
├─ Badge
└─ Spinner
```

特别要区分：

**Button ≠ Toggle Button。**

Button 表示：

> 做一次动作。

Toggle Button 表示：

> 改变一个持续状态。

---

# 2. Navigation / 导航组件

用于回答：

> “我现在在哪？”  
> “我还能去哪？”

## 2.1 Link

- Text Link
- Inline Link
- Navigation Link
- External Link
- Anchor Link
- Back Link
- Skip Link
- Icon Link

State：

- Default
- Hover
- Focus
- Active
- Visited
- Disabled

---

# 3. Tabs / 标签页

非常容易被 AI 混淆的一类。

## 3.1 Tabs

```text
Tabs
├─ TabList
│  ├─ Tab
│  ├─ Tab
│  └─ Tab
└─ TabPanel
```

Variant：

- Horizontal Tabs
- Vertical Tabs
- Underline Tabs
- Pill Tabs
- Segmented Tabs
- Card Tabs
- Scrollable Tabs
- Fixed Tabs
- Closable Tabs
- Reorderable Tabs
- Icon Tabs
- Icon + Label Tabs

行为：

- click select
- keyboard select
- arrow navigation
- overflow scroll
- overflow menu
- close
- reorder
- lazy render

特别注意：

**Tabs ≠ Segmented Control。**

Tabs 是**内容导航**。

Segmented Control 通常是**一个值的互斥选择**。

---

# 4. Breadcrumb / 面包屑

```text
Breadcrumb
├─ BreadcrumbItem
├─ Separator
├─ BreadcrumbItem
├─ Separator
└─ CurrentItem
```

Variant：

- Text
- Icon
- Collapsed
- Dropdown Overflow

例如：

```text
Project
  /
UI
  /
Theme
  /
Layer Editor
```

---

# 5. Pagination / 分页

包括：

- Previous
- Next
- First
- Last
- Page Number
- Ellipsis
- Page Size Selector
- Jump-to-page Input

Variant：

- Simple
- Numbered
- Compact
- Cursor Pagination
- Infinite Pagination

---

# 6. Sidebar Navigation

侧边导航建议单独作为 Composite。

```text
Sidebar
├─ Header
├─ NavigationSection
│  ├─ SectionLabel
│  ├─ NavItem
│  ├─ NavItem
│  └─ NavGroup
├─ Spacer
└─ Footer
```

NavItem 可进一步包含：

- icon
- label
- badge
- chevron
- active indicator
- context action

---

# 7. Tree Navigation / 树导航

这是编辑器非常重要的一类。

```text
Tree
└─ TreeItem
   ├─ Expander
   ├─ Icon
   ├─ Label
   ├─ Badge
   ├─ Actions
   └─ Children
```

Variant：

- Navigation Tree
- File Tree
- Hierarchy Tree
- Checkbox Tree
- Selectable Tree
- Multi-select Tree
- Editable Tree
- Draggable Tree

Behavior：

- expand
- collapse
- select
- multi-select
- rename
- drag
- drop
- context menu
- keyboard navigation
- lazy loading

---

# 8. Menu / 菜单系统

## Menu

```text
Menu
├─ MenuItem
├─ MenuItem
├─ Separator
├─ MenuItem
└─ Submenu
```

MenuItem Variant：

- Action Item
- Checkbox Item
- Radio Item
- Destructive Item
- Disabled Item
- Submenu Item

## Menu 的具体类型

- Dropdown Menu
- Context Menu
- Application Menu
- Overflow Menu
- Action Menu
- Nested Menu
- Mega Menu

这里同样必须规定：

**Menu ≠ Select。**

Menu：

> 用户选择一个**动作**。

Select：

> 用户选择一个**值**。

这是 AI 写 UI 时最常犯的语义错误之一。

---

# 9. Text Input / 文本输入

## 9.1 基础 Input

Variant：

- Text
- Password
- Email
- URL
- Telephone
- Search
- Numeric
- Decimal
- Integer

组成：

```text
Field
├─ Label
├─ InputContainer
│  ├─ Prefix
│  ├─ LeadingIcon
│  ├─ Input
│  ├─ ClearButton
│  ├─ TrailingIcon
│  └─ Suffix
├─ HelperText
└─ ErrorText
```

State：

- Empty
- Filled
- Hover
- Focus
- Disabled
- Read-only
- Invalid
- Valid
- Loading

---

# 10. Textarea / 多行文本

Variant：

- Fixed
- Resizable
- Auto-grow
- Character-count
- Markdown
- Code
- Rich Text

Part：

- label
- editor
- placeholder
- resize handle
- counter
- helper
- validation

---

# 11. Number Input

不要把它简单当 Text Input。

Variant：

- Number Field
- Stepper
- Scrubbable Number
- Unit Input
- Percentage Input
- Currency Input

例如：

```text
[-] [ 32 ] [+]
```

或者：

```text
Width
[ 128 ] px
```

Behavior：

- increment
- decrement
- min/max clamp
- step
- precision
- keyboard arrows
- mouse wheel
- scrub

---

# 12. Checkbox

语义：

> 多个独立 Boolean。

Variant：

- Checkbox
- Checkbox + Label
- Checkbox + Description
- Checkbox Card

State：

- unchecked
- checked
- indeterminate
- disabled
- error

`indeterminate` 对编辑器尤其重要：

```text
☑ Child A
☐ Child B
▣ Parent
```

---

# 13. Radio

语义：

> 一组选项里恰好选一个。

结构：

```text
RadioGroup
├─ Radio
├─ Radio
└─ Radio
```

Variant：

- Standard
- Radio Card
- Icon Radio
- Image Radio

---

# 14. Switch

语义通常是：

> 立即启用 / 禁用设置。

不要与 Checkbox 完全等价。

典型：

```text
Enable animations   [ ON ]
```

而 Checkbox 更适合：

```text
☑ Include hidden layers
```

---

# 15. Segmented Control

```text
[ Left | Center | Right ]
```

用于少量互斥状态。

Variant：

- Text
- Icon
- Icon + Text
- Compact
- Full Width

非常适合：

```text
Preview
[ Desktop | Tablet | Mobile ]
```

---

# 16. Select / 单选选择器

基础结构：

```text
Select
├─ Label
├─ Trigger
│  ├─ Value
│  └─ Chevron
└─ Popover
   └─ Listbox
      ├─ Option
      ├─ Option
      └─ Option
```

Variant：

- Native Select
- Custom Select
- Searchable Select
- Grouped Select
- Icon Select
- Async Select
- Creatable Select

---

# 17. Combobox

这是需要单独命名的。

Combobox：

> Input + Suggestion List。

用户既可以输入，又可以选择建议。

例如：

```text
Character
[ yuuka________ ]

Yuuka
Yuuka (Sportswear)
Yuuka (Track)
```

行为：

- autocomplete
- filtering
- keyboard navigation
- free text
- option select
- async lookup

---

# 18. Multi-select

Variant：

- Checkbox Multi-select
- Tag Multi-select
- Token Multi-select
- Searchable Multi-select
- Async Multi-select

典型：

```text
Tags
[ Millennium × ] [ Student × ] [ + ]
```

---

# 19. Tag / Chip / Token

这三个词最好主动约定。

### Tag

主要表示信息：

```text
[Student]
```

### Chip

可以包含轻量交互：

```text
[Student ×]
```

### Token

通常代表输入系统里的结构化值：

```text
tags:
[student ×] [millennium ×]
```

Variant：

- Static
- Removable
- Selectable
- Filter
- Input Token
- Status
- Count

---

# 20. Slider

Variant：

- Single Slider
- Range Slider
- Stepped Slider
- Continuous Slider
- Vertical Slider
- Labeled Slider

结构：

```text
Slider
├─ Track
├─ Range
├─ Thumb
└─ Marks
```

Range：

```text
0 ───●════●──── 100
     25   70
```

---

# 21. Color Input

这是实际可以拆出一个完整族的。

包括：

- Color Swatch
- Color Button
- Color Picker
- Color Field
- Hex Input
- RGB Input
- HSL Input
- Alpha Input
- Hue Slider
- Saturation Plane
- Eyedropper
- Palette
- Recent Colors
- Gradient Editor

完整 Composite：

```text
ColorPicker
├─ SaturationArea
├─ HueSlider
├─ AlphaSlider
├─ Preview
├─ FormatSelector
├─ ChannelInputs
└─ Swatches
```

---

# 22. Date / Time Input

包括：

- Date Input
- Time Input
- DateTime Input
- Calendar
- Date Picker
- Date Range Picker
- Month Picker
- Year Picker
- Time Picker
- Duration Input

Calendar 内部：

```text
Calendar
├─ Header
│  ├─ Previous
│  ├─ MonthYear
│  └─ Next
├─ WeekHeader
└─ CalendarGrid
   └─ DayCell
```

DayCell states：

- today
- selected
- range-start
- range-middle
- range-end
- disabled
- outside-month

---

# 23. Search

Search 应该视为 Composite，而非简单 Input。

```text
SearchField
├─ SearchIcon
├─ Input
├─ ClearButton
└─ ShortcutHint
```

更复杂：

```text
Search
├─ QueryInput
├─ Suggestions
├─ RecentQueries
├─ Filters
└─ Results
```

Variant：

- Instant Search
- Submit Search
- Global Search
- Local Search
- Search + Filters
- Search + Autocomplete

---

# 24. File Input / 文件交互

包括：

- File Picker
- File Dropzone
- Upload Button
- Upload Queue
- File Preview
- Attachment
- File Card
- Progress Item

完整：

```text
FileUploader
├─ Dropzone
├─ BrowseButton
├─ FileQueue
│  └─ FileItem
│     ├─ Icon
│     ├─ Filename
│     ├─ Size
│     ├─ Progress
│     ├─ Status
│     └─ Remove
└─ ErrorMessage
```

State：

- idle
- drag-over
- uploading
- processing
- success
- failed
- cancelled

---

# 25. Data Display / 数据展示

这一族不负责输入，而负责让用户理解系统状态。

## Text

- Heading
- Paragraph
- Label
- Caption
- Helper Text
- Metadata
- Code
- Keyboard Shortcut
- Quote

## Icon

- Decorative Icon
- Semantic Icon
- Status Icon
- Action Icon

## Avatar

- Image Avatar
- Initial Avatar
- Icon Avatar
- Avatar Group

## Badge

- Status Badge
- Count Badge
- Notification Badge
- Semantic Badge

## Tooltip

- Plain Tooltip
- Rich Tooltip
- Shortcut Tooltip

## Divider

- Horizontal
- Vertical
- Labeled Divider

---

# 26. Card

Card 是一个**内容容器**，不是“所有有圆角背景的东西”。

结构：

```text
Card
├─ Header
│  ├─ Title
│  ├─ Subtitle
│  └─ Actions
├─ Media
├─ Content
└─ Footer
```

Variant：

- Static
- Clickable
- Selectable
- Expandable
- Draggable
- Product Card
- Stat Card
- Media Card
- Form Card

State：

- default
- hover
- selected
- disabled
- dragging

---

# 27. List

```text
List
└─ ListItem
   ├─ Leading
   ├─ PrimaryText
   ├─ SecondaryText
   ├─ Metadata
   └─ TrailingAction
```

Variant：

- Simple List
- Navigation List
- Action List
- Selectable List
- Multi-select List
- Editable List
- Reorderable List
- Virtualized List

---

# 28. Table

这是一个超级大类。

基础：

```text
Table
├─ Header
│  └─ ColumnHeader
└─ Body
   └─ Row
      └─ Cell
```

能力可以独立组合：

- Sorting
- Filtering
- Pagination
- Column Resize
- Column Reorder
- Row Selection
- Multi Selection
- Inline Editing
- Expandable Row
- Grouping
- Pinning
- Sticky Header
- Sticky Column
- Virtualization
- Drag Row
- Cell Actions

因此复杂版本应该直接叫：

**Data Grid**。

---

# 29. Data Grid

与 Table 区别在于：

> Table 偏“展示表格数据”；Data Grid 本身就是一个交互工作区。

DataGrid 可能拥有：

```text
DataGrid
├─ Toolbar
├─ ColumnHeader
├─ FilterRow
├─ Body
│  ├─ Row
│  │  └─ EditableCell
│  └─ ...
├─ Selection
├─ ContextMenu
└─ Pagination
```

尤其适合你的 Editor 数据管理。

---

# 30. Key-Value / Property View

编辑器里极其常见，却经常没有名字。

```text
PropertyList
├─ PropertyRow
│  ├─ PropertyName
│  └─ PropertyValue
└─ ...
```

进一步就是：

**Property Inspector**。

```text
Inspector
├─ Section
│  ├─ SectionHeader
│  └─ PropertyRow
├─ Section
└─ Section
```

这正是很多游戏编辑器右侧属性栏的基本结构。

---

# 31. Definition List / Description List

适合只读属性：

```text
ID          student.yuuka
Type        Character
Mod         base
Status      Active
```

不要为了这个东西上 DataGrid。

---

# 32. Code Block / Code Viewer

包括：

- Inline Code
- Code Block
- Code Viewer
- Code Editor
- Diff Viewer
- JSON Viewer
- Syntax Tree Viewer

Code Editor 可具有：

- line numbers
- syntax highlighting
- autocomplete
- folding
- diagnostics
- minimap
- find/replace

---

# 33. JSON / Object Viewer

对数据包编辑器尤其有价值。

```text
Object
├─ key: value
├─ key:
│  └─ Object
└─ key:
   └─ Array
```

Variant：

- Read-only
- Editable
- Tree
- Raw
- Form
- Diff

---

# 34. Tree View

与 Tree Navigation 有一点区别。

Tree View 可以表示**任何层次数据**。

例如：

```text
Condition
└─ ALL
   ├─ Level >= 10
   └─ ANY
      ├─ Tag: student
      └─ Tag: teacher
```

正好适合你之前设计的 Condition 缩进显示。

Tree Node 可拥有：

- expander
- type icon
- label
- summary
- status
- actions
- children

---

# 35. Progress / 状态反馈

## Progress Bar

- Determinate
- Indeterminate
- Buffered
- Segmented

## Spinner

- Inline
- Page
- Button

## Skeleton

- Text Skeleton
- Card Skeleton
- Table Skeleton

## Status Indicator

- Dot
- Icon
- Badge
- Text

---

# 36. Empty State

这个也应该正式纳入组件词典。

```text
EmptyState
├─ Illustration
├─ Title
├─ Description
├─ PrimaryAction
└─ SecondaryAction
```

区分：

- No Data
- No Results
- First Use
- Permission Missing
- Error
- Filtered Empty

---

# 37. Feedback / 消息反馈

## Alert

页面内长期存在：

- Info
- Success
- Warning
- Error

## Toast

短暂反馈：

```text
Toast
├─ Icon
├─ Message
├─ Action
└─ Close
```

Variant：

- success
- info
- warning
- error
- loading

## Snackbar

类似 Toast，但更强调：

> 发生了一次操作 + 可以采取轻量后续动作。

例如：

```text
Layer deleted. [Undo]
```

---

# 38. Dialog / Modal

Dialog 是非常重要的 Pattern。

```text
Dialog
├─ Backdrop
└─ DialogSurface
   ├─ Header
   │  ├─ Title
   │  └─ Close
   ├─ Body
   └─ Footer
      ├─ Cancel
      └─ Confirm
```

Variant：

- Modal Dialog
- Non-modal Dialog
- Alert Dialog
- Confirmation Dialog
- Form Dialog
- Full-screen Dialog
- Wizard Dialog

需要区分：

**Modal 是行为模式。Dialog 是 UI。**

---

# 39. Drawer

从屏幕边缘进入。

Variant：

- Left Drawer
- Right Drawer
- Bottom Drawer
- Temporary Drawer
- Persistent Drawer

用途：

- Inspector
- Settings
- Detail
- Navigation
- Filters

---

# 40. Sheet

与 Drawer 接近，但通常更强调覆盖式内容容器。

尤其移动端：

- Bottom Sheet
- Side Sheet

Bottom Sheet 又可以：

- Modal
- Persistent
- Expandable

---

# 41. Popover

锚定某个元素的浮层：

```text
Anchor
   ↓
┌───────────┐
│ Popover   │
└───────────┘
```

它是很多组件的基础设施：

- Select
- Color Picker
- Date Picker
- Menu
- Rich Tooltip

---

# 42. Hover Card

比 Tooltip 丰富，但通常不要求明确点击。

例如鼠标停在角色名：

```text
Yuuka
 ↓
┌────────────────┐
│ portrait       │
│ Millennium     │
│ Level 42       │
└────────────────┘
```

---

# 43. Accordion

```text
> General
v Appearance
    Theme
    Background
> Advanced
```

结构：

```text
Accordion
└─ AccordionItem
   ├─ Trigger
   └─ Panel
```

Variant：

- Single Expand
- Multiple Expand
- Nested

---

# 44. Collapsible

比 Accordion 更基础。

```text
Collapsible
├─ Trigger
└─ Content
```

Accordion = 一组具有约定关系的 Collapsible。

---

# 45. Disclosure

语义更加轻：

```text
▶ Advanced options
```

点击：

```text
▼ Advanced options
   ...
```

适合逐步披露复杂度。

---

# 46. Layout / 布局容器

这一层 AI 特别容易滥造 div，所以也值得命名。

## Stack

纵向或横向排列：

```text
Stack
├─ Item
├─ Item
└─ Item
```

- VStack
- HStack

## Flex

自由弹性排列。

## Grid

二维布局。

## Cluster

一群自动换行的同级元素：

```text
[tag] [tag] [tag] [tag]
[tag]
```

## Split

两个区域：

```text
LEFT | RIGHT
```

## Sidebar Layout

```text
SIDEBAR | CONTENT
```

## Center

约束内容宽度并居中。

## Container

控制页面最大宽度。

---

# 47. Panel

编辑器非常需要把它定义清楚。

Panel：

> 一个持续存在的功能区域。

例如：

```text
┌ LEFT ┐ ┌ CENTER ┐ ┌ RIGHT ┐
│      │ │        │ │       │
│      │ │        │ │       │
└──────┘ └────────┘ └───────┘
```

Variant：

- Static Panel
- Scrollable Panel
- Collapsible Panel
- Resizable Panel
- Dockable Panel
- Floating Panel

---

# 48. Split Pane

编辑器核心组件。

```text
Panel A
   │
   ↔
   │
Panel B
```

结构：

```text
SplitPane
├─ Pane
├─ ResizeHandle
└─ Pane
```

支持：

- horizontal
- vertical
- min size
- max size
- collapse
- resize
- persisted size

多个就是：

**Multi-pane Layout**。

---

# 49. Resizable

最好把 ResizeHandle 当 Primitive：

```text
ResizeHandle
```

可以被：

- Panel
- Column
- Dialog
- Inspector
- Split Pane

复用。

---

# 50. Scroll Area

不要只写：

```css
overflow: auto
```

在设计语言里可以明确为：

```text
ScrollArea
├─ Viewport
├─ Scrollbar
│  └─ Thumb
└─ Corner
```

Variant：

- vertical
- horizontal
- both
- auto-hide

---

# 51. Toolbar

```text
Toolbar
├─ Button
├─ Toggle
├─ Separator
├─ Select
└─ OverflowMenu
```

Variant：

- Page Toolbar
- Editor Toolbar
- Formatting Toolbar
- Floating Toolbar
- Contextual Toolbar

---

# 52. App Bar / Header

包括：

- Top App Bar
- Navigation Bar
- Page Header
- Editor Header
- Title Bar

典型：

```text
Header
├─ Navigation
├─ Title
├─ Context
├─ Spacer
└─ Actions
```

---

# 53. Footer / Status Bar

尤其编辑器：

```text
StatusBar
├─ Runtime Status
├─ Selection Status
├─ Validation
├─ Spacer
└─ Version
```

例如：

```text
Ready | 3 selected | ⚠ 2 warnings | Runtime
```

---

# 54. Form

Form 不只是很多 Input 放一起。

```text
Form
├─ FormSection
│  ├─ SectionHeader
│  ├─ Field
│  ├─ Field
│  └─ Field
└─ FormActions
```

需要命名：

- Form
- Form Section
- Field
- Field Group
- Fieldset
- Label
- Description
- Helper
- Error
- Required Indicator

---

# 55. Inline Editing

一种重要 Pattern：

```text
Name: Yuuka
```

点击后：

```text
Name: [Yuuka_______] ✓ ×
```

Variant：

- Click-to-edit
- Double-click
- Persistent Inline Input
- Spreadsheet Cell Edit

State：

```text
view
→ editing
→ validating
→ saving
→ success/error
```

---

# 56. Validation

至少统一这些概念：

- Field Validation
- Form Validation
- Inline Error
- Error Summary
- Warning
- Info Diagnostic
- Blocking Error
- Non-blocking Warning

编辑器则可以使用：

```text
Diagnostic
├─ Severity
├─ Message
├─ Location
└─ QuickFix
```

Severity：

```text
Error
Warning
Info
Hint
```

---

# 57. Filter

Filter 不是单个组件，而是一组 Pattern。

基础：

```text
FilterBar
├─ Filter
├─ Filter
└─ ClearAll
```

Filter 可以是：

- Select Filter
- Multi-select Filter
- Range Filter
- Date Filter
- Search Filter
- Boolean Filter
- Tag Filter

高级：

```text
FilterBuilder
└─ FilterGroup
   ├─ AND / OR
   └─ FilterCondition
```

这与你的 Condition Builder 已经很接近了。

---

# 58. Query Builder / Condition Builder

这是非常值得单独列出的高级 Composite。

```text
ConditionGroup
├─ Operator: ALL
├─ Condition
│  ├─ Field
│  ├─ Operator
│  └─ Value
└─ ConditionGroup
   ├─ Operator: ANY
   └─ ...
```

UI：

```text
ALL
├── Level      >=    10
└── ANY
    ├── Tag    has   student
    └── Area   is    millennium
```

支持：

- nested groups
- AND
- OR
- NOT
- N-of
- add condition
- add group
- delete
- reorder
- collapse

你的 AronaClicker Condition UI 应该直接把这一类正式命名为 **Condition Builder / Condition Tree Editor**，而不是泛称“条件控件”。

---

# 59. Builder / Editor 类高级组件

这类是“网页应用”与普通网页开始分家的地方。

包括：

- Rule Builder
- Expression Builder
- Formula Editor
- Query Builder
- Condition Builder
- Workflow Builder
- Schema Editor
- Object Editor
- Array Editor
- JSON Editor
- Theme Editor
- Gradient Editor
- Layer Editor
- Timeline Editor
- Node Editor
- Graph Editor

---

# 60. Layer Editor

你的项目里尤其值得正式定义。

```text
LayerEditor
├─ LayerToolbar
│  └─ AddLayer
└─ LayerList
   └─ LayerItem
      ├─ DragHandle
      ├─ VisibilityToggle
      ├─ Preview
      ├─ Name
      ├─ Type
      ├─ EditAction
      └─ DeleteAction
```

LayerItem state：

- selected
- hidden
- locked
- dragging
- invalid

行为：

- add
- remove
- duplicate
- hide
- show
- reorder
- edit
- select

这样以后就能告诉 AI：

> 实现 `LayerEditor`，不是重新设计 Theme UI。

---

# 61. Drag & Drop

Drag & Drop 应该作为一种 Interaction System，而不是组件。

涉及：

```text
Draggable
DropTarget
DragHandle
DragPreview
DropIndicator
DropZone
```

State：

- idle
- drag-start
- dragging
- drag-over
- allowed
- forbidden
- dropped

模式：

- reorder
- move
- copy
- attach
- upload

---

# 62. Selection System

大型编辑器最好单独定义：

- Single Selection
- Multi Selection
- Range Selection
- Toggle Selection
- Select All
- Clear Selection

状态：

```text
unselected
selected
focused
active
```

注意：

**Selected ≠ Focused。**

这是复杂 UI 里很重要的区分。

---

# 63. Contextual Actions

用户选中对象后出现动作：

```text
[ Layer 03 selected ]

Duplicate | Hide | Delete
```

实现形式可以是：

- Context Toolbar
- Context Menu
- Floating Toolbar
- Inspector Actions

---

# 64. Command Palette

典型：

```text
┌─────────────────────────┐
│ > Search commands...    │
├─────────────────────────┤
│ Add Spot           Ctrl+A
│ Open Theme Editor       │
│ Validate Mod            │
└─────────────────────────┘
```

结构：

```text
CommandPalette
├─ SearchInput
├─ CommandList
│  └─ CommandItem
│     ├─ Icon
│     ├─ Label
│     ├─ Category
│     └─ Shortcut
└─ EmptyState
```

---

# 65. Keyboard Shortcut UI

包括：

- Shortcut Hint
- Keycap / Kbd
- Shortcut List
- Shortcut Recorder

例如：

```text
Save        Ctrl + S
Undo        Ctrl + Z
```

---

# 66. Undo / Redo

这不是简单两个 Button，而是一套 Interaction Pattern：

```text
Command
↓
History Stack
↓
Undo / Redo
```

UI 可以包括：

- Undo Button
- Redo Button
- History Menu
- History Panel
- Revert Action

编辑器一定要明确：

```text
save ≠ apply ≠ commit ≠ undo
```

---

# 67. Dirty State / 未保存状态

组件状态：

```text
Theme *
```

或者：

```text
● Unsaved changes
```

相关 UI：

- Dirty Indicator
- Save Button
- Revert Button
- Unsaved Changes Dialog

---

# 68. Loading / Async Interaction

最好统一生命周期：

```text
idle
↓
loading
↓
success
   or
error
```

复杂：

```text
idle
requesting
optimistic
confirmed
failed
retrying
```

对应 UI：

- Spinner
- Progress
- Skeleton
- Retry
- Error State
- Optimistic State

---

# 69. Wizard / Stepper

用于多阶段任务：

```text
① Basic
   ↓
② Content
   ↓
③ Validation
   ↓
④ Publish
```

结构：

```text
Wizard
├─ StepIndicator
├─ StepContent
└─ Navigation
```

State：

- upcoming
- current
- completed
- error
- disabled

---

# 70. Stepper

需要与 Number Stepper 区分。

这里指：

**Progress Stepper**。

Variant：

- Horizontal
- Vertical
- Numbered
- Icon
- Clickable
- Non-linear

---

# 71. Master–Detail

编辑器里非常重要：

```text
ITEM LIST       DETAIL
─────────       ─────────────
Spot A    →     Name: Spot A
Spot B          Level: ...
Spot C          Tags: ...
```

Pattern：

```text
MasterDetail
├─ Master
│  └─ Collection
└─ Detail
   └─ Inspector
```

---

# 72. List–Detail–Inspector

更适合复杂编辑器：

```text
NAVIGATION | CONTENT | INSPECTOR
```

例如：

```text
Def Tree | Visual Editor | Properties
```

你的 AronaClicker 左/中/右 panel 很适合直接使用这一层术语，而不是只描述三个 div。

---

# 73. Dashboard

不是组件，是 Pattern：

```text
Dashboard
├─ KPI
├─ Chart
├─ Activity
├─ Table
└─ Actions
```

内部可以包括：

- Metric Card
- KPI
- Trend
- Sparkline
- Chart
- Summary

---

# 74. Charts / Visualization

如果网页涉及数据展示：

- Line Chart
- Area Chart
- Bar Chart
- Stacked Bar
- Pie
- Donut
- Scatter
- Bubble
- Histogram
- Heatmap
- Treemap
- Sankey
- Radar
- Gauge
- Timeline

交互：

- tooltip
- hover highlight
- legend toggle
- zoom
- pan
- brush
- selection
- drill-down

---

# 75. Timeline

两种完全不同的 Timeline 要分开。

### Event Timeline

```text
● Created
│
● Modified
│
● Published
```

### Editor Timeline

```text
0s────5s────10s────15s
████ Layer A
   █████ Animation
```

后者涉及：

- track
- clip
- keyframe
- playhead
- ruler
- zoom
- scrub

---

# 76. Graph / Node Editor

```text
[Trigger]
    │
    ▼
[Condition] ──→ [Effect]
```

组成：

```text
GraphEditor
├─ Canvas
├─ Node
│  ├─ InputPort
│  └─ OutputPort
├─ Edge
├─ SelectionBox
├─ Minimap
└─ Toolbar
```

行为：

- pan
- zoom
- select
- box select
- connect
- disconnect
- drag node
- snap
- align

---

# 77. Canvas / Workspace

这里的 Canvas 指通用无限工作区，不是 HTML Canvas API。

能力：

- Pan
- Zoom
- Grid
- Snap
- Guides
- Selection
- Multi-select
- Marquee
- Transform
- Context Menu

子组件：

```text
Workspace
├─ Viewport
├─ Content
├─ Grid
├─ Guides
├─ SelectionOverlay
├─ ZoomControl
└─ Minimap
```

---

# 78. Image / Media Interaction

包括：

- Image
- Image Preview
- Gallery
- Carousel
- Lightbox
- Zoom Viewer
- Cropper
- Media Player
- Audio Player
- Video Player

Image Editor 可包括：

- crop
- rotate
- scale
- pan
- zoom
- mask

---

# 79. Carousel

```text
Carousel
├─ Viewport
│  └─ Slides
├─ Previous
├─ Next
└─ Indicators
```

Variant：

- Single
- Multi-item
- Infinite
- Auto-play
- Thumbnail Navigation

---

# 80. Notification System

与 Toast 不完全一样。

```text
NotificationCenter
├─ NotificationList
│  └─ Notification
└─ Controls
```

Notification：

- unread/read
- timestamp
- category
- actions
- dismiss

---

# 81. Activity / History

包括：

- Activity Feed
- Audit Log
- Change Log
- Revision History
- Transaction History

编辑器：

```text
14:21 Theme changed
14:20 Layer deleted
14:18 Spot renamed
```

---

# 82. Help / Guidance

不要忽视这一类。

包括：

- Tooltip
- Helper Text
- Info Popover
- Contextual Help
- Help Panel
- Documentation Link
- Coach Mark
- Tour
- Spotlight
- Onboarding
- Example
- Placeholder
- Empty State Guidance

---

# 83. Confirmation

按危险等级最好分：

### Ordinary Confirmation

```text
Delete this layer?
[Cancel] [Delete]
```

### Typed Confirmation

```text
Type DELETE to continue:
[________]
```

### Consequence Preview

```text
Deleting Area A will affect:
• 4 Spots
• 3 Stories
• 2 references
```

这对编辑器的数据删除非常有价值。

---

# 84. Context / Scope Selector

复杂应用经常需要：

```text
Project: [ AronaClicker ▼ ]
Mod:     [ base ▼ ]
Area:    [ Millennium ▼ ]
```

可以正式称：

- Scope Selector
- Context Selector
- Workspace Selector

而不是每次都叫 Dropdown。

---

# 85. Status / Mode Selector

编辑器里尤其容易混：

```text
[ Edit | Preview | Runtime ]
```

它通常属于：

**Mode Switcher**

可以用 Segmented Control、Tabs 或 Toolbar Button 实现，但**Mode Switcher 是语义，Segmented Control 是表现组件**。

这点非常重要。

---

# 86. Preview

Preview 也是 Pattern。

- Live Preview
- Static Preview
- Split Preview
- Device Preview
- Before/After Preview
- Diff Preview

例如：

```text
EDITOR          PREVIEW
─────────       ─────────
Theme           rendered UI
```

---

# 87. Diff

包括：

- Text Diff
- JSON Diff
- Object Diff
- Image Diff
- Before / After

显示方式：

- Unified
- Side-by-side
- Inline
- Structural

状态：

- added
- removed
- modified
- unchanged

---

# 88. Inspector

我会强烈建议把它纳入你的核心词汇。

Inspector 不是普通 Form。

它表达：

> **当前 Selection 对象的属性编辑界面。**

```text
Inspector
├─ Identity
├─ PropertySection
├─ PropertySection
├─ AdvancedSection
└─ Actions
```

当 Selection 改变：

```text
Selection
↓
Inspector Context
↓
Inspector rerender
```

---

# 89. Browser / Explorer

例如：

- Asset Browser
- File Browser
- Content Browser
- Character Browser
- Definition Browser

典型：

```text
Browser
├─ Toolbar
│  ├─ Search
│  ├─ Filter
│  └─ ViewMode
├─ Navigation
└─ Content
   ├─ Grid/List
   └─ Item
```

---

# 90. Picker

Picker 是非常有用的语义大类：

> 从某个对象集合中选择引用。

例如：

- Character Picker
- Asset Picker
- Icon Picker
- Color Picker
- Definition Picker
- File Picker

典型：

```text
DefinitionPicker
├─ Search
├─ TypeFilter
├─ Results
├─ Preview
└─ Select
```

所以：

```text
<select>
```

与：

```text
CharacterPicker
```

完全不是同一个颗粒度。

---

# 91. Reference Field

游戏编辑器尤其需要。

例如：

```text
Owner
[ Character: Yuuka ] [↗] [×]
```

结构：

```text
ReferenceField
├─ ReferencePreview
├─ OpenPicker
├─ NavigateToTarget
└─ Clear
```

State：

- valid
- missing
- unresolved
- suspended
- incompatible

对于你正在做的 Def 编辑体系，这会比简单 Select 精确得多。

---

# 92. Collection Editor

用于编辑：

```ts
Item[]
```

结构：

```text
CollectionEditor
├─ Toolbar
│  └─ Add
└─ Items
   └─ CollectionItem
      ├─ DragHandle
      ├─ Summary
      ├─ Edit
      ├─ Duplicate
      └─ Delete
```

支持：

- add
- edit
- remove
- duplicate
- reorder
- collapse

---

# 93. Object Editor

用于：

```ts
{
  id,
  name,
  weight,
  condition
}
```

通常：

```text
ObjectEditor
└─ PropertyEditor[]
```

PropertyEditor 根据 Schema 动态映射：

```text
string  → TextField
number  → NumberField
boolean → Switch / Checkbox
enum    → Select
ref     → ReferenceField
array   → CollectionEditor
object  → ObjectEditor
```

这个抽象对于数据驱动编辑器非常重要。

---

# 94. Enum Editor

不要简单全部 Select。

根据选项数可以是：

```text
2 options
→ Switch / Segmented

3–5
→ Radio / Segmented

5–20
→ Select

20+
→ Searchable Select

large entity set
→ Picker
```

这是非常适合交给 AI 的 UI 决策规则。

---

# 95. Range / Bounds Editor

例如：

```text
Min [ 0 ]
Max [ 100 ]
```

或：

```text
0 ───●══════●─── 100
```

可作为：

- Range Field
- Range Slider
- Bounds Editor

---

# 96. Vector / Structured Numeric Editor

游戏工具常见：

```text
Position
X [0]
Y [0]
Z [0]
```

包括：

- Vector2
- Vector3
- Vector4
- Rect
- Size
- Insets
- Margin
- Padding

例如：

```text
Padding
Top    8
Right  12
Bottom 8
Left   12
```

可以支持 link values：

```text
🔗 8 8 8 8
```

---

# 97. Resource / Asset Field

```text
Background
[ thumbnail ] bg_school.png
              [Choose] [Clear]
```

与 ReferenceField 相似，但针对资源。

支持：

- preview
- replace
- clear
- locate
- upload/import

---

# 98. Reorderable List

应该独立于普通 List：

```text
≡ Layer A
≡ Layer B
≡ Layer C
```

包含：

- DragHandle
- DropIndicator
- Keyboard Reorder
- Move Up
- Move Down

---

# 99. Sortable

与 Reorderable 不一样。

Sortable：

> 按某字段排序。

```text
Name ↑
Date
Type
```

Reorderable：

> 用户修改数据本身的顺序。

这也是很值得强制 AI 区分的一对。

---

# 100. 最容易混淆的 UI 词汇关系

如果你准备做一套“给本地 AI 用的前端规范”，我建议直接把下面这张关系表放进 system prompt / AGENTS.md。

| 不要混为一谈 | 区别 |
|---|---|
| Button / Toggle | 一次动作 / 持续状态 |
| Checkbox / Switch | 选择条件 / 即时开关 |
| Radio / Select | 展开显示互斥项 / 收起互斥项 |
| Select / Combobox | 选已有值 / 输入+建议 |
| Select / Picker | 简单值选择 / 复杂对象选择 |
| Menu / Select | 选择动作 / 选择值 |
| Tabs / Segmented | 内容导航 / 值或模式切换 |
| Tooltip / Popover | 简短说明 / 丰富交互浮层 |
| Popover / Dialog | 锚定局部 / 独立任务 |
| Dialog / Drawer | 中心临时任务 / 边缘辅助区域 |
| List / Tree | 平级 / 层级 |
| Table / DataGrid | 数据展示 / 数据操作 |
| Form / Inspector | 提交一组数据 / 编辑当前对象 |
| Tag / Chip / Token | 信息 / 轻交互 / 结构化输入值 |
| Accordion / Collapsible | 一组折叠区 / 单个折叠区 |
| Sort / Reorder | 改变显示排序 / 改变真实顺序 |
| Hidden / Disabled | 不显示 / 显示但不可操作 |
| Readonly / Disabled | 可查看复制 / 不参与正常交互 |
| Selected / Focused | 被选择 / 当前键盘焦点 |
| Hover / Active | 指针悬停 / 正在按压 |
| Save / Apply | 持久保存 / 应用当前修改 |
| Delete / Remove | 删除对象 / 从集合或关系移除 |
| Close / Cancel | 关闭界面 / 放弃当前操作 |
| Search / Filter | 找匹配目标 / 缩小当前集合 |
| Browser / Picker | 浏览对象 / 为某字段选择对象 |
| Editor / Builder | 修改已有结构 / 构造复杂结构 |
| Panel / Card | 功能区域 / 内容单元 |
| Sidebar / Drawer | 持续布局区域 / 临时边缘浮层 |
| Modal / Dialog | 交互阻塞模式 / UI 容器 |

---

# 101. 再往上一层：建议你的 AI 使用这套总分类

如果目的是建立一份**真正能长期用于 AronaClicker、本地 AI、网页 Demo 和设计讨论的 UI Vocabulary**，我会把所有东西收束成下面这棵树，而不是让 100 多个组件平铺：

```text
UI SYSTEM
│
├── 01 Actions
│   ├── Button
│   ├── IconButton
│   ├── ToggleButton
│   └── SplitButton
│
├── 02 Inputs
│   ├── TextField
│   ├── TextArea
│   ├── NumberField
│   ├── Checkbox
│   ├── Radio
│   ├── Switch
│   ├── Slider
│   ├── ColorField
│   ├── DateField
│   └── FileField
│
├── 03 Selection
│   ├── Select
│   ├── Combobox
│   ├── MultiSelect
│   ├── SegmentedControl
│   ├── Picker
│   └── ReferenceField
│
├── 04 Navigation
│   ├── Link
│   ├── Tabs
│   ├── Breadcrumb
│   ├── Pagination
│   ├── Sidebar
│   └── TreeNavigation
│
├── 05 Commands
│   ├── Menu
│   ├── ContextMenu
│   ├── Toolbar
│   ├── CommandPalette
│   └── Shortcut
│
├── 06 Data Display
│   ├── Text
│   ├── Icon
│   ├── Avatar
│   ├── Badge
│   ├── Card
│   ├── List
│   ├── Table
│   ├── Tree
│   ├── PropertyList
│   └── CodeViewer
│
├── 07 Feedback
│   ├── Alert
│   ├── Toast
│   ├── Progress
│   ├── Spinner
│   ├── Skeleton
│   ├── EmptyState
│   └── Diagnostic
│
├── 08 Overlay
│   ├── Tooltip
│   ├── Popover
│   ├── HoverCard
│   ├── Dialog
│   ├── Drawer
│   └── Sheet
│
├── 09 Disclosure
│   ├── Accordion
│   ├── Collapsible
│   └── Disclosure
│
├── 10 Layout
│   ├── Stack
│   ├── Grid
│   ├── Split
│   ├── Panel
│   ├── SplitPane
│   ├── ScrollArea
│   └── Container
│
├── 11 Forms
│   ├── Form
│   ├── Field
│   ├── FieldGroup
│   ├── FormSection
│   └── Validation
│
├── 12 Collection
│   ├── CollectionEditor
│   ├── ReorderableList
│   ├── DataGrid
│   └── Browser
│
├── 13 Structured Editing
│   ├── ObjectEditor
│   ├── ArrayEditor
│   ├── EnumEditor
│   ├── ReferenceEditor
│   ├── ConditionBuilder
│   ├── RuleBuilder
│   ├── LayerEditor
│   └── SchemaEditor
│
├── 14 Workspace
│   ├── Inspector
│   ├── MasterDetail
│   ├── MultiPane
│   ├── Canvas
│   ├── GraphEditor
│   ├── Timeline
│   └── Preview
│
├── 15 Interaction
│   ├── Selection
│   ├── DragDrop
│   ├── Resize
│   ├── KeyboardNavigation
│   ├── UndoRedo
│   └── Clipboard
│
└── 16 Application State
    ├── Loading
    ├── Saving
    ├── Dirty
    ├── Error
    ├── Empty
    ├── Disabled
    ├── Readonly
    └── Offline
```

这一级已经可以作为**你和 AI 之间的“UI 本体论”**了。

更进一步，我反而建议你**真的做一个本地网页 Component Atlas**：左侧就是上述 16 类，中央实时展示每种组件，右侧显示 `名称 / 定义 / 适用场景 / 不适用场景 / variants / states / anatomy / interaction / accessibility / HTML 示例`，每个组件还能直接点选并复制诸如 `Selection.Combobox.Searchable` 这样的规范 ID。这样以后你不是跟 AI 说“给我搞个差不多这样的下拉框”，而是直接引用组件 ID，颗粒度基本不会再漂。

如果你愿意，我下一步可以直接给你制定这套 **Component Atlas 的完整数据 Schema + 约 150–200 个组件的最终分类目录**，专门做到可以丢给本地 AI 一次性生成那个“UI 组件挑选网页”。