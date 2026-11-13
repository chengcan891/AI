---
name: Codex token 优化
description: 在任意 Windows 机器上排查或收紧 Codex 桌面版上下文与 token 消耗时使用：盘点 config、plugins、MCP、AGENTS、MEMORY、会话体积，并按安全优先项修改。全程中文。
---

# Codex token 优化

适用于 **Windows** 上的 Codex 桌面版。技能正文与回报一律用**中文**。

- **默认只读诊断**；用户明确说「改 / 优化 / 应用 / 修改吧」后再写 `config.toml`。
- 改完必须提醒：**托盘彻底退出 Codex 再打开**。
- 配置目录：`%USERPROFILE%\.codex\`（例如 `C:\Users\<用户>\.codex\`）。
- 磁盘副本可放任意技能库，例如 `D:\WorkSpace\AI\skills\codex-token\SKILL.md`；不要写死某一台机器的用户名。

## 一、只读盘点（按清单执行）

### 1. `config.toml` 关键键

读取并记录：

| 键 / 段 | 说明 |
|---|---|
| `model` | 当前模型 |
| `model_reasoning_effort` | 常见 `low` / `medium` / `high`；缺省时注明「未设置」 |
| `tool_output_token_limit` | 工具输出上限；建议日常 `5000`–`8000` |
| `service_tier` | 若有则记下 |
| `model_provider`、`base_url`、`[model_providers.*]` | **经常不存在**（直连官方）；有则检查是否指向本地中继 |
| `notify` | 是否仍挂 `codex-computer-use.exe` 等 GUI 钩子 |
| `[desktop]` | `auto_update`、`check_for_update`、`ambient-suggestions-enabled` |
| `[plugins."…"]` | **GUI/办公能力多在这里**，不要只看 MCP |
| `[mcp_servers.*]` | 自定义/捆绑 MCP；**没有 `enabled = false` 即视为开启** |
| `[projects.'…']` | 信任项目列表，用来定位项目级 `AGENTS.md` |

重点 plugins（名称随版本可能略变）：`browser`、`chrome`、`computer-use`、`unified-computer-use`、`visualize`，以及 documents/pdf/spreadsheets/presentations 等办公插件。

### 2. 中继 / 异常上游（勿误报）

在 `config.toml` 中查找：`8787`、`openai-retry`、`base_url`、`[model_providers`。

- **不要**用裸词 `proxy` 判定中继（例如 `android-mcp-proxy.py` 会误命中）。
- 发现本地中继故障时只标注；**本技能不负责恢复中继**。

### 3. AGENTS / MEMORY

扫描并标出偏大文件（经验阈值：全局 AGENTS >5KB、MEMORY >10KB、项目 AGENTS >8KB 需点名）：

- `%USERPROFILE%\.codex\AGENTS.md`
- `%USERPROFILE%\.codex\memories\MEMORY.md`（注意在 **`memories\` 子目录**，不一定在根）
- 各 `[projects.'…']` 根下的 `AGENTS.md`、`.codex\AGENTS.md`
- 可选：`.codex\skills\` 下自建技能体积（系统缓存里的巨大 AGENTS 通常非每轮必载，可备注「缓存」）

### 4. 会话与缓存体积（分清「盘」和「token」）

- 会话：`sessions\YYYY\MM\DD\rollout-*.jsonl` 或 `.jsonl.zst`
- 归档：`archived_sessions\`
- 另记（多为**占盘**，不等于当前上下文）：`visualizations\`、`cache\`、`thread_history_*.sqlite`、`logs_*.sqlite`、`generated_images\`

统计：`sessions` 总大小、文件数、**≥2MB** 的近期会话（含今日）。  
说明：清理旧 sessions / visualizations **主要腾盘**；正在打开的长会话才会持续吃 token。

## 二、消耗归类（写入简报）

用中文按大致占比排序，至少覆盖：

1. 长会话历史（打开中的大 rollout）
2. `model_reasoning_effort`（high 明显更贵）
3. 工具输出（是否缺 `tool_output_token_limit` / 是否整文件 dump）
4. 图片 / computer-use / chrome / browser / visualize（看 **plugins** 是否仍 enabled）
5. 固定 AGENTS / MEMORY
6. 仍开启的 MCP（含「未写 enabled」的项，如 `node_repl`）

单独一小节写**仅占盘、不直接等于 token**的目录。

## 三、安全优先改动（仅用户授权后）

改前：复制 `config.toml` → `config.toml.bak-YYYYMMDD-HHMMSS`。

若目标状态**已经满足**，回报「已达标，未重复修改」，不要无谓重写。

建议目标：

1. 日常 `model_reasoning_effort = "medium"`（复杂任务再临时 `high`）。
2. 保留 `tool_output_token_limit` 在 `5000`–`8000`；不要把「反复重开会话」当唯一手段。
3. 非 GUI 任务：相关 `[plugins."browser|chrome|computer-use|visualize|…"]` 设 `enabled = false`；不需要时给 `node_repl` / `cua_repl` 等 MCP 显式 `enabled = false`。
4. 办公类 plugins 保持关闭；`[desktop]` 自动更新保持关闭；`ambient-suggestions-enabled = false`。
5. 可选：精简过长项目 AGENTS、归档过期 MEMORY；清理旧 sessions/visualizations 只作腾盘。
6. 不要在本技能里改 `auth.json`、不要登出账号；账号额度 / at capacity 与本技能分开说明。

## 四、使用习惯（口头建议）

- 会话变慢或 rollout ≈2MB+：新开短会话并写交接摘要。
- 读文件限行；禁止整仓 dump、大图 `detail:high`、base64 回灌。
- 全局 `AGENTS.md` 可写「防请求体膨胀」硬规矩（若尚无，授权后可补一版短规矩，勿贴超长模板）。

## 五、中文回报模板（必须用）

```text
【Codex token 检查】
- 配置目录：
- reasoning / tool_output_token_limit / model：
- plugins 已关 / 仍开：
- MCP 已关 / 仍开（含缺省开启）：
- 中继：无 / 有（详情）
- AGENTS/MEMORY 偏大项：
- 会话：总大小；≥2MB 数量；今日最大几条
- 仅占盘：visualizations/cache/sqlite …
- 消耗排序：…
- 本轮是否改配置：否（只读）/ 是（列出键与备份路径）
- 是否需托盘重启 Codex：
- 建议下一步（未授权则只建议）：
```

## 六、可选 PowerShell 盘点片段（只读）

在用户机器上把结果写到 UTF-8 文件再读，避免控制台编码问题：

```powershell
$codex = Join-Path $env:USERPROFILE '.codex'
Get-Content -Raw -Encoding UTF8 (Join-Path $codex 'config.toml')
Get-ChildItem (Join-Path $codex 'sessions') -Recurse -File -EA SilentlyContinue |
  Sort-Object Length -Descending | Select-Object -First 15 FullName, Length, LastWriteTime
Get-Item (Join-Path $codex 'AGENTS.md'), (Join-Path $codex 'memories\MEMORY.md') -EA SilentlyContinue |
  Select-Object FullName, Length
```
