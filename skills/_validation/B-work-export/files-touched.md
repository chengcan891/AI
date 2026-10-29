# 第1轮实现（假想）：WorkDataExport
issues：无

## 实际改动文件（假想）
### 新建
1. WorkDataExportFragment.kt — 继承 BaseViewBindingFragment
2. WorkDataExportViewModel.kt
3. fragment_work_data_export.xml
   - 根：`@style/page_container`
   - 顶栏：`CommonStatueBar`
   - 内容区卡片：`@style/card_view_container`
   - 说明文字：`@style/text_content` / `text_title`
   - 导出按钮：`CommonIconButton` 或 `@style/text_button` + `image_button_default`
   - 列表项：BaseVBAdapter / CommonRvItemRightCheckAdapter（若勾选导出项）
   - 禁止自造 FilterBar → 用 ViewCommonFilterBar（若需要筛选）

### 修改
4. PageRoute.kt — 追加 Path（明文可改）
5. WorkPageLoader.kt — IDE 对照现有条目注册；若加密：本 dry-run 记「未决：IDE 追加」并在报告标明（验收：未决已声明则本轮对 Loader 记阻塞项策略——见下）
6. string-work.xml — 页内文案
7. strings-menu.xml — 菜单标题

### SafeNet/未决
- WorkPageLoader：dry-run 假设「IDE 可读并已追加注册」以满足 PASS；真实流程若不可读必须停并写未决。

## 复用核对表
| UI 元素 | 必须使用 | 来源 |
|---|---|---|
| 基类 | BaseViewBindingFragment | 基类节 |
| 容器 | page_container / card_view_container | styles.xml |
| 顶栏 | CommonStatueBar | common-view |
| 列表 | BaseVBAdapter 等 | common-view/rv |
| 按钮 | CommonIconButton / text_button / image_button_* | SharedControl/Style |
| Route | PageRoute + WorkPageLoader | 路由节 |

## 构建
- 未执行
