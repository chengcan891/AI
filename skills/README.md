# Shared Agent Skills

Canonical skill pack for both Cursor and Codex.

Layout: each skill is a folder with SKILL.md (Agent Skills standard).

Linked into:
- %USERPROFILE%\.agents\skills  (Cursor + Codex)
- %USERPROFILE%\.cursor\skills  (Cursor; optional Cloud Sync source)

Skills:
- readability-loop      可读性重构循环调度者（/readability-loop <类名>）；含通用 rubric.md、scripts/
- readability-refactor  可读性重构拆分方（由 readability-loop 指派）
- readability-review    可读性重构验收方（由 readability-loop 指派，只读）
  开箱即用：构建系统自动识别，项目差异取自项目已有的 AGENTS.md 等规则文件，各项目无需复制任何配置。
  规则尽量写成通用条款放进这里；不要把项目专属的模块名、命令写进这里。

- feature-add-loop         加功能循环调度者（讨论定稿 → 实现 → 验收，直到通过）
- feature-discuss          加功能讨论方（只定稿功能说明，不改代码）
- feature-implement        加功能实现方（按说明改代码，不自行验收）
- feature-review           加功能验收方（只读，PASS/FAIL）
- project-conventions-ag60 ag6.0 路径/基类/SharedStyle/控件/路由范例（换项目时整份替换）
  项目差异放在 project-conventions-*；通用流程不写死模块名。

Do not replace %USERPROFILE%\.codex\skills wholesale (it has .system).
For Codex-only legacy paths, junction individual skill folders into ~/.codex/skills when needed.
