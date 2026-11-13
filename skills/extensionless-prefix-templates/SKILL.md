---
name: extensionless-prefix-templates
description: 褰撻渶瑕佹妸鏁存５宸ョ▼銆屾敹鎴愩€嶆棤鎵╁睍鍚?鍓嶇紑瀛樺偍锛屾垨鍐嶃€屾斁鍑恒€嶄负鐪熷疄鎵╁睍鍚嶆枃浠舵椂浣跨敤锛堣瀛楄妭鍐欏嚭锛岀姝?Rename/Move锛屽吋瀹瑰姞瀵?璺緞缁戝畾锛夈€傞€傜敤浜庤剼鎵嬫灦妯℃澘鍏ュ簱銆乽nity2OpenGL 绛夋暣浠撹浆鎹笌杩樺師銆?---

# extensionless-prefix-templates

鍙屽悜绾﹀畾锛?
| 鏂瑰悜 | 鍚箟 | 鑴氭湰 |
|------|------|------|
| **INPUT / strip** | 鏁翠粨 鈫?鏃犳墿灞曞悕+鍓嶇紑锛堝叆搴?鎵撹繘鎶€鑳芥ā鏉匡級 | `scripts/strip-to-prefixed.ps1` / `.sh` |
| **OUTPUT / materialize** | 鏃犳墿灞曞悕+鍓嶇紑 鈫?鐪熷疄鎵╁睍鍚嶏紙鑴氭墜鏋舵斁鍑猴級 | `scripts/materialize-prefixed.ps1` / `.sh` |

涓ょ閮芥槸 **璇诲唴瀹?瀛楄妭 鈫?鍐欐柊鏂囦欢**锛?*绂佹**瀵瑰唴瀹瑰仛 `Rename-Item` / `Move-Item` / `mv`銆俿trip **蹇呴』**鍐欏埌涓庢簮涓嶅悓鐨?`-Dest`锛堟嫆缁濆師鍦版敼 unity2OpenGL锛夈€?
## 浣曟椂浣跨敤

- 鎶?`D:\WorkSpace\SinoFarm\unity2OpenGL`锛堟垨浠绘剰宸ョ▼锛夋敹鎴愬彲鏀捐繘鎶€鑳藉寘鐨勫墠缂€鏍?- 鑴氭墜鏋剁敓鎴愭椂鎶婂墠缂€鏍戠墿鍖栧洖 `.cs` / `.kt` / `.xml` / `.gradle.kts` 绛?- 鏂囦欢鍙兘宸插姞瀵嗭細鍙兘澶嶅埗瀛楄妭鍒版柊璺緞锛屼笉鑳藉氨鍦版敼鍚?
## 鍓嶇紑涓庝富鍚?
- 瀛樺偍鍚嶏細`{鍓嶇紑}__{涓诲悕}`锛堟帹鑽愶級锛涚墿鍖栦害鍏煎 `{鍓嶇紑}_{涓诲悕}`
- 涓诲悕閲岀殑 `.` 缂栫爜涓?`_DOT_`锛堥伩鍏?Windows 璇垽鎵╁睍鍚嶏級锛屼緥濡?`Foo.Designer` 鈫?`cs__Foo_DOT_Designer` 鈫?`Foo.Designer.cs`
- 澶氭鎵╁睍鐢ㄤ笓鐢ㄥ墠缂€锛歚gradlekts` 鈫?`.gradle.kts`锛坄gradlekts__build` 鈫?`build.gradle.kts`锛?- 鏄犲皠琛細`map__prefixes`锛涜鏄庯細`鏂囦欢璇存槑.md`

## CLI锛歴trip锛圛NPUT锛?
**鍔″繀**鎸囧畾鐙珛 `-Dest`锛屼笉瑕佹敼婧愪粨銆?
```powershell
$Skill = "D:\WorkSpace\AI\skills\extensionless-prefix-templates"

# 渚嬶細鎶?unity2OpenGL 鏀舵垚妯℃澘鏍戯紙婧愪粨鍙锛涜緭鍑哄埌鍒锛?powershell -NoProfile -ExecutionPolicy Bypass -File "$Skill\scripts\strip-to-prefixed.ps1" `
  -Source "D:\WorkSpace\SinoFarm\unity2OpenGL" `
  -Dest   "D:\WorkSpace\AI\skills\_scratch_unity2OpenGL_prefixed" `
  -MapFile "$Skill\map__prefixes" `
  -AutoMapUnknown `
  -GeneratedMapOut "D:\WorkSpace\AI\skills\_scratch_unity2OpenGL_prefixed\map__prefixes"

# 鍏堢湅浼氳浆鎹㈠灏戯紙涓嶅啓鐩橈級
powershell -NoProfile -ExecutionPolicy Bypass -File "$Skill\scripts\strip-to-prefixed.ps1" `
  -Source "D:\WorkSpace\SinoFarm\unity2OpenGL" `
  -Dest   "D:\WorkSpace\AI\skills\_scratch_unity2OpenGL_prefixed" `
  -MapFile "$Skill\map__prefixes" `
  -AutoMapUnknown `
  -DryRun
```

```bash
SKILL="D:/WorkSpace/AI/skills/extensionless-prefix-templates"
bash "$SKILL/scripts/strip-to-prefixed.sh" \
  --source "D:/WorkSpace/SinoFarm/unity2OpenGL" \
  --dest   "D:/WorkSpace/AI/skills/_scratch_unity2OpenGL_prefixed" \
  --map "$SKILL/map__prefixes" \
  --auto-map-unknown \
  --generated-map-out "D:/WorkSpace/AI/skills/_scratch_unity2OpenGL_prefixed/map__prefixes"
```

