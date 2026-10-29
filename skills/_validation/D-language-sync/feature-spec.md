# 功能说明：LocaleSyncManager（假想）
类型：service    速查：D
一句话目标：在 core-app 增加语言偏好同步 Manager，由现有 SettingLanguageViewModel 调用；无 UI/Route。
约定阅读切片：速查 D；域映射；范例·3

## 模块
- UI：无
- Domain：core-app
- 父容器/调用方：SettingLanguageViewModel.kt

## 影响文件清单（冻结）
- 新建：
  - core/core-app/src/main/java/com/sinognss/ag/core/app/language/LocaleSyncManager.kt
- 修改：
  - component/component-setting/.../language/SettingLanguageViewModel.kt（注入/调用 sync）
- 禁止改动：任何 layout；PageRoute；*PageLoader；common-res styles；新建 Fragment

## 复用
- 模式对照：LanguageManager.kt
- 无 SharedStyle/View（无界面）

## 验收标准
- [ ] Manager 在 core-app
- [ ] SettingLanguageViewModel 有引用
- [ ] 无新 UI/Route/layout/业务平行样式
- [ ] 清单冻结

## 约束
- dry-run
