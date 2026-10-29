# 功能说明：SettingLogin（假想）
类型：ui-nested    速查：A
一句话目标：在系统设置内嵌套增加「登录」子页（账号/密码输入 + 顶部状态栏），不挂全局路由。
约定阅读切片：按类型速查·A；域映射 setting；基类；SharedStyle；SharedControl；范例·1

## 模块
- UI：component-setting
- Domain：无（本干跑只 UI；登录逻辑可后续）
- 父容器/调用方：component-setting 系统设置容器内入口（对照 SettingLanguage 同级导航；假想父：system 设置列表项打开本 Fragment）

## 影响文件清单（冻结）
- 新建：
  - component/component-setting/src/main/java/com/sinognss/component/setting/system/login/SettingLoginFragment.kt
  - component/component-setting/src/main/java/com/sinognss/component/setting/system/login/SettingLoginViewModel.kt
  - component/component-setting/src/main/res/layout/fragment_setting_login.xml
- 修改：
  - component/component-setting/.../system/<父容器或设置项列表>.kt（增加打开 SettingLogin 的嵌套导航）
  - common/common-res/src/main/res/values/string-setting.xml（登录相关文案）
- 禁止改动：PageRoute.kt；*PageLoader.kt；RouteModuleConfig.kt；strings-menu.xml

## 复用
- 基类：BaseViewBindingFragment（common/base-component/.../fragment/BaseViewBindingFragment.kt）
- SharedControl：CommonStatueBar（common-view/.../CommonStatueBar.kt）；输入框用系统 EditText + SharedStyle `edit_text`（禁止自造输入样式）
- SharedStyle：page_container、text_title、text_1_label、text_1_content、edit_text、text_button、image_button_default（styles.xml）；尺寸/色走 dimens/colors；主题属性优先 theme-attrs
- 对照范例（仅一条）：component/.../language/SettingLanguageFragment.kt

## Route/菜单
- （本节删除 — A 不需要）

## 验收标准
- [ ] Fragment 继承 BaseViewBindingFragment；layout 使用 ViewBinding
- [ ] 顶部使用 CommonStatueBar；无平行自造状态栏
- [ ] 文本/容器/按钮/输入仅引用 common-res SharedStyle（page_container、text_*、edit_text、text_button 等）；无业务模块内新建通用 style
- [ ] 文案在 string-setting.xml
- [ ] 经父容器嵌套打开；未新增全局 Route/Loader/菜单
- [ ] 影响文件清单已冻结且实现未越界

## 约束
- 编译：默认不强制；纯 dry-run 不改 ag6.0
