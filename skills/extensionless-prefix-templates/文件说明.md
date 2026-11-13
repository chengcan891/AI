# 文件说明（前缀 ↔ 扩展名）— 双向

## 方向

| 方向 | 脚本 | 行为 |
|------|------|------|
| INPUT / strip | `scripts/strip-to-prefixed.ps1` `.sh` | 读源文件字节 → 在 **Dest** 写出 `{前缀}__{主名}`；**不改** Source |
| OUTPUT / materialize | `scripts/materialize-prefixed.ps1` `.sh` | 读 `{前缀}__{主名}` → 写出 `{主名}{扩展名}` → 删除目标内无扩展名副本 |

全程禁止对内容 `Rename-Item` / `Move-Item` / `mv`。

## 主名编码

- 主名中的 `.` → `_DOT_`（strip 时编码，materialize 时还原）
- 空主名（如 `.gitignore`）→ 主名 `ROOT`

## 映射表

见 `map__prefixes`（`前缀<TAB>扩展名`）。strip 使用 `-AutoMapUnknown` 时可为未知扩展自动生成前缀（去掉扩展名中的点），并写入 `-GeneratedMapOut`（默认 Dest/`map__prefixes`），供物化使用。

## unity2OpenGL 示例路径

```text
Source: D:\WorkSpace\SinoFarm\unity2OpenGL
Dest  : D:\WorkSpace\AI\skills\_scratch_unity2OpenGL_prefixed
```

完整命令见 `SKILL.md`。不要对 Source 使用原地转换。
