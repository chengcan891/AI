# SAMPLE dry-run: F028 IsobusInfoAndSettingContainerFragment
类型：A    源：`component/component-isobus/src/main/java/com/sinognss/component/isobus/container/IsobusInfoAndSettingContainerFragment.kt`    模块：component-isobus
风险：container-parent

## discuss（要点）
- 一句话：对照现网 `IsobusInfoAndSettingContainerFragment` 的「从零新增」应产出同类结构
- 复用：BaseViewBindingFragment; CommonStatueBar; styles page_container/text_*/edit_text; string-*.xml; NO Route
- 影响清单：按类型速查 A 必碰/禁碰；路径对齐邻近包
- 必问已答：见类型门禁

## implement（假想）
- 只改清单内文件；有 UI 必交 UI 绑定表
- 禁碰：PageRoute/Loader

## review 门禁
- 父容器明确; 禁 Route; UI绑定表; SharedStyle only
- Only project-defined View/Style：必须 PASS

结论目标：PASS（样本用于压技能，非改仓库）
