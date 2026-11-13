---
name: scaffold-ag60-android
description: 褰撶敤鎴疯鏂板缓涓?AG6.0 鍚屾灦鏋勭殑 Android 澶氭ā鍧楅」鐩紙L0鈥揕5銆乧omponent/core/common/db/device銆丼haredStyle銆佽嚜瀹氫箟 View銆丳ageRoute锛夋椂浣跨敤銆傛湰鎶€鑳借嚜鍖呭惈妯℃澘涓庤祫婧愶紙鏃犳墿灞曞悕鍓嶇紑瀛樺偍锛夛紝杩愯鏃剁姝㈠啀鍘昏 ag6.0 鎴?ag6.0-doc_cc銆?---

# scaffold-ag60-android

鐢ㄦ湰鎶€鑳藉寘鍐呭祵鐨勬ā鏉匡紝鑴氭墜鏋跺嚭涓€濂?**AG6.0 鍚屾瀯** 鐨?Android Kotlin 澶氭ā鍧楀伐绋嬨€?
**纭鍒?*锛氭墽琛屾湰鎶€鑳芥椂 **绂佹** 璇诲彇銆佸鍒舵垨渚濊禆 `ag6.0` / `ag6.0-doc_cc` 浠讳綍璺緞锛涗竴鍒囩害瀹氥€佹牱寮忋€佸熀绫汇€佹帶浠堕鏋跺潎浠ユ湰鐩綍涓哄噯銆?
**瀛樺偍瑙勫垯**锛歚templates/`銆乣assets/`銆乣reference/` 鍐呯殑婧愮爜/璧勬簮浠?**鏃犳墿灞曞悕 + 鏂囦欢鍚嶅墠缂€** 瀛樻斁锛堝 `kt__App`銆乣xml__styles`銆乣gradlekts__build`锛屼害鍏煎 `kt_App` 鍗曚笅鍒掔嚎锛夈€傚墠缂€ 鈫?鎵╁睍鍚嶈 [鏂囦欢璇存槑.md](鏂囦欢璇存槑.md) 涓?[map__prefixes](map__prefixes)銆?
**鐢熸垚瑙勫垯锛堝叧閿級**锛氳剼鎵嬫灦瀵圭洰鏍囧伐绋嬮噷鐨勬棤鎵╁睍鍚嶆枃浠舵墽琛?**璇诲彇瀛楄妭 鈫?鍐欏嚭甯︾湡瀹炴墿灞曞悕鐨勬柊鏂囦欢 鈫?鍒犻櫎鐩爣閲岀殑鏃犳墿灞曞悕鍓湰**銆?*绂佹**瀵瑰唴瀹规枃浠朵娇鐢?`Rename-Item` / `Move-Item` / `mv`锛堝氨鍦版敼鍚嶄細鐮村潖宸插姞瀵?璺緞缁戝畾鏉愭枡锛夈€傛妧鑳藉寘鍐呯殑鏃犳墿灞曞悕妯℃澘淇濇寔涓嶅彉銆?
## 浣曟椂浣跨敤

- 鐢ㄦ埛璇达細鍒涘缓绫讳技 ag6.0 鏋舵瀯鐨勯」鐩?/ 鑴氭墜鏋?/ 鏂?Android 澶氭ā鍧楀伐绋?- 闇€瑕佸甫涓婏細鍏辩敤妯″潡銆佽嚜瀹氫箟 View銆侀€氱敤 style/theme銆丳ageRoute銆丮VVM Fragment

## 鍚戠敤鎴锋敹闆嗙殑鍙傛暟

| 鍙傛暟 | 璇存槑 | 绀轰緥 |
|------|------|------|
| `AppName` | 宸ョ▼鏄剧ず鍚?/ rootProject.name | `MyFarm` |
| `AppId` | applicationId | `com.example.myfarm` |
| `PkgRoot` | Kotlin/Java 鍖呮牴锛堥粯璁ゅ悓 AppId锛?| `com.example.myfarm` |
| `TargetDir` | 鏂板伐绋嬭緭鍑虹洰褰曪紙蹇呴』涓虹┖鎴栦笉瀛樺湪锛?| `D:\WorkSpace\git\MyFarm` |

缂哄弬鍒欏厛闂綈鍐嶅姩鎵嬨€?
## 鎵ц姝ラ

1. **纭鍙傛暟**锛堜笂琛級銆?2. **瀹氫綅鏈妧鑳界洰褰?* `SKILL_HOME`锛堟湰 `SKILL.md` 鎵€鍦ㄧ洰褰曪級銆?3. **杩愯鑴氭墜鏋惰剼鏈?*锛?
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "$SKILL_HOME\scripts\scaffold.ps1" `
  -AppName "MyFarm" `
  -AppId "com.example.myfarm" `
  -PkgRoot "com.example.myfarm" `
  -TargetDir "D:\WorkSpace\git\MyFarm" `
  -SkillHome "$SKILL_HOME"
