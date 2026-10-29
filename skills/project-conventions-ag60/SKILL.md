---
name: project-conventions-ag60
description: 在 ag6.0（Android Kotlin 多模块 MVVM）上执行 feature-add-loop（或 discuss/implement/review）前加载；只提供路径、基类、共享 Style/控件、路由注册与范例，不含通用流程。换项目时复制本技能并替换路径表。
---

# project-conventions-ag60

ag6.0 项目约定清单（路径与范例）。**实现流程见** [feature-add-loop](../feature-add-loop/SKILL.md)（调度；同级还有 feature-discuss / feature-implement / feature-review）。换项目时复制本文件为 `project-conventions-<slug>` 并替换下表。

## 项目根与栈

| 项 | 值 |
|---|---|
| 绝对根 | `D:\WorkSpace\git\ag6.0` |
| 相对路径 | 下文均相对仓库根 |
| 栈 | Android Kotlin，Gradle 多模块，MVVM，ViewBinding，Fragment |

## 分层与模块

| 层 | 目录 / 模块 | 职责 |
|---|---|---|
| App | `app/` | 应用入口、组装 |
| UI | `component/component-common`, `component-device`, `component-home`, `component-isobus`, `component-setting`, `component-work` | 界面（Fragment / VM / layout） |
| Domain | `core/core-app`, `core-work`, `core-map`, `core-device`, `core-gnss`, … | Manager / 业务，无界面 |
| Route | `core/page-route` | `PageRoute`、Loader 接口、模块路由配置 |
| Shared | `common/base-component`, `common-res`, `common-view`, … | 基类、Style/字符串、共享控件与 Dialog |

## 基类（必用）

相对路径均在 `common/base-component/src/main/java/com/sino/common/base/component/`：

| 用途 | 文件 |
|---|---|
| Activity | `BaseViewBindingActivity.kt` |
| Fragment 页 | `fragment/BaseViewBindingFragment.kt` |
| 卡片对话框 | `BaseVBCardDialogFragment.kt` |
| 带输入卡片对话框 | `BaseVBCardInputDialogFragment.kt` |

新页面继承 `BaseViewBindingFragment`（或约定的 Activity 基类）；自定义对话框优先上述 Dialog 基类。

## SharedStyle / 资源（common-res）

目录：`common/common-res/src/main/res/values/`

| 文件 | 用途 |
|---|---|
| `styles.xml` | 文本与容器样式 |
| `theme-styles.xml` / `theme-attrs.xml` | 主题与属性 |
| `dimens.xml` / `colors.xml` | 尺寸与颜色 |
| `string-*.xml` / `strings*.xml` | 按域拆分的文案（如 `string-setting.xml`, `string-work.xml`, `strings-menu.xml`） |

常用 style 名（`styles.xml`）：`text_1`…`text_5`（及 `_label` / `_content` / `_paragraph` 变体）、`text_title` / `text_subtitle` / `text_button` / `text_content`、`page_container`、`card_view_container`、`edit_text`（及 degree/dms 变体）、`image_button_default` / `image_button_small` / `image_button_large` / `image_button_large_x`。

布局与控件**必须**引用上述 style（及 theme-attrs）；禁止在业务模块平行复制通用样式，禁止用硬编码字号/色替代 SharedStyle（除非走约定 attr）。实现报告须有「UI 绑定表」。

## SharedControl / Dialog（common-view）

包根：`common/common-view/src/main/java/com/sinognss/ag/common/view/`

| 类型 | 代表 |
|---|---|
| 状态/按钮 | `CommonStatueBar`, `CommonIconButton`, `CommonLoadingIconButton` |
| 筛选/下拉 | `ViewCommonFilterBar`, `ViewCommonDropSelectView` |
| Tab / 列表 | `layout/CommonTabLayout`, `rv/CommonRvItemRightCheckAdapter`, `rv/BaseVBAdapter` |
| Dialog 工具 | `dialog/CommonDialogUtils.kt` |
| 现成对话框 | `dialog/impl/CommonNoticeDialog`, `CommonLocalNoticeDialog`, `CommonDataLoadingDialog`, `CommonProgressLoadingDialog` |

