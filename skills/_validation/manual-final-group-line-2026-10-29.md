# manual-final-group-line-2026-10-29

日期：2026-10-29（Asia/Shanghai）  
范围：用户宣布手工改完后的只读逻辑审查 + skills 蒸馏。  
约束：未改 `ag6.0` 业务源码；仅改 `D:\WorkSpace\AI\skills`（`~/.cursor/skills` / `~/.agents/skills` 为 junction 镜像）。

## A. 终态文件与 mtime（抽样）

| 文件 | mtime (本地) |
|------|----------------|
| WorkLineGroupFragment.kt | 2026-10-29 15:19:00 |
| FieldWorkLineEditFragment.kt | 2026-10-29 17:19:12 |
| fragment_work_line_group.xml | 2026-10-29 17:10:02 |
| fragment_field_work_line_edit.xml | 2026-10-29 17:16:16 |
| drawable_work_line_group_diagram.xml | 2026-10-29 18:40:19 |
| WorkService.kt | 2026-10-29 18:28:55 |
| WorkLineGroupManager.kt | 2026-10-29 19:28:45 |

终态要点：嵌套 Tab 宿主 + 子页自治页脚；独立单位 TextView + 米缓存；真矢量示意图；`onNavLineSent` + `clearMicroShift` 联动；`syncCurrentWorkLine`。

## B. 逻辑审查（只报告，未改 app）

### Bug
- （未发现必现崩溃级 bug。）`setGroupLineParam` 虽为 stub，但当前 `return true`，不会把曲线下发直接打成 Failure——因此不算硬 bug，归入 risk。

### Risk
1. **曲线算法未真正接入分组线**：`LineAlgorithmExecutor.setGroupLineParam` 注释 TODO，只打日志并 `return true`。曲线线型会走该分支再调 HUB；规划侧可能未使用分组参数，表现为「保存/下发成功但曲线行为不对」。
2. **主发钩子覆盖面偏窄**：`onNavLineSent` 目前见于 `initPilotSession` 与 `clearMicroShift`。若还有其它「向 HUB 重发导航线」路径未接同一钩子，分组线会与主线脱节。
3. **应用开关关闭仍强制全字段合法**：`enabled=false` 时 `validate` 仍检查 gap/count/row；用户只想关掉应用但字段暂非法时无法保存。需确认是否符合产品。
4. **单位变更不重刷数值**：`onLanguageChanged` 会刷新单位文案，但不按新单位重算 `etGroupGap`；若运行时系统长度单位可变，会出现「标签已变、数字仍是旧单位」。
5. **`clearMicroShift` 异步下发**：成功后 `serviceScope.launch` 调 `onNavLineSent(workLine)`；若期间用户已切换当前作业线，仍对捕获的旧 `workLine` 下发分组。极端切线竞态需知悉。
6. **SaveResult 使用裸 LiveData**：配置变更后可能重复消费旧 Toast（项目内常见模式）。

### Nit
1. 关闭「应用」时输入区未灰显——与部分设置页习惯不同。
2. 确定按钮在参数合法时始终可点（无 dirty 检测），可重复保存。
3. 双 `FrameLayout` 均 `layout_weight=1` 依赖 `GONE` 忽略权重——当前显隐正确，同时 `VISIBLE` 会布局异常。
4. Lifecycle 注释在部分 diff 工具下中文可能乱码，不影响逻辑。

### 已做对的地方（可用性真源）
- Tab 按线型显隐 + 懒加载分组子页。
- 单位：米存库、系统单位展示、独立 unit TextView、未改文本复用米值。
- 第一组条数↓ → 当前行 coerce；回填抑制。
- 存库后 `syncCurrentWorkLine`。
- 示意图边缘矢量，与徽章色系一致。
- 子页自有取消/确定，确定留页。
- 导航线主发后统一二次下发分组；清微移补钩子。

## C. Skill 变更摘要

| 文件 | 变更 |
|------|------|
| feature-review/SKILL.md | 新增「逻辑验收补充（参数表单 / 多 Tab / 主从下发）」 |
| feature-implement/SKILL.md | 新增「手工可用态沉淀（参数页 / 多 Tab）」 |
| feature-discuss/SKILL.md | 新增「参数页 / 多 Tab 必冻项」 |
| feature-add-loop/SKILL.md | 在手工修 UI 编排节补充「手工终态蒸馏」步骤 |
| project-conventions-ag60/SKILL.md | 新增「手工终态模式（分组线 / 嵌套编辑 2026-10-29）」 |
| _validation/manual-final-group-line-2026-10-29.md | 本文件 |

镜像：`C:\Users\admin\.cursor\skills`、`C:\Users\admin\.agents\skills` → junction 到本目录，无需另拷。

## D. ag6.0

未修改任何 ag6.0 应用源码；未接管 discuss/implement/review 循环。