榛樿璺宠繃鐩綍锛歚.git`銆乣node_modules`銆乣Library`銆乣Temp`銆乣bin`銆乣obj`銆乣build` 绛夛紙鍙敤 `-SkipDir` / `--skip-dir` 瑕嗙洊锛夈€?
## CLI锛歮aterialize锛圤UTPUT锛?
鍦?*宸插鍒?*鐨勫墠缂€鏍戜笂鎿嶄綔锛堟垨 strip 鐨?Dest锛夛紱鍐欏嚭鐪熷疄鎵╁睍鍚嶅悗鍒犻櫎璇ユ爲涓婄殑鏃犳墿灞曞悕鍓湰銆傛妧鑳藉寘鍘熶欢涓嶅姩銆?
```powershell
$Skill = "D:\WorkSpace\AI\skills\extensionless-prefix-templates"

# 寤鸿鍏堝鍒朵竴浠藉墠缂€鏍戝啀鐗╁寲锛岄伩鍏嶅紕鑴忓叆搴撳壇鏈?Copy-Item "D:\WorkSpace\AI\skills\_scratch_unity2OpenGL_prefixed" `
  "D:\WorkSpace\AI\skills\_scratch_unity2OpenGL_out" -Recurse

powershell -NoProfile -ExecutionPolicy Bypass -File "$Skill\scripts\materialize-prefixed.ps1" `
  -Root "D:\WorkSpace\AI\skills\_scratch_unity2OpenGL_out" `
  -MapFile "D:\WorkSpace\AI\skills\_scratch_unity2OpenGL_prefixed\map__prefixes"
```

```bash
bash "$SKILL/scripts/materialize-prefixed.sh" \
  --root "D:/WorkSpace/AI/skills/_scratch_unity2OpenGL_out" \
  --map  "D:/WorkSpace/AI/skills/_scratch_unity2OpenGL_prefixed/map__prefixes"
```

## 寰€杩旀祦绋嬶紙鎺ㄨ崘锛?
1. `strip-to-prefixed`锛歚unity2OpenGL` 鈫?`_scratch_..._prefixed`锛堝姞 `-AutoMapUnknown`锛屼繚瀛樼敓鎴愮殑 `map__prefixes`锛?2. 闇€瑕佹斁鍑烘椂锛氬鍒跺墠缂€鏍?鈫?`materialize-prefixed`锛堢敤鍚屼唤 map锛?3. 鎶芥煡锛氭簮涓庣墿鍖栫粨鏋滃瓧鑺備竴鑷达紙鏂囨湰/璧勬簮锛夛紱婧愪粨璺緞鏈敼鍔?
## 楠屾敹

- strip 鍚?Dest 鍐呬负 `cs__*` / `kt__*` / `xml__*` 绛夛紝鏃犳槑鏂?`.cs`/`.kt`锛堣烦杩囩洰褰曢櫎澶栵級
- materialize 鍚庡嚭鐜扮湡瀹炴墿灞曞悕锛屾棤娈嬬暀 `prefix__stem`
- 鑴氭湰涓棤瀵瑰唴瀹规枃浠剁殑 Rename/Move锛涗粎鏈?Read/Write + 鍒犻櫎鏃犳墿灞曞悕鍓湰

## 绂佹 Copy-Item / cp -a锛堝姞瀵嗚缁燂級

鍐呭浼犺緭蹇呴』鐢?`ReadAllBytes`鈫抈WriteAllBytes`锛堟垨 `cat > newfile`锛夈€俙Copy-Item`/`cp -a`/`Rename-Item`/`Move-Item` 浼氫繚鐣欐垨鐮村潖鍔犲瘑/瀹¤琛€缁熴€?
灏卞湴鍒囨柇琛€缁燂細`scripts/rewire-tree-by-bytes.ps1 -Root <鏍?`銆?
璇氬疄璇存槑锛氳嫢閲嶅啓鍚?`cipher` 宸叉槸 `U` 涓?`Encrypted=False`锛屼絾璧勬簮绠＄悊鍣ㄤ粛鏄剧ず MyFileAudit 榛勯攣锛屽垯璇ラ攣鍙兘鏄洰褰?绛栫暐绾ф爣璁帮紝**涓嶄繚璇?*鎹㈠啓鐩?API 涓€瀹氳兘鍘绘帀銆?

## Content I/O

文本/模板内容复制走 scripts/ContentIO.ps1（对齐 cmd-file-reading：优先 cmd /c type 明文）。详见 CONTENT_IO.md。禁止把 E-SafeNet/LOCK 密文壳当成功写回。
## Encryption policy (hard rules)

- Skill pack MUST be plaintext: templates/ assets/ seed-plain/ reference/ must NOT contain E-SafeNet LOCK ciphertext shells. Templates must be ContentIO-readable plaintext; if no seed match, plaintext SCAFFOLD_STUB is OK.
- Generated projects MAY be encrypted: writing to paths like D:\WorkSpace\git\... may re-encrypt files by local policy. That is expected. Do NOT decrypt or clear locks on generated projects. Cursor / Android Studio / cmd type can still read plaintext.
- Maintain skill pack by ContentIO read-then-write from ag6.0 or seed-plain into the skill directory. Never Copy/Rename LOCK shells into the skill pack.
- CN: skill pack plaintext only; generated project may encrypt; do not decrypt generated project.