新 UI 优先组合上述控件；确认/提示/加载优先 `CommonDialogUtils`。

## 路由

| 角色 | 路径 |
|---|---|
| Path 常量 | `core/page-route/src/main/java/com/sino/page/route/PageRoute.kt` |
| 模块配置 | `core/page-route/.../RouteModuleConfig.kt`（**SafeNet 加密可能**） |
| 接口 | `IPageLoader.kt`, `IHomePageLoader.kt`, `ICommonPageRouter.kt` |
| Loader | 各 UI 模块 `.../route/*PageLoader.kt`： |
| | `component-common/.../CommonPageLoader.kt` |
| | `component-device/.../DevicePageLoader.kt` |
| | `component-home/.../HomePageLoader.kt` |
| | `component-isobus/.../IsobusPageLoader.kt` |
| | `component-setting/.../SettingPageLoader.kt` |
| | `component-work/.../WorkPageLoader.kt` |

**SafeNet / IDE-only（硬规则）**：`PageRoute.kt` 与**全部** `*PageLoader.kt` 均为 SafeNet 锁定；`RouteModuleConfig` 也可能加密。

- 用 **IDE** 打开、对照现有 Path/注册条目追加；遵循仓库 `AGENTS.md`。
- **禁止** Shell/脚本读改明文或整文件重写。
- 讨论/实现：B/E 只写 Path 名草案 +「IDE 追加」；不可读则记未决，勿盲改。
- **阅读切片**：仅 B/E 打开本章；**A/C/D 禁止打开路由章**，spec 删除 Route/菜单节。

## 域 → 模块映射（示例）

| 业务域 | UI 模块 | Domain 模块 |
|---|---|---|
| setting / 系统设置 | `component-setting` | `core-app`（如语言） |
| work / 作业、地块标记 | `component-work` | `core-work` |
| device | `component-device` | `core-device` |
| home | `component-home` | （按功能再定 core） |
| isobus | `component-isobus` | （按功能再定） |
| 跨域公共页 | `component-common` | — |
| 仅服务无界面 | — | 对应 `core-*` |

不确定时打开对应 `component-*` / `core-*` 现有包结构，对齐邻近功能，不要新建平行顶层模块。

## 按类型速查（影响面）

讨论方先选字母，写入 spec「速查」；实现/验收按「必碰 / 禁碰」执行。

| 字母 | 类型 | 必碰（典型） | 禁碰（除非 spec 明示） | 对照范例节 |
|---|---|---|---|---|
| A | ui-nested 嵌套页 | Fragment+VM+layout+strings；父容器导航；**顶栏 CommonStatueBar**；layout 只用 SharedStyle（page_container/text_*/edit_text/…） | `PageRoute`、`*PageLoader`、菜单；业务内新建通用 style；**勿读路由章** | §五类范例·1 |
| B | ui-page + route-wire | 同上 + Path + `*PageLoader`（IDE）；可选 `strings-menu.xml`；同样强制 SharedStyle/View | Shell 盲改 SafeNet；平行控件/样式 | §五类范例·2 + ·5 |
| C | ui-dialog | 优先 `CommonDialogUtils`；自定义则 Dialog 基类 + `card_view_container`/`edit_text`/`text_*` | 全局 Route；无必要新类；业务平行 style；**勿读路由章** | §五类范例·4 |
| D | service 无界面 | `core-*` Manager；**现有**调用方引用 | 任何新 UI / Route / layout / 样式；**勿读路由章** | §五类范例·3 |

### 阅读切片（给子代理）

- 讨论：本表 → 域映射 → **一条**范例 →（**仅 B/E**）路由+SafeNet；A/C/D 停在范例
- 实现第 1 轮：spec 切片 + 一条范例文件 +（**仅 B/E**）路由段
- 实现第 2 轮+ / 验收：以 spec 清单与 issues 为准，不回读本表全文

## 五类范例（对照用）

### 1. 有界面设置页（语言）— 速查 A 主范例

