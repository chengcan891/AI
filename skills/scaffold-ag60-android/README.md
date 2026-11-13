# scaffold-ag60-android

自包含 AG6.0 同构 Android 脚手架技能。

- 模板保持无扩展名 + 前缀：见 `文件说明.md`、`map__prefixes`
- 生成时：**读字节 → 写出真实扩展名新文件 → 删除目标内无扩展名副本**（禁止 Rename/Move 内容文件）
- 调用：`scripts/scaffold.ps1` 或 `scripts/scaffold.sh`
