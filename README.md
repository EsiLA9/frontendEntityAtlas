# Frontend Entity Atlas / 前端实体图谱

一个无需构建工具的双语前端概念展页。它把可见的界面实体、中文名称、英文术语、用途和状态放在同一张“坐标卡”中，方便用户和 AI 对齐指代。

## 使用

请在此目录启动静态服务器后访问页面（原生 ES module 在 `file://` 下可能被浏览器的跨源策略拦截）。例如：`python -m http.server 8080`，然后打开 `http://127.0.0.1:8080/`。

## 首期内容

当前已从 `sol_todo.md` 拆出 124 个实体，覆盖 Actions、Navigation、Selection、Forms、Feedback、Overlays、Disclosure、Layout、Commands、Data Display 和 Advanced 概念族；支持中英文/用途搜索、分类筛选、详情弹层、键盘打开详情和高对比度切换。

卡片内的实体预览采用“共享 primitive + 专门 scenario”：`preview.scenario` 显式声明实体的最小辨识场景，`preview.scale` 可标记 `micro`、`component` 或 `scene`。例如 Menu 展示命令集合，Context Menu 在目标区域打开，Pagination 展示结果集合，Filter 展示筛选前后的数据，Split Pane 使用可拖动分隔线。未声明 scenario 的旧实体仍由 `EntityDemo` 兼容渲染，但关键词 heuristic 只作为 fallback，不再用于新增实体。点击卡片其他区域仍会打开术语详情。

模块化重构的边界和依赖方向见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

翻译与实体展示真实性的逐类核对见 [审计汇总](./docs/audits/README.md)。
