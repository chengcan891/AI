# feature-add dry-run validation

Date: 2026-10-28 Asia/Shanghai. **ag6.0 零写入**。

## Cases → PASS

| Case | 目录 | 类型 | 结论 | View/Style 证据 |
|---|---|---|---|---|
| A 设置嵌套登录页 | `_validation/A-setting-login/` | A ui-nested | PASS | CommonStatueBar；page_container/text_*/edit_text/text_button；BaseViewBindingFragment；禁 Route |
| B 作业导出可路由页 | `_validation/B-work-export/` | B+E | PASS | 同上 SharedStyle/View；Path+WorkPageLoader；strings-menu；SafeNet IDE note |
| C 清除确认框 | `_validation/C-confirm-clear/` | C Utils | PASS | CommonDialogUtils/Notice；无新类；无 Route |
| C2 重命名输入框 | `_validation/C2-custom-input-dialog/` | C 自定义 | PASS | BaseVBCardInputDialogFragment；card_view_container/edit_text/text_* |
| D 语言同步 Manager | `_validation/D-language-sync/` | D service | PASS | 无 UI；LocaleSyncManager + SettingLanguageViewModel |

每案文件：`feature-spec.md`、`files-touched.md`、`review.md`。

## Round-1 FAIL 模拟（技能缺口 → 已打补丁）

桌面推演中若 implement **不写逐控件 Style/View**，按新口径应 FAIL「Only project-defined View/Style / 缺 UI 绑定表」。  
旧技能仅有一行「复用核对」，不足以强制；故在交假想 PASS 清单前已先补技能，使假想 `files-touched.md` 均含绑定表。

## Skill diffs（本轮）

- `feature-discuss`：复用节强制具体 View/Style 名；验收标准强调 CommonStatueBar + 可追溯绑定
- `feature-implement`：类型表强调逐控件绑定；报告模板新增「UI 绑定表」；缺表视为未完成
- `feature-review`：门禁增加 Only project-defined View/Style；报告模板增加对应行
- `project-conventions-ag60`：速查 A/B/C 写明 CommonStatueBar/SharedStyle；Style 节要求绑定表
- `feature-add-loop`：实现提示词要求 A/B/C 含 UI 绑定表

## Remaining risks

- 父容器/Loader 真实类名仍需打开仓库确认（dry-run 用假想路径）
- SafeNet 可读性只能 IDE 确认
- 宿主若忽略「UI 绑定表」纪律，仍可能漏用 SharedStyle——依赖 review 门禁
