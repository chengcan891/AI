# 第1轮实现（假想）：LocaleSyncManager
## 新建
1. LocaleSyncManager.kt — core-app language 包（对齐 LanguageManager）
## 修改
2. SettingLanguageViewModel.kt — 调用 LocaleSyncManager
## 未改
- 全部 UI/Route/layout/styles
## 复用核对
| 项 | 要求 | 结果 |
| 模块 | core-app | 是 |
| 调用方 | SettingLanguageViewModel | 是 |
| UI/Route | 无 | 是 |
