---
name: feature-discuss
description: 加功能的讨论方。只澄清需求并产出「功能说明」短文档，不改业务代码。由 feature-add-loop 调度者指派，或用户明确要求「先讨论定稿、先不要改代码」时使用。换项目时配合 project-conventions-*。
disable-model-invocation: true
---

# 加功能：讨论方

## 角色边界

- **禁止**改业务源码 / 资源 / 路由。
- 可 Read 约定与仓库范例；定稿后由调度者等用户确认再实现。
- 产出 ≤80 行清单体 `feature-spec.md`；禁止长文散文。

## 阅读切片（省 token）

按顺序打开，**到齐即停**，勿通读约定全文：

1. 约定「按类型速查」→ 选定**主类型**字母 A/B/C/D（复合则另记附属）
2. 约定「域→模块映射」→ 填 UI/Domain 模块
3. 约定对应「五类范例」**仅一条**路径作对照
4. **仅当主类型为 B（或单独 E）** 时再读约定「路由」+ SafeNet 段；**A/C/D 禁止打开路由章**
5. `AGENTS.md`：仅当需要确认编译/加密编辑方式时扫相关段（宿主已加载可跳过全文）

**不要**预读 implement/review 技能；**不要**打开无关范例。

## 决策树

```
有无界面？
├─ 无 → D service（通常无 Route、无 layout）
└─ 有 → 对话框？
         ├─ 是 → C ui-dialog（先问：现有 Dialog 工具能否覆盖？）
         └─ 否 → 需要全局/跨模块入口？
                  ├─ 否 → A ui-nested（同模块容器内打开）
                  └─ 是 → B ui-page + route-wire
```

标签：`ui-nested` | `ui-page` | `ui-dialog` | `service` | `route-wire`（B 常 = page+route-wire；纯 E 少见，优先并入 B）。

### 易混分类（批量真实功能高频）
- 路径含 `/impl/` 或落在 `*Container*` 下 → 默认 **A**，不要挂 Route。
- 已被某 `*PageLoader` 引用或需跨模块打开 → **B**。
- `*Dialog*` / 确认框 → **C**（先 Utils）。
- `core/*/…*Manager*` → **D**（必须写调用方）。
- 文案文件按域：`string-setting.xml` / `string-work.xml` / …，菜单才用 `strings-menu.xml`。

## 类型必问（缺一不可）

| 类型 | 额外必问 |
|---|---|
| A 嵌套页 | 父容器/入口 Fragment？谁 replace/add？**是否 Container 本身**（Container=壳，叶页面另计）？ |
| B 可路由页 | Path 名？哪个 `*PageLoader`？要否 `strings-menu.xml`？SafeNet？**先搜 Loader 是否已引用同名 Fragment** |
| C 对话框 | Utils/Notice 能否覆盖？输入框？调用方？**禁止**为 Dialog 加 PageRoute |
| D 无界面 | 哪个 `core-*`？**调用方类路径**（无调用方则停）？禁 UI/Route |
| E 接线 | 与 B 成对：Path + Loader +（可选）菜单；单独 E 必须写明配对页面已存在或同单交付 |

## 复合功能与分期（省 token / 防跑偏）

当需求同时含「界面 + 协议/HUB + 算法 + 地图」等多层时：

1. **主类型**：按决策树只选一个主字母（通常 A 嵌套页或 B 可路由页）；附属写 `附属：D（Manager/协议模拟）` 等，勿假装单一纯类型。
2. **建议分期**：在 spec 写「本期 / 下期」。默认本期 = 宿主 UI + 参数绑定 + 模拟调用桩；协议真机、曲线算法库、AGMap 绘制可标下期，除非用户明确要求一次交付。
3. **首轮探索范围**：只定位宿主 Fragment/layout + 对照一条范例；**禁止**同轮深挖 HubCmd / 算法中心 / 地图绘制实现细节。这些写入「待澄清」即可。

## 外部设计文档（md / 图片 / pdf）

1. **先读 `.md` 全文**（通常很短），把场景、参数、入口摘要进 spec。
2. **图片**：最多读 **2～3 张**代表性图（入口/主界面/关键示意）；其余按 md 文字理解，勿逐张扫完。
3. **禁止**整本读入 `.pdf`（体积大、无增量信息时跳过）；需要时只记「存在 pdf，与 md 同内容」。
4. 视频/外链：只记 URL，不拉取。
5. 编排方若已在 loop-state 写了诉求摘要，讨论方**不要**再整套重读全部图片。

## 先交流 / 澄清优先

用户说「有问题先交流」「清楚后再做」时：

1. 先列出 ≤8 条澄清问题（分期边界、模拟 vs 真协议、宿主是否已确认等）。
2. 可写 **草稿** `feature-spec.md`（标题注明「草稿·待澄清」），含开放问题清单。
3. **立即结束本轮**，把问题交回编排方/用户；**禁止**在未回复前继续 Grep 协议/算法/地图。

