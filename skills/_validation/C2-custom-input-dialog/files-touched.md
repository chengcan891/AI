# 第1轮实现（假想）：RenameMarkerDialog
## 新建
1. RenameMarkerDialogFragment.kt — 继承 BaseVBCardInputDialogFragment
2. dialog_rename_marker.xml
   - 容器：@style/card_view_container
   - 标题：@style/text_title
   - 输入：@style/edit_text
   - 按钮：@style/text_button
## 修改
3. 调用方 show；4. string-work.xml
## 复用核对
| 元素 | 必须 | 来源 |
| 基类 | BaseVBCardInputDialogFragment | 基类节 |
| 样式 | card_view_container / text_title / edit_text / text_button | styles.xml |
| Route | 无 | C 禁碰 |
