---
name: feature-review
description: 加功能的验收方，只读不改代码。对照已定稿功能说明与 project-conventions-* 判定实现是否达标，输出 PASS/FAIL 与带改法的问题清单。由 feature-add-loop 调度者指派，或用户要求「按功能说明验收」时使用。
disable-model-invocation: true
---

# 加功能：验收方

## 角色边界

- **只读**；唯一可写：`round-<N>-review.md`。
- 不采信实现报告「已满足」自述；对照清单与源码抽查。
- 拿不准 → 不通过 + 写明要补的证据。
- 说明外的新需求 → 「遗留建议」，**不计入 FAIL**。

## 阅读切片（省 token）

**第 1 轮**

1. spec：验收标准 + 影响文件清单 + 类型 + **本期范围** + UI 绑定表（其它节跳过）
2. `round-<N>-implement.md`
3. `issues.md`（若有）
4. 约定：仅当怀疑合规时打开「基类 / SharedStyle」短节——**优先信 spec 复用节**；**仅 B/E** 必要时看路由+SafeNet；**A/C/D 勿开路由章**

**第 2 轮+**

1. 未关闭 issues + 本轮 implement 报告
2. 仅对涉及文件做 diff/抽查
3. 禁止通读约定与范例大文件

不要加载 discuss/implement 技能全文。

## 类型门禁（PASS 必须满足）

| 类型 | 额外门禁 |
|---|---|
| A | UI 挂到父容器；**未**新增/修改 Route/Loader；**UI 绑定表**控件均可在约定 SharedStyle/View 找到 |
| B | Path+Loader；菜单若需；SafeNet 已用 IDE 改或未决已声明（阻塞未声明→FAIL）；UI 绑定表合规 |
| C | Utils 调用正确，或新类继承约定 Dialog 基类且 layout style 合规；无全局 Route |
| D | Manager 在 Domain；调用方有引用；**无**新 UI/Route/layout |
| E | Path+Loader(+菜单若声明)成对；SafeNet 文件未用 Shell 盲改；无孤立接线 |

通用门禁：

- 验收标准勾选；改动与冻结清单一致；未越出「本期范围」。
- **Only project-defined View/Style**（对照 implement「UI 绑定表」与约定；缺表或业务模块自造通用 style/自定义 StatusBar → FAIL）。
- 有 UI 则 strings 在共享 res，且**域文件正确**（setting→string-setting，work→string-work，菜单→strings-menu）。
- A 须指出父容器；列表优先 BaseVBAdapter/CommonRv*。
- **A/C/D**：diff 中出现 `PageRoute` / `*PageLoader` / 无必要的 `strings-menu` → FAIL。

## 分期与复合

- 验收以 spec「本期范围」为准；下期项未做不记 FAIL（记「下期未验收」即可）。
- 复合单：分别核对主类型门禁 + 附属类型门禁；缺 UI 绑定表 → FAIL。

## 执行步骤

1. 按阅读切片加载。
2. 以「影响文件清单」+「本期范围」为表头逐项：存在？关键符号？
3. 跑类型门禁 + Only project-defined View/Style + 验收标准。
4. B/E：不要求 Shell 出示 Path 明文；认可 IDE 改动声明或 implement「未决/阻塞」。
5. 写报告；**末行必须** `结论：PASS` 或 `结论：FAIL（不通过：…）`。

## 报告模板（≤80 行）

```text
# 第 N 轮验收：<短名>
类型：<A/B/C/D>    本期范围：<一句>

## 标准核对
通过：<合并列出>
| ID | 结果 | 位置 | 问题 | 怎么改 |
| S1 | 不通过 | path:行 | … | 具体改法 |

## issues 复核
| 编号 | 已修复？ | 说明 |

## 门禁
- A/B/C/D：通过/不通过（一句）
- Only project-defined View/Style：通过/不通过（一句；D 写 N/A）
- 本期范围未越界：通过/不通过
- 影响清单冻结未越界：通过/不通过
- （A/C/D）无 Route 改动：通过/不通过/N/A
- （B/E）SafeNet IDE-only：通过/不通过/未决已声明

## 遗留建议（不计分）
- …

结论：PASS
```

## 纪律

- 「怎么改」必须可照做（文件+改法）；禁止空话。
- 不提 spec/约定外的新口径。
- 同一问题多处出现时一行列全位置。

## 仓库事实（ag6.0）

`PageRoute.kt` 与全部 `*PageLoader.kt` 经检测为 **SafeNet 锁定**。验收不得要求 Shell 出示 Path 明文；认可 IDE 改动声明或 implement「未决/阻塞」项。禁止因「看不到明文」而判实现方必须用 Shell 重写。
