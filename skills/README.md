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

Do not replace %USERPROFILE%\.codex\skills wholesale (it has .system).
For Codex-only legacy paths, junction individual skill folders into ~/.codex/skills when needed.