```

鑴氭湰浼氾細澶嶅埗 `templates/skeleton` 鈫?灞曞紑 `__PKG_PATH__`锛堟枃浠剁骇璇诲嚭/鍐欏叆锛屼笉 Move 鍐呭锛夆啋 **鎸夊墠缂€鐗╁寲鎵╁睍鍚嶏紙璇诲瓧鑺傚啓鍑?`.kt` 绛夛級** 鈫?鍗犱綅绗︽浛鎹?鈫?鍚堝苟 `assets/res-values`锛堝悓鏍风墿鍖栵級鈫?鍐欏叆鍗犱綅 drawable銆?
4. 鑻ユ棤娉曡窇鑴氭湰锛氭墜宸ュ鍒跺悗锛屽姣忎釜 `{鍓嶇紑}__{涓诲悕}` **璇诲彇鍐呭骞跺彟瀛樹负** `{涓诲悕}{鎵╁睍鍚峿`锛堜笉瑕佸氨鍦伴噸鍛藉悕锛夛紝鍐嶆浛鎹㈠崰浣嶇銆傝 [鏂囦欢璇存槑.md](鏂囦欢璇存槑.md)銆?5. **鐢熸垚 Gradle Wrapper** 鎴栫敤 Android Studio 鎵撳紑鍚屾銆?6. **鍥炴姤鐢ㄦ埛**锛氳緭鍑鸿矾寰勩€佹ā鍧楀垪琛ㄣ€佸凡鐭ョ己鍙ｃ€?
## 鍓嶇紑閫熸煡

| 鍓嶇紑 | 鎵╁睍鍚?| 渚嬶紙鎶€鑳藉寘鍐?鈫?鐢熸垚鍚庯級 |
|------|--------|-------------------------|
| `kt__` / `kt_` | `.kt` | `kt__CommonDeviceService` 鈫?`CommonDeviceService.kt` |
| `gradlekts__` | `.gradle.kts` | `gradlekts__build` 鈫?`build.gradle.kts` |
| `xml__` | `.xml` | `xml__styles` 鈫?`styles.xml` |
| `pro__` | `.pro` | `pro__consumer-rules` 鈫?`consumer-rules.pro` |
| `properties__` | `.properties` | `properties__gradle` 鈫?`gradle.properties` |
| `md__` / `txt__` | `.md` / `.txt` | reference 鏂囨。 |
| `gitignore__` | `.gitignore` | `gitignore__ROOT` 鈫?`.gitignore` |

## 鏈満鍔犲瘑 / 浠呮湰鏈烘簮

**涓嶈**鎶?SafeNet 鍔犲瘑 blob 鎵撹繘鎶€鑳藉寘褰撳彲绉绘妯℃澘銆傚鐓ц矾寰勮 [鏂囦欢璇存槑.md](鏂囦欢璇存槑.md)銆傝嫢妯℃澘鏂囦欢鏈韩宸插湪鏈満鍔犲瘑锛岃剼鎵嬫灦蹇呴』鐢?**鍐呭閲嶅啓** 鐢熸垚 `.kt`锛屼笉鍙?Rename銆?
## 涓庨€氱敤鐗╁寲鎶€鑳界殑鍏崇郴

瀛樺偍/鐗╁寲绾﹀畾浜﹀彲澶嶇敤鐙珛鎶€鑳?[extensionless-prefix-templates](../extensionless-prefix-templates/SKILL.md)锛堝姪鎵嬭剼鏈?`materialize-prefixed.ps1` / `.sh`锛夈€傛湰鑴氭墜鏋跺凡鍐呭缓鍚岀瓑璇诲嚭/鍐欏嚭閫昏緫锛涙柊鑴氭墜鏋朵紭鍏堝紩鐢ㄨ閫氱敤鎶€鑳姐€?
## 宸茬煡缂哄彛 / 鍋囪

- 鏋舵瀯鍚屾瀯楠ㄦ灦锛岄潪 ag6.0 浜у搧鍏ㄩ噺鎷疯礉銆?- 鏈墦鍖?`gradlew`锛涢渶鏈満鐢熸垚 wrapper銆?

## Content I/O

文本/模板内容复制走 scripts/ContentIO.ps1（对齐 cmd-file-reading：优先 cmd /c type 明文）。详见 CONTENT_IO.md。禁止把 E-SafeNet/LOCK 密文壳当成功写回。
## Encryption policy (hard rules)

- Skill pack MUST be plaintext: templates/ assets/ seed-plain/ reference/ must NOT contain E-SafeNet LOCK ciphertext shells. Templates must be ContentIO-readable plaintext; if no seed match, plaintext SCAFFOLD_STUB is OK.
- Generated projects MAY be encrypted: writing to paths like D:\WorkSpace\git\... may re-encrypt files by local policy. That is expected. Do NOT decrypt or clear locks on generated projects. Cursor / Android Studio / cmd type can still read plaintext.
- Maintain skill pack by ContentIO read-then-write from ag6.0 or seed-plain into the skill directory. Never Copy/Rename LOCK shells into the skill pack.
- CN: skill pack plaintext only; generated project may encrypt; do not decrypt generated project.
