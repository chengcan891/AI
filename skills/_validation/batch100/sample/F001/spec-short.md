# SAMPLE F001 DeviceFarmToolEditFragment
类型：A  模块：component-device  路径：`component/component-device/src/main/java/com/sinognss/ag/component/device/farmtools/edit/container/DeviceFarmToolEditFragment.kt`
风险：verify-parent;nested-path

## discuss
- 对照现网结构「从零新增」；复用：BaseViewBindingFragment; CommonStatueBar; page_container/text_*/edit_text; 域 string-*.xml; 禁 Route
- 冻结影响清单；A/C/D 不读路由章

## implement（假想）
- UI 必交绑定表；B/E：SafeNet 文件 IDE 改或未决停机

## review
- 类型门禁 A；Only project-defined View/Style：PASS 必须
结论目标：PASS