- `component/component-setting/src/main/java/com/sinognss/component/setting/system/language/SettingLanguageFragment.kt`
- `.../SettingLanguageViewModel.kt`
- `.../SettingLanguageAdapter.kt`
- 布局：模块内 `fragment_setting_language` 等（ViewBinding）
- 模式：Fragment + VM + Adapter；基类 `BaseViewBindingFragment`；文案走 `common-res` setting/language 字符串。

### 2. 复杂作业页（Marker）— 速查 B 的页内结构参考（接线另见 ·5）

- 容器：`component/component-work/.../marker/create/WorkMarkersFragment.kt` + `WorkMarkersViewModel.kt`
- 子页：`.../marker/create/impl/WorkPointMarkerFragment.kt`、`WorkLineMarkerFragment.kt`、`WorkAreaMarkerFragment.kt` 等
- 编辑/设置/仓库：`marker/edit/`、`marker/setting/`、`marker/store/`
- 模式：同模块嵌套 Tab/子 Fragment；共享 `CommonTabLayout` 等。

### 3. 无界面 DomainService — 速查 D

- `core/core-app/src/main/java/com/sinognss/ag/core/app/language/LanguageManager.kt`
- 模式：core 层 Manager，由 Setting 的 ViewModel 调用；不挂 Route。

### 4. 对话框 — 速查 C

- 优先：`common/common-view/.../dialog/CommonDialogUtils.kt` + `dialog/impl/CommonNoticeDialog` 等
- 自定义卡片：继承 `BaseVBCardDialogFragment` / `BaseVBCardInputDialogFragment`

### 5. Route 接线 — 速查 B 必读

- 常量：`PageRoute.kt` 追加 Path（**IDE-only**）
- 注册：对应域 `*PageLoader.kt`（及必要时 `RouteModuleConfig.kt`）（**IDE-only**）
- 菜单文案：`common-res/.../strings-menu.xml`（若入口在菜单）
- 加密文件用 IDE 对照现有条目修改；禁止 Shell 盲改

## 仓库规范（按轮次读，省 token）

| 谁 | 何时读 |
|---|---|
| 调度者前置 | `AGENTS.md` 中与编译/加密编辑相关的段落 |
| 讨论方 | 一般不读规范 skill；类型不清时再读 |
| 实现方第 1 轮 | 若新建非常规入口：`.coding-standards/skills/common-project-skill/SKILL.md` + `general-ruler.mdc`；否则可跳过 |
| 实现方第 2 轮+ / 验收方 | **默认不读**；只在 issues 点名规范条款时打开对应段 |

路径：`.coding-standards/skills/common-project-skill/SKILL.md`、`AGENTS.md`、`.coding-standards/rulers/general-ruler.mdc`（另见 `.cursor/rules/ruler.mdc`）。

## 换项目

复制本技能目录为 `project-conventions-<新项目>`，替换：根路径、模块表、基类、SharedStyle/Control、Route、域映射、范例路径。通用流程仍用 [feature-add-loop](../feature-add-loop/SKILL.md) 及同级讨论/实现/验收技能。

## 复合功能提示（供讨论方阅读切片）

- UI 嵌套页 + Manager/协议模拟：主类型 A（或 B），附属 D；约定阅读仍按主类型切片，Domain 章仅在本期含 Manager 时打开。
- 地图/算法库：无现成「类型字母」时写入附属说明与分期，勿为此通读全部约定。
- 默认本期 = 宿主 UI + 参数绑定 + 模拟桩；真协议/真算法/真地图标下期，除非用户要求一次交付。

## 分类启发式（全库扫描）

| 信号 | 倾向 |
|---|---|
| `/impl/` 或 `*Container*Fragment` 子树 | A |
| 模块内偏顶层、需跨模块打开 | B（附 E；PageRoute/Loader 一律 SafeNet IDE-only） |
| `*Dialog*` / 确认提示 | C（先 Utils） |
| `core/*/…*Manager.kt` | D（写调用方） |
| 只动 Path/Loader/菜单 | E（最好并入 B） |

文案：`string-<域>.xml`；菜单：`strings-menu.xml`。

**SafeNet 事实**：`PageRoute.kt` 与各 `*PageLoader.kt` 均为 SafeNet 锁定（勿 shell 读明文；用 IDE/AGENTS）。A/C/D 不要打开路由章。
