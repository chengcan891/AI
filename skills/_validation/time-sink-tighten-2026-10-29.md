# Time-sink tighten pass (2026-10-29)

Second tighten after `time-sink-group-line-2026-10-29.md`. Skills only under `D:\WorkSpace\AI\skills`; mirrors samefile. ag6.0 untouched.

## Changes

| Skill | Tighten |
|-------|---------|
| feature-add-loop | 前置工具硬上限 ≤6；指派前禁 Grep/Shell 深搜；复合无分期禁 implement；熔断必须带已改/未动；实现禁全语言 Task；设计图 path-only Read≤2；Task ≤40 行 |
| feature-discuss | 草稿工具 ≤10 / 约定 Read≤1 / 图≤2；修订 ≤6 / 约定与图 Read=0 / Grep≤2；复合无分期不得定稿候选 |
| feature-implement | 先 UI 后外围；硬禁一轮手改全部 values-*；续做禁全仓重扫；第2轮+约定 Read=0；探索硬上限 ≤25 |
| feature-review | 核对面=implement 文件+检查表；i18n 抽样不 sweep；工具硬上限 ≤15 |

Generic skills: no CommonTabLayout/LengthUnit-class leaks. Project specifics stay in project-conventions-ag60.
