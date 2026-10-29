# 第1轮实现（假想）：ConfirmClearWorkDialog
issues：无

## 实际改动文件（假想）
### 新建
- 无

### 修改
1. WorkMarkersFragment.kt（假想调用点）
   - 调用：`CommonDialogUtils` 确认 API（具体方法名以源码为准，如 showNotice/confirm）
   - 依赖：`common/common-view/.../dialog/CommonDialogUtils.kt`
   - 现成对话框：`dialog/impl/CommonNoticeDialog`（由 Utils 内部使用）
2. string-work.xml — confirm_clear_* 文案

### 未改
- 无新 Dialog 类；无 layout；无 PageRoute/Loader

## 复用核对表
| 元素 | 必须使用 | 来源 |
|---|---|---|
| 确认框 | CommonDialogUtils / CommonNoticeDialog | SharedControl Dialog |
| 文案 | string-work.xml | common-res |
| Route | 无 | 速查 C 禁碰 |

## 构建
- 未执行
