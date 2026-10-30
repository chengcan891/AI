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


## 长度单位 / Tab / 参数徽章（UI 还原常用）

> 供通用 feature-* 技能引用：设计还原的**具体类名与路径只写在本节**，不要回填到 feature-discuss / implement / review / add-loop。

### 长度单位（禁止硬编码 `m`）

- 模块：`:common:common-unit`（路径 `common/common-unit/`）
- 长度类型：`com.sinognss.ag.common.unit.length.LengthUnit` / `LengthValue`
- 资源文案：`common/common-unit/src/main/res/values/string-unit.xml`（及各 `values-*`）
- 展示文案：`UnitResourceGetter.getUnitString(context, unit: Int)`
- **换算（推荐，与现网一致）**：`AppContext.appUnitService.getAppUnit(UnitType.LENGTH)` + `unitConvert`（参考 `DeviceVehicleHomeFragment`）；存储/校验仍用米时，显示与输入双向换算
- **备选**：`AppUnit.SYSTEM_LENGTH_UNIT` + `LengthUnit.convertTo`（检查表若写死一种，实现不得擅自换另一种）
- **单位控件形态（优先）**：`edit_text`（或等价）右对齐数值 + **右侧独立** `TextView` 显示单位。`NumberUnitEditText` 在 `gravity=end` 时易与数字重叠，仅当检查表点名且无重叠风险时用
- **禁止**在业务 layout / 可翻译字符串写死 `"m"` / `"米"` 作为系统长度单位

### Tab 居中 / 均分

- 控件：`common/common-view/.../layout/CommonTabLayout.kt`
- item：`common/common-view/src/main/res/layout/view_common_tab_item.xml`
- 设计要求通栏均分/居中时：`layout_width=match_parent` + `distributeEvenly=true`；不要用左对齐 Tab 行凑合
- 选中样式示例（资源色，禁硬编码 #）：选中底 `new_main_color_10`、未选透明；选中字 `new_main_color`、未选 `gray_3`（`setTabBackgroundColors` / `setTabTextColors`）

### 参数序号徽章

- 设计中的 1/2/3 等为**独立** badge/icon View，与 label `TextView` 分离
- 圆底：业务或 common-res 圆形 drawable + `backgroundTint`；颜色可放业务 `values/colors_*.xml`
- 「当前行」类标记优先独立 ImageView（如泪滴/图钉），不要塞进 label
- **禁止** `label = "1 宽度"` / 带 `(m)` 后缀的合并文案

### 示意图 / 插图资源

- 设计有独立示意图时：vector/png 应对齐构图——**铺满 viewport**（少留空边）、线组分区、标注序号与定位点在图内
- 稀疏半透明色块 + 双向箭头草稿 **只算占位**，不能当作 UI 还原完成
- 插图 vector 允许用字面色值表达设计稿；**UI 铬（标题条/Tab/按钮）仍走主题色 / SharedStyle**
- 宿主嵌套多 Tab 时：父 layout 可只留 `CommonTabLayout` + 各 Tab 的 `FrameLayout` 容器，内容进子 Fragment（参考作业线编辑：基本信息 / 分组线）

### 确认 / 取消按钮

- 走 SharedStyle / 同模块范例页按钮样式（见上文 SharedStyle / common-res），与项目确认取消视觉一致

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

## 手工终态模式（分组线 / 嵌套编辑 2026-10-29）
来自「导航线编辑 / 分组线」手工终态（2026-10-29）的可复用落法：

### 嵌套编辑宿主（Tab + 子页）
- 宿主 layout：`CommonTabLayout`（`distributeEvenly = true`，默认配色）+ 两个（或多个）`FrameLayout` 容器（`layout_weight=1`），切换时只改 `isVisible`。
- 宿主 Fragment：先挂「基本信息」子页；`lineType` 经 `WorkLineGroupManager.isLineTypeSupported` 判断后，不支持则 `tab.isVisible=false` 并强制基本信息；支持则懒 `replace` 分组线子页。
- 宿主 ViewModel 只查线型；各 Tab 数据与保存完全自理。
- 分组线子页自带取消/确定；取消 `finish` 宿主；确定只 `save` 分组线并 Toast，不关页。

