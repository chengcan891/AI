# SAMPLE dry-run: F056 UPanManager
类型：D    源：`core/core-app/src/main/java/com/sinognss/ag/core/app/file/UPanManager.kt`    模块：core-app
风险：need-caller

## discuss（要点）
- 一句话：对照现网 `UPanManager` 的「从零新增」应产出同类结构
- 复用：core Manager; 现有调用方; NO UI/Route
- 影响清单：按类型速查 D 必碰/禁碰；路径对齐邻近包
- 必问已答：见类型门禁

## implement（假想）
- 只改清单内文件；有 UI 必交 UI 绑定表
- 禁碰：PageRoute/Loader

## review 门禁
- caller; 无 UI
- Only project-defined View/Style：N/A

结论目标：PASS（样本用于压技能，非改仓库）