无「先交流」口令、但信息仍不够填类型必问表时：同样落盘草稿 + 澄清问题并停，勿为填表深挖全栈。

## 探索预算（硬限制）

- 找文件用 **Glob**，禁止 `Grep` 空 `pattern`（空 pattern 浪费且易重复）。
- 宿主 Fragment + 对应 layout 定位后：累计工具调用建议 **≤12** 即落盘草稿/定稿；超时强制写入开放问题并停。
- 同文件不要重复 Read；布局控件用一次定向 Grep/`android:id` 即可填 UI 绑定表。
- 有 UI：spec 必须含 **UI 绑定表**（控件 → ViewBinding/字段 → 参数含义）；缺表视为未完成。

## 执行步骤

1. 按阅读切片取约定 → 定**主类型**；若复合则写附属类型 + 建议分期（见上节）。**A/C/D 勿开路由章。**
2. 外部文档：先 md，图片 ≤3 张；用户要求先交流则先列澄清问题（见上节）。
3. 问清类型必问表 + 一句话目标 + 数据依赖。信息不够先提问并落盘草稿，**不要臆造模块**，**不要**为填表深挖全栈。
4. 写 `feature-spec.md`（模板下）；「影响文件清单」具体到相对路径草案；有 UI 必填 **UI 绑定表**；实现与验收共用此表，定稿后冻结。A/C/D 的「禁止改动」必须写明 `PageRoute/*PageLoader`；**删除 Route/菜单节**（勿留空章）。
5. 回复：路径 + ≤8 条待确认要点 +「请确认后再实现」（有开放问题则明确「请先答复澄清」）。

## feature-spec.md 模板（删掉与类型无关的节）

```text
# 功能说明：<短名>
类型：<标签>    速查：<A|B|C|D>（复合则写附属）
一句话目标：<…>
约定阅读切片：<复制你实际打开的章节名，供 loop-state；A/C/D 不含路由章>
状态：定稿候选 | 草稿·待澄清

## 模块
- UI：<或「无」>
- Domain：<或「无」>
- 父容器/调用方：<A/C/D 必填>

## 影响文件清单（冻结；实现+验收共用）
- 新建：…
- 修改：…
- 禁止改动：<A/C/D 必写「PageRoute/*PageLoader/strings-menu（非菜单入口）」>

## 复用（有 UI 的 A/B/C 必填具体名，禁止只写「按约定」）
- 基类：…
- SharedControl / Dialog（类名）：如 CommonStatueBar / CommonDialogUtils / …
- SharedStyle（style 名列表）：如 page_container, text_title, edit_text, …
- 文案文件：string-*.xml / strings-menu.xml
- 对照范例（仅一条）：<约定中的相对路径>

## Route/菜单（仅 B 或说明要求时保留；A/C/D 整节删除）
- Path：…
- Loader：…
- 菜单 string：是/否
- SafeNet/IDE-only：是（PageRoute 与 *PageLoader 一律 IDE 对照追加；禁止 shell 盲改）

## UI 绑定表（有界面的 A/B/C 必填；缺则未完成）
| 控件/区域 | layout id 或新建 | 绑定字段/参数 | SharedStyle/View |
|---|---|---|---|
| … | … | … | … |

## 复合/分期（若适用）
- 主类型：…    附属：…
- 本期范围：…
- 下期/模拟桩：…
- 待澄清：…

## 验收标准（可勾选，≤8 条）
- [ ] …
- [ ] 无平行自造通用控件/样式；layout 控件均可追溯到约定 SharedStyle/View
- [ ] （有 UI）文案在共享 strings；（A/B）顶栏优先 CommonStatueBar
- [ ] （A/C/D）未新增全局 Route；spec 无 Route 章
- [ ] （B）Path + Loader 已接线；（SafeNet）IDE 已改或未决已声明
- [ ] （D）已有调用方引用 Manager
- [ ] （C）优先工具则无新类，或新类继承约定 Dialog 基类
- [ ] （复合）本期范围已交付；下期未做不计失败

## 约束
- 编译：默认不强制（AGENTS）
- 其他：…
```

## 禁止

- 禁止 Grep 空 pattern（找文件用 Glob）。
- 禁止为填协议/算法细节而超过探索预算。
- 禁止批量 Read 设计 jpg/pdf；禁止整本 pdf。
- 禁止 A/C/D 打开或填写 Route/菜单章。
- 不改业务文件；不把项目模块名写进本 SKILL（只写进本次 spec，且来自约定）。

> ag6.0：`PageRoute` 与全部 `*PageLoader` 均为 SafeNet 锁定。B/E 讨论只写 Path **名草案**，勿要求贴明文；实现方 IDE 追加。
