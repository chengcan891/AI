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

## 提交前检查（防密文）

工作电脑的磁盘用亿赛通透明加密，非授权进程读到的是密文。密文提交上去就是乱码，人和 AI 都读不了，而且看不出来——文件在、能打开、就是内容不对。

装一次钩子，之后每次提交自动检查：

    git config core.hooksPath .githooks

手动跑：

    node tools/check-plaintext.mjs                  # 检查暂存区（提交时用这个）
    node tools/check-plaintext.mjs --changed        # 增量，只扫上次之后改动过的文件
    node tools/check-plaintext.mjs --all            # 全量
    node tools/check-plaintext.mjs --dir 某个目录    # 扫目录，微信收到的工程先扫一遍

亿赛通的文件头已经取到真样本（偏移 0 魔数 `62142365` + 偏移 12 的 `E-SafeNet`）。增量记录写在 `.git/text-guard-state`，没通过就不推进，下次重扫同一批。云端 text-guard 工作流扫的是每次推送的改动。细节见 tools/README.md。
