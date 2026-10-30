# Time sink diagnosis: group-line (2026-10-29)

## Current feature / step

- Feature: **group-line**（分组线）
- Path: `D:\WorkSpace\git\ag6.0\.feature-add-loop\group-line\`
- Stage (loop-state ~15:36 Asia/Shanghai): **验收** — round-3 implement 已完成，下一跳 **review 第 3 轮（design-vs-impl）**
- Artifact wall (R1 implement → R3 implement): ~**174 min**（12:43 → 15:36）；另讨论段自 ~11:23 起

## Timeline (Asia/Shanghai, artifact mtimes)

| Time | Artifact | Delta |
|------|----------|-------|
| ~11:23–12:16 | 讨论 / 澄清 / 定稿 | 早段 token 极高 |
| 12:43 | round-1-implement | |
| 13:44 | round-1-review | **+61 min**（含中断续验） |
| 14:14 | round-2-implement | +30 min |
| 14:19 | round-2-review | +5.5 min |
| 14:35 | feature-spec 更新（UI 检查表） | |
| 15:36 | round-3-implement + loop-state | **+60 min**（UI 还原；曾 token 熔断） |

## What ate time (concrete)

1. **讨论前置烧 token（~564k / 25 steps @11:23）**：调度者 Task 前深搜；空 Grep+glob；约定多次 Read；设计图；修订轮仍搜 HUB/地图（后已有技能补丁，但当日已付账）。
2. **复合功能一期过宽（A 嵌套页 + D Manager/Mock/地图桩 + Lifecycle 钩子 + 多语言）**：R1 实现面大，R1 验收核对面更大（61 min）。
3. **设计还原缺席导致返工**：R1/R2 未按设计还原 → 用户反馈差距 → R3 专门 UI 还原又 ~60 min；期间清理十余个 `values-*` 残留 key + token 熔断续做。
4. **多语言全量手工同步**：同一实现轮牵动大量 locale 文件，易超时/熔断。
5. **非主因**：SafeNet（本期 A/D 无 Route）；build/ 目录缺失不影响。

## Skill patches (this note)

- feature-add-loop: 熔断续做、UI/多语言分期编排、设计图只传路径且 Read≤2、验收勿全语言抽查
- feature-discuss: 约定整轮 Read≤1；图 Read≤2；修订禁再开图/约定
- feature-implement: 先 UI 后外围；禁一轮手搓全 values-*；续做跟 loop-state
- feature-review: 核对面=报告改动文件+检查表；多语言抽样；工具上限建议

ag6.0 app source untouched by this diagnosis pass.
