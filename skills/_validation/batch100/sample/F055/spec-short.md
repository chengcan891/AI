# SAMPLE dry-run: F055 CommonDialogUtils
类型：C    源：`common/common-view/src/main/java/com/sinognss/ag/common/view/dialog/CommonDialogUtils.kt`    模块：common-view
风险：utils-entry

## discuss（要点）
- 一句话：对照现网 `CommonDialogUtils` 的「从零新增」应产出同类结构
- 复用：CommonDialogUtils 优先; else BaseVBCard*; NO Route
- 影响清单：按类型速查 C 必碰/禁碰；路径对齐邻近包
- 必问已答：见类型门禁

## implement（假想）
- 只改清单内文件；有 UI 必交 UI 绑定表
- 禁碰：PageRoute/Loader

## review 门禁
- Utils或基类; 禁 Route; 文案共享
- Only project-defined View/Style：必须 PASS

结论目标：PASS（样本用于压技能，非改仓库）