### 长度单位（分组线宽度）
- 存库/校验：米（`WorkLineGroupParam.groupGap`）。
- 展示：`AppContext.appUnitService.getAppUnit(UnitType.LENGTH)` + `unitConvert`；`tv_group_gap_unit` 独立 TextView，禁止把单位写进 label string。
- 回填：`renderedGapText` + `renderedGapMeters`；`readGapMeters()` 文本未改则直接返回米值。
- 格式：`DecimalFormat("0.##", Locale.US)`，与 `toDoubleOrNull` 小数点一致。

### 参数徽章与示意图
- 徽章与 label 分离：`tv_*_badge` / `iv_current_row_badge` 用 `work_group_line_badge_*`；示意图 `drawable_work_line_group_diagram` 边缘到边缘，色块/字母与 A/B/C/D 徽章一致。
- 禁止空 `ImageView` 或纯色占位当示意图 PASS。

### 校验与联动
- `WorkLineGroupManager.validate`：按界面顺序首个越界 → `GroupLineResult.Invalid(field,min,max)`。
- `coerceCurrentRow(first,row)`：第一组条数改小时压当前行；`isRenderingParam` 抑制回填抖动。
- 关闭「应用」仍按全字段校验（现状）；若产品要关闭时跳过校验，需改 spec。

### 存库 / 内存 / 下发
- `save`：DAO `updateGroupLineParam` 后 `syncCurrentWorkLine`（防微移等整行写回冲掉分组字段）。
- 当前作业线且 `isPilotServiceInitialized`：`dispatch`（曲线先 `setGroupLineParam` 再 HUB `setGroupLine`）+ `setGroupLineToMap`；非当前只存库。
- **统一钩子** `WorkPilotLifecycleManager.onNavLineSent`：`initPilotSession` 成功后、以及 `WorkService.clearMicroShift` 成功重发导航线后必须调用；分组失败只打日志。
- 注意：`LineAlgorithmExecutor.setGroupLineParam` 仍为 TODO stub（现 `return true`）——曲线规划侧未真接入前，不可当作曲线分组已闭环。

## 手工增量（分组线 2026-10-30）
相对 2026-10-29 终态的增量（2026-10-30 手工）：

### 输入层范围（分组线）
- `KeyboardNumberDialog.Options`：整数字段设 `minValue`/`maxValue`；宽度设显示单位下的 min/max + `maxDecimalPlaces = 2`。
- 宽度边界：`gapDisplayLimit(meters, CEILING|FLOOR)`——米→显示单位后再 `BigDecimal.setScale(2, …)`，保证键盘放行值换回米仍 ∈ [0,100]。
- `bindCurrentRowKeyboard()`：上限 = 合法的第一组条数，否则放宽到 `FIRST_GROUP_COUNT_MAX`；第一组条数变更时重绑。
- UI 去掉范围 Toast / `SaveResult.Invalid`；确定按钮置灰 + Manager `validate` 兜底。

### 下发语义
- `dispatch(workLine, skipWhenDisabled)`；主发钩子用 `skipWhenDisabled=true`，保存当前线用 `false`（关闭也要显式下发）。
- 新增 `GroupLineResult.Disabled`（跳过，非失败）。
- `onNavLineSent`: `Boolean`；`Unsupported`/`Disabled`/`Success` → true；`Invalid`/`Failure` → false。
- `initPilotSession`：分组下发失败则**不**挂上 `pilotService`（先二次下发成功再保存会话）。
- **注意**：`WorkService.clearMicroShift` 已不再调用 `onNavLineSent`（相对 10-29 钩子回退）。若清微移会重发导航线，需确认 HUB/其它路径是否足以恢复分组，否则为遗漏钩子 risk。

### 徽章 / 示意图
- 序号徽章文案为数字 `1`/`2`/`3`（`string-work` 中 `work_group_line_badge_*` `translatable="false"`；layout 亦可写死数字，优先 `@string` 以免漂移）。
- 当前位置徽章与示意图均对齐 `drawable_icon_map_tractor_loction`（示意图内 `group` 缩放嵌入 path）。

