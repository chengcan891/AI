# SAMPLE dry-run: F068 CommonPageLoader
类型：E    源：`component/component-common/src/main/java/com/sinognss/component/common/route/CommonPageLoader.kt`    模块：component-common
风险：safenet-maybe;ide-only

## discuss（要点）
- 一句话：对照现网 `CommonPageLoader` 的「从零新增」应产出同类结构
- 复用：Path+Loader(+menu); SafeNet IDE-only; 配对 Fragment
- 影响清单：按类型速查 E 必碰/禁碰；路径对齐邻近包
- 必问已答：见类型门禁

## implement（假想）
- 只改清单内文件；有 UI 必交 UI 绑定表
- 禁碰：Shell盲改SafeNet

## review 门禁
- Path与Loader成对; 不盲改密文
- Only project-defined View/Style：必须 PASS

结论目标：PASS（样本用于压技能，非改仓库）
