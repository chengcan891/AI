# SAMPLE F081 CommonPageLoader
类型：E  模块：component-common  路径：`component/component-common/src/main/java/com/sinognss/component/common/route/CommonPageLoader.kt`
风险：safenet-locked;ide-only;pair-with-path+fragment

## discuss
- 对照现网结构「从零新增」；复用：Path+Loader(+menu) 成对; **IDE only** if SafeNet; 勿 Shell 改密文
- 冻结影响清单；A/C/D 不读路由章

## implement（假想）
- UI 必交绑定表；B/E：SafeNet 文件 IDE 改或未决停机

## review
- 类型门禁 E；Only project-defined View/Style：PASS 必须
结论目标：PASS
