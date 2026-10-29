# 功能说明：ConfirmClearWorkDialog（假想）
类型：ui-dialog    速查：C
一句话目标：作业页「清除」前弹出确认框；优先 CommonDialogUtils，不挂全局 Route。
约定阅读切片：按类型速查·C；SharedControl Dialog；范例·4；基类 Dialog

## 模块
- UI：调用方在 component-work（现有页）；对话框优先 common-view 工具，无需新模块页
- Domain：无
- 父容器/调用方：假想 WorkMarkersFragment（或作业主页）点击清除时调用

## 影响文件清单（冻结）
- 新建：无（工具可覆盖）
- 修改：
  - component/component-work/.../marker/create/WorkMarkersFragment.kt（或实际清除入口）：调用 CommonDialogUtils 确认
  - common/common-res/.../string-work.xml：确认标题/正文/按钮文案（若尚无）
- 禁止改动：PageRoute；*PageLoader；新建业务 Dialog 类（本案 Utils 足够）；业务内平行 style

## 复用
- Dialog：CommonDialogUtils.kt + 现成 CommonNoticeDialog（common-view/.../dialog/）
- 基类：不新建；若他日自定义才用 BaseVBCardDialogFragment
- SharedStyle：对话框内部由公共实现承载；调用方不写 layout style
- 对照范例：CommonDialogUtils.kt

## 验收标准
- [ ] 使用 CommonDialogUtils（或 Notice），未新建 Dialog Fragment
- [ ] 调用方正确；文案在共享 strings
- [ ] 未新增全局 Route
- [ ] 清单冻结；无平行控件

## 约束
- dry-run；能工具则不建类
