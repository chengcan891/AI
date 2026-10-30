# Manual-fix distill: group-line (2026-10-29)

Observe-only on ag6.0; skills patched under `D:\WorkSpace\AI\skills`. Did not take over discuss/implement/review.

## What user changed vs auto (concrete)

After R3 auto **PASS** (~15:49 Asia/Shanghai), user kept editing:

| File | mtime (Asia/Shanghai) | vs auto |
|------|----------------------|---------|
| `fragment_work_line_group.xml` | 17:10 | Post-PASS layout tweak on R3 rewrite (L/R cards, vertical badge rows, independent unit TextView) |
| `fragment_field_work_line_edit.xml` | 17:16 | Host shell: `CommonTabLayout` + `container_basic_info` / `container_group_line` |
| `FieldWorkLineEditFragment.kt` | 17:19 | Tab host wiring after PASS |
| `drawable_work_line_group_diagram.xml` (+ design svg/xml) | 17:48 | **Rewrote** sparse theme-color placeholder → edge-to-edge diagram (line groups, pin, numbered callouts 1/2/3 in-art) |
| Unstaged also: many `values-*/string-work.xml`, `WorkService.kt`, `WorkPilotLifecycleManager.kt` | — | i18n leftovers / lifecycle (not primary UI complaint) |

`WorkLineGroupFragment.kt` still ~15:19 (auto unit convert); user focused layout + diagram + tab host.

Auto R3 claimed I3-1..I3-6 closed and bare **PASS**, while placeholder diagram and checklist deviations (NumberUnitEditText→independent unit TV; SYSTEM_LENGTH→appUnitService) were rubber-stamped.

## Lessons → skills

### Generic
- **feature-review**: fail empty-placeholder diagram marked done; no bare PASS on UI-restore round with 视觉未验收; checklist control deviation without user confirm cannot close issues; ban structure-only rubber stamp
- **feature-implement**: no invent grid vs row; no swap checklist controls without confirm; placeholder diagram ≠ done; units/badges hard rules
- **feature-discuss**: checklist must spell diagram composition + unit control shape; placeholder default not pass
- **feature-add-loop**: user says auto UI unusable / manual fix → reopen issues, leave 完成, do not overwrite hand-edits

### project-conventions-ag60 only
- Length: prefer `getAppUnit(LENGTH)+unitConvert`; independent unit TextView over NumberUnitEditText when end-gravity overlap; storage meters
- Tab: match_parent + distributeEvenly + resource colors
- Diagram: edge-to-edge; callouts in asset; hex OK in illustration vector only
- Nested tabs: parent Tab + FrameLayout containers → child Fragments

## Remaining gaps
- User still mid manual polish (diagram/host); skills do not claim visual done
- Switch color / decimal format / range hint unit text still open per loop-state
- Review skill still cannot literally screenshot-compare; relies on composition checklist + honesty rules
