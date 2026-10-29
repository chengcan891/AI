# 第1轮实现（假想）：SettingLogin
issues：无
说明：未写入 ag6.0；下列为假想改动与强制复用。

## 实际改动文件（假想）
### 新建
1. `component/component-setting/src/main/java/com/sinognss/component/setting/system/login/SettingLoginFragment.kt`
   - 继承：`BaseViewBindingFragment` ← `common/base-component/.../fragment/BaseViewBindingFragment.kt`
2. `.../SettingLoginViewModel.kt` — 无 UI 控件
3. `component/component-setting/src/main/res/layout/fragment_setting_login.xml`
   - 根布局 style：`@style/page_container` ← `common/common-res/.../styles.xml`
   - 顶部控件：`<com.sinognss.ag.common.view.CommonStatueBar>` ← `common-view/.../CommonStatueBar.kt`（标题文案 `@string/...`）
   - 账号标签 TextView：`@style/text_1_label`（或 text_1）
   - 账号输入 EditText：`@style/edit_text`
   - 密码标签：`@style/text_1_label`
   - 密码输入：`@style/edit_text`
   - 登录按钮：优先 `CommonIconButton` ← common-view；若用 Button 则 `@style/text_button` + 尺寸 dimens；图标按钮用 `@style/image_button_default`
   - 禁止：业务模块自定义 `<style name=...>`；禁止自写 StatusBar/Toolbar 替代 CommonStatueBar

### 修改
4. 父容器/设置入口 `.kt`：replace/add SettingLoginFragment（同模块嵌套 API，对齐 Language 入口模式）
5. `common/common-res/src/main/res/values/string-setting.xml`：新增 login 相关 string

### 未改（禁碰）
- PageRoute / *PageLoader / RouteModuleConfig / strings-menu.xml

## 复用核对表（验收用）
| UI 元素 | 必须使用 | 约定来源 |
|---|---|---|
| Fragment 基类 | BaseViewBindingFragment | conventions 基类 |
| 页容器 | @style/page_container | SharedStyle styles.xml |
| 顶栏 | CommonStatueBar | SharedControl |
| 正文/标签 | text_1 / text_1_label / text_title | SharedStyle |
| 输入 | @style/edit_text | SharedStyle |
| 主按钮 | CommonIconButton 或 text_button | SharedControl / SharedStyle |
| 文案 | string-setting.xml | common-res |

## SafeNet/未决
- 无
## 构建
- 未执行（dry-run）
