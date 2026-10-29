# 功能说明：WorkDataExport（假想）
类型：ui-page + route-wire    速查：B
一句话目标：跨模块可打开的「作业数据导出」页（列表+导出按钮），注册 Path 与 WorkPageLoader。
约定阅读切片：按类型速查·B；域映射 work；基类；SharedStyle；SharedControl；路由+SafeNet；范例·2结构 + ·5接线

## 模块
- UI：component-work
- Domain：core-work（可选导出服务，本页可先调占位）
- 父容器/调用方：经 PageRoute 打开（全局/跨模块入口）

## 影响文件清单（冻结）
- 新建：
  - component/component-work/src/main/java/com/sinognss/component/work/export/WorkDataExportFragment.kt
  - component/component-work/src/main/java/com/sinognss/component/work/export/WorkDataExportViewModel.kt
  - component/component-work/src/main/res/layout/fragment_work_data_export.xml
- 修改：
  - core/page-route/src/main/java/com/sino/page/route/PageRoute.kt（追加 Path 常量）
  - component/component-work/.../route/WorkPageLoader.kt（注册 Fragment；**SafeNet/IDE-only 可能**）
  - common/common-res/src/main/res/values/string-work.xml
  - common/common-res/src/main/res/values/strings-menu.xml（菜单入口文案，若要菜单）
- 禁止改动：Shell 盲改密文；业务模块新建通用 style/控件；无关 Loader

## 复用
- 基类：BaseViewBindingFragment
- SharedControl：CommonStatueBar；列表可用 CommonRv / BaseVBAdapter；筛选若需要 ViewCommonFilterBar
- SharedStyle：page_container、card_view_container、text_title、text_content、text_button、image_button_default
- 对照范例：WorkMarkersFragment.kt（结构）+ PageRoute/WorkPageLoader（接线）

## Route/菜单
- Path：PageRoute.WORK_DATA_EXPORT（假想名）
- Loader：WorkPageLoader.kt
- 菜单 string：是（strings-menu.xml）
- SafeNet/IDE-only：未知 → 实现前 IDE 确认；不可读则未决「需用户 IDE 追加」

## 验收标准
- [ ] Fragment+VM+layout；基类正确；ViewBinding
- [ ] layout 仅 SharedStyle + SharedControl（CommonStatueBar 等）
- [ ] 文案 string-work + 菜单 strings-menu
- [ ] Path + WorkPageLoader 接线；SafeNet 已 IDE 改或未决已声明
- [ ] 无平行控件/样式
- [ ] 清单冻结未越界

## 约束
- dry-run；SafeNet 不假设 shell 可读
