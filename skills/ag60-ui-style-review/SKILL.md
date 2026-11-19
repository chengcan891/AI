---
name: ag60-ui-style-review
description: 检查或优化 AG60 Android 界面的样式、排版与尺寸，对照项目公共资源和同类布局。
---

# AG60 界面样式检查

遵循仓库 `AGENTS.md`。检查和总结只读，用户要求优化时才修改目标布局。

1. 用页面名、字符串、ID 或 Fragment 定位布局。按需追踪宿主、`include`、资源变体及运行时状态。
2. 按背景与页签、卡片、字段、操作区逐层检查。按需查[样式表](references/ui-styles.md)和[排版与尺寸规则](references/review-rules.md)，只读取相关小节。以同模块同用途页面为参照，核对继承、主题、XML 覆盖及直接写入的尺寸。
   - 字段按整组核对标签、当前值和选项的文字层级。弹窗和侧面板单独核对标题栏到第一个可见字段的总留白。
3. 给出位置、实际用法、判断和项目依据。优先报告明确偏差，标出需运行时确认的项。优化时复用公共资源，保留绑定 ID、交互和状态逻辑，按仓库约定验证。

跨模块找定义或用法时，在仓库根目录运行 `python -X utf8 "D:/WorkSpace/AI/skills/ag60-ui-style-review/scripts/index_ui.py" --find "资源名" --limit 12`。维护技能时才查[扫描记录](references/review-coverage.md)。
