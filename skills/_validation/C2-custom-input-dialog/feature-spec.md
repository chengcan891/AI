# 功能说明：RenameMarkerDialog（假想·自定义对话框分支）
类型：ui-dialog    速查：C
一句话目标：重命名标记需带输入框；CommonDialogUtils 无现成输入确认则自定义 BaseVBCardInputDialogFragment。
约定阅读切片：速查 C；Dialog 基类；范例·4；SharedStyle

## 模块
- UI：component-work
- 调用方：WorkPointMarkerFragment（假想）

## 影响文件清单（冻结）
- 新建：
  - component/component-work/.../marker/dialog/RenameMarkerDialogFragment.kt
  - component/component-work/src/main/res/layout/dialog_rename_marker.xml
- 修改：
  - 调用方 Fragment：show 该对话框
  - string-work.xml
- 禁止：PageRoute/Loader；平行通用 style；不用工具却重复造 Notice

## 复用
- 基类：BaseVBCardInputDialogFragment（base-component）
- layout：card_view_container、text_title、edit_text、text_button（styles.xml）
- 对照：BaseVBCardInputDialogFragment.kt

## 验收标准
- [ ] 继承 BaseVBCardInputDialogFragment
- [ ] layout 仅 SharedStyle；输入 edit_text
- [ ] 无全局 Route
- [ ] 文案共享 strings
