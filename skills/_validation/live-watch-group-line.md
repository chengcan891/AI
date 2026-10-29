# Live watch: group-line (2026-10-29 Asia/Shanghai)

## Session
- Loop dir: D:\\WorkSpace\\git\\ag6.0\\build\\feature-add-loop\\group-line\\
- Feature: 分组线 / group-line
- Stage at watch: 讨论 (user confirm=否, round=0); only loop-state.md, no feature-spec yet
- Orchestrator conv: 5081faaa… (~10:58–11:03) cumEst~582k steps27 subagents1
- Discuss child: f016ba1a… (~11:01–11:06+) cumEst~640k+ steps39+ 

## Observed waste
1. Composite A+D+HUB+curve+AGMap explored in one discuss without phasing
2. Parent re-read design jpgs x2 each; pdf 1.7MB present (risk)
3. Empty-pattern Grep used as Glob substitute
4. Task prompt listed full-stack exploration; identical Task count=2
5. User asked clarify-first but discuss kept grepping Hub/algorithm
6. No feature-spec after ~5+ min / 39 tool calls

## Skill patches applied (ag6.0 untouched)
- feature-discuss: 复合/分期, 外部文档, 先交流, 探索预算, UI绑定表模板, 禁空Grep
- feature-add-loop: 编排纪律 + Task提示词瘦身
- feature-implement / feature-review: 分期与复合
- project-conventions-ag60: 复合功能提示
