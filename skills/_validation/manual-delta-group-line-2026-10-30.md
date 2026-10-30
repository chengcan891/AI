# manual-delta-group-line-2026-10-30

对照基线：`_validation/manual-final-group-line-2026-10-29.md`（约 2026-10-29 19:28 终态）。  
约束：只改 `D:\WorkSpace\AI\skills`；未改 ag6.0；未接管循环。  
镜像：`~/.cursor/skills` / `~/.agents/skills` 为 junction。

## 1. 相对终态：mtime / 触达文件（2026-10-30）

| 文件 | 新 mtime | 相对 10-29 终态 |
|------|----------|-----------------|
| WorkService.kt | 08:46 | 回退 clearMicroShift→onNavLineSent 钩子（工作树与 HEAD 无 diff） |
| GroupLineResult.kt | 08:57 | +`Disabled` |
| WorkPilotLifecycleManager.kt | 08:58 | onNavLineSent→Boolean；门禁 initPilotSession；skipWhenDisabled |
| WorkLineGroupManager.kt | 09:07 | `dispatch(..., skipWhenDisabled)` |
| WorkLineGroupFragment.kt | 09:44 | 键盘 min/max；动态当前行上限；去范围 Toast |
| WorkLineGroupViewModel.kt | 09:45 | 去掉 `SaveResult.Invalid` |
| string-work.xml（多语） | ~09:46 | badge 字符串改为 1/2/3 |
| fragment_work_line_group.xml | 10:03 | 徽章数字；当前位置用 map tractor 图标 |
| drawable_work_line_group_diagram.xml | 10:14 | 嵌入 tractor 定位矢量 |

未再动：FieldWorkLineEdit*、BasicInfo*、host layout、Param、loop 文档。

## 2. 变更摘要（行为）

1. **防呆输入**：范围进数字键盘；确定置灰；不再主路径 Toast `Invalid`。
2. **单位边界取整**：显示单位下 CEILING/FLOOR 两位，保证换回米仍合法。
3. **依赖 max 重绑**：当前行键盘上限随第一组条数变。
4. **主发跳过关闭**：HUB 自清未启用分组 → `skipWhenDisabled` + `Disabled`；用户保存关闭仍全量 dispatch。
5. **会话门禁**：分组 Invalid/Failure 时 initPilotSession 失败，不挂 pilotService。
6. **清微移钩子回退**：不再二次下发分组（与 10-29 蒸馏相反）。
7. **视觉**：数字徽章 + 与地图同源的 tractor 定位标。

## 3. 新逻辑 risk（仅记录）

1. **clearMicroShift 无 onNavLineSent**：清微移若重发导航线，分组可能未补发（除非设备/其它路径保证）。相对昨日为回归点。
2. **layout 写死 "1"/"2"/"3"** 而 strings 亦有同值：易漂移；应用 `@string`。
3. **曲线 `setGroupLineParam` stub**（昨 risk）仍在，本 delta 未改。
4. **门禁变严**：存量非法分组参数会导致无法初始化驾驶会话——符合新设计，但升级时需数据修复意识。

## 4. Skill 补丁

| 文件 | 变更 |
|------|------|
| feature-implement/SKILL.md | 手工可用态：输入约束、单位取整、skip-disabled、会话门禁、图标同源 |
| feature-review/SKILL.md | 逻辑验收 +9..12 |
| feature-discuss/SKILL.md | 必冻项：范围 UX / 自清 / 门禁 / 徽章样式 |
| feature-add-loop/SKILL.md | 后续手工增量 → manual-delta 流程 |
| project-conventions-ag60/SKILL.md | 新增「手工增量（分组线 2026-10-30）」 |
| _validation/manual-delta-group-line-2026-10-30.md | 本文件 |

## 5. ag6.0

未修改业务源码。
