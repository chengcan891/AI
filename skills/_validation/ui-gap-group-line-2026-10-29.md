# UI gap: group-line (2026-10-29)

## 现象

用户对照设计与实现，分组线 UI 差距大：Tab 未居中、左侧示意图缺失、数据区做成 2x2 而非垂直标签行、宽度单位硬编码 m、参数徽章 1/2/3 写进文案、Tab/按钮与设计不一致。

## 根因（技能 vs Cursor）

**主要是 SKILL 缺口，不只是 Cursor 误解。**

讨论/实现/验收技能此前没有「有设计图必须做 UI 还原检查表」的硬门禁，可用「样式已复用 / SharedStyle」跳过分区、徽章、单位来源、Tab 居中等项；编排也未强制把设计图路径传入实现/验收 Task。因此模型按「能用的表单」发明布局，验收也无 design-vs-impl 失败条件。

## 技能修补（本笔记）

- feature-discuss：设计图 → 必填 UI 还原检查表（分区/Tab/徽章/单位/按钮）
- feature-implement：按检查表落地；LengthUnit；徽章外置；禁发明布局
- feature-review：design-vs-impl 硬门禁 FAIL 条件
- feature-add-loop：讨论带图路径；实现/验收引用检查表
- project-conventions-ag60：common-unit LengthUnit、CommonTabLayout、徽章分离说明

ag6.0 应用代码未改。
