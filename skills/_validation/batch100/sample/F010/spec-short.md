# SAMPLE dry-run: F010 DeviceFarmToolEditFragment
类型：A    源：`component/component-device/src/main/java/com/sinognss/ag/component/device/farmtools/edit/container/DeviceFarmToolEditFragment.kt`    模块：component-device
风险：verify-parent

## discuss（要点）
- 一句话：对照现网 `DeviceFarmToolEditFragment` 的「从零新增」应产出同类结构
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
