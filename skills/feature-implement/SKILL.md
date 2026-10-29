---
name: feature-implement
description: 加功能的实现方。按已定稿功能说明与 project-conventions-* 实现（有界面页、对话框、无界面业务、路由/菜单接线），只改说明范围内的代码并写改动报告，不自行判定是否通过。由 feature-add-loop 调度者指派，或用户给出已确认的功能说明要求实现时使用。
disable-model-invocation: true
---

# 加功能：实现方

## 角色边界

- 只改代码 + 写 `round-<N>-implement.md`；**禁止自行验收/宣布通过**。
- **唯一范围**：spec「影响文件清单」+「本期范围」+ 本轮 `issues.md` 未关闭项。要扩范围 → 写入「未决项」并停止扩改。
- 类名/路径只来自 spec + 约定。
- spec 仍是「草稿·待澄清」或未获用户确认 → **停止**，不改码。

## 阅读切片（省 token）

**第 1 轮**

1. `feature-spec.md`（全文，短）— 确认主类型、本期范围、UI 绑定表、禁止改动
2. 约定：仅打开 spec「约定阅读切片」列出的章节 + 对照范例**那一个文件**
3. **A/C/D：禁止打开约定「路由」章**；B/E：可读路由+SafeNet，编辑走 IDE-only
4. 仓库规范 skill：仅当约定「必须遵守」且本轮新建模块入口时读；否则跳过
5. 有 issues 则读未关闭项

**第 2 轮及以后**

1. `issues.md` 未关闭项 + 上轮 review 的不通过行
2. spec 的「影响文件清单」「本期范围」「验收标准」「UI 绑定表」（勿重读决策树/散文）
3. **禁止**通读约定；需要基类名时从 spec「复用」节抄

不要加载 discuss/review/loop 技能全文。

## 按类型：必做 / 禁止

| 类型 | 必做 | 禁止 |
|---|---|---|
| A ui-nested | Fragment+VM(+Adapter)+layout；挂到**叶页的父容器**；UI 绑定表；strings 用**域内** `string-*.xml` | PageRoute/Loader/菜单；业务新建通用 style；硬编码字号色 |
| B ui-page+route-wire | 同上 + Path + 对应域 Loader（**IDE 对照追加**）；菜单仅当入口在菜单；列表优先 `BaseVBAdapter`/`CommonRv*` | Shell 盲改 SafeNet；错域 Loader；平行控件 |
| C ui-dialog | **先** `CommonDialogUtils`；否则 Dialog 基类+layout（`card_view_container`/`edit_text`/`text_*`） | 新类却 Utils 已覆盖；全局 Route |
| D service | core Manager；**调用方必改** | 任何 UI/Route/layout/样式 |
| E route-wire | Path + Loader（+可选 menu）；与页面同单或页面已存在；IDE-only | 只改 Loader 不改 Path（或相反）；Shell 改密文 |

### SafeNet / IDE-only（B/E）

含 **`PageRoute.kt`** 与全部 `*PageLoader` / 可能加密的 `RouteModuleConfig`。

1. 编辑前用 IDE/AGENTS 允许的方式确认文件可读。
2. 不可读 → **停止改该文件**，未决项写明路径与「需用户 IDE 追加」；其余可读文件可继续。
3. 可读 → 对照现有条目追加，勿整文件重写。
4. **禁止**用 Shell/脚本猜测或重写密文内容。

## 分期与复合

- 只改 `feature-spec`「本期范围」与冻结影响清单内文件；下期/模拟桩按 spec 落空实现或 TODO 接口，勿擅自做真协议/真算法。
- 复合单：UI 与 Domain 都在本期时仍遵守类型门禁（A/C/D 不改 Route；D 调用方必须存在）。
- 有 UI：交付前报告必须含完整 **UI 绑定表**（控件 → 实际 View/@style → 约定出处）；缺表视为未完成。

## 执行步骤

1. 确认 spec 已定稿（非草稿）；否则停。
2. 有未关闭 issues → **只修这些问题**；否则按清单 + 本期范围全量。
3. 打开对照范例文件（一条）对齐写法后改清单内文件；layout 只使用约定 SharedStyle/View。
4. B/E 遇 SafeNet：IDE-only；不可读则记未决，勿盲改。
5. 默认不编译；若编译，记入报告。
6. 写实现报告；「实际改动文件」须可被验收方当核对表（与清单对齐，差异写入「与草案差异」）。

## 改动报告模板（≤60 行）

```text
# 第 N 轮实现：<短名>
issues：<编号|无>
本期范围：<一句>
## 实际改动文件
- 新建：…
- 修改：…
- 未改（清单内但本轮跳过）：… + 原因
## 与清单差异
- …
## 复用核对
- 基类/Style/Control：…（一行）
## UI 绑定表（A/B/C 有 layout 时必填；D 写「无」）
| 控件/区域 | 使用的 View 或 @style | 约定出处 |
|---|---|---|
| … | CommonStatueBar / @style/page_container / … | SharedControl 或 styles.xml |
## SafeNet/未决
- …
## 构建
- 未执行 | <命令→结果>
```

## 禁止

- 禁止改验收标准「让自己好过」。
- 禁止平行复制共享控件/样式；禁止 layout 写死颜色/字号绕开 SharedStyle（除非约定 attrs）。
- 禁止为 D/A/C 顺手加 Route；禁止打开或修改 PageRoute/*PageLoader（除非类型为 B/E 且走 IDE）。
- 有 layout 的报告若缺「UI 绑定表」视为未完成，须补表后再交验收。
- 禁止超出「本期范围」实现下期真协议/真算法/真地图。
