#!/usr/bin/env bash
set -euo pipefail
DOTTOK="_DOT_"
SOURCE=""; DEST=""; MAP=""; AUTO=0; DRY=0
SKIP_DEFAULT=".git:.svn:.hg:node_modules:.gradle:build:bin:obj:.idea:.vs:Library:Temp:Logs:PackageCache:__pycache__:.turbo:dist:out"
SKIP="$SKIP_DEFAULT"
GENMAP=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --source) SOURCE="$2"; shift 2;;
    --dest) DEST="$2"; shift 2;;
    --map) MAP="$2"; shift 2;;
    --auto-map-unknown) AUTO=1; shift;;
    --dry-run) DRY=1; shift;;
    --skip-dir) SKIP="$2"; shift 2;;
    --generated-map-out) GENMAP="$2"; shift 2;;
    *) echo "Unknown $1"; exit 1;;
  esac
done
: "${SOURCE:?}"; : "${DEST:?}"
MAP="${MAP:-$(cd "$(dirname "$0")/.." && pwd)/map__prefixes}"
[[ -d "$SOURCE" ]] || { echo "Source missing: $SOURCE"; exit 1; }
[[ -f "$MAP" ]] || { echo "Map missing: $MAP"; exit 1; }
[[ "$(cd "$SOURCE" && pwd)" != "$(mkdir -p "$DEST"; cd "$DEST" && pwd)" ]] || { echo "Dest must differ from Source"; exit 1; }

declare -A P2E=() E2P=() AUTOADD=()
while IFS= read -r line || [[ -n "${line:-}" ]]; do
  [[ -z "${line:-}" || "$line" =~ ^# ]] && continue
  if [[ "$line" == *$'\t'* ]]; then p=${line%%$'\t'*}; e=${line#*$'\t'}; else p=${line%% *}; e=${line#* }; fi
  p="${p// /}"; e="${e// /}"
  [[ "$e" == .* ]] || e=".$e"
  P2E["$p"]="$e"; E2P["$e"]="$p"
done < "$MAP"

bytes_copy() {
  local src="$1" dest="$2"
  mkdir -p "$(dirname "$dest")"
  [[ "$DRY" -eq 1 ]] && return 0
  cat "$src" > "$dest"
}

encode_stem() {
  local s="$1"
  [[ -z "$s" ]] && { echo ROOT; return; }
  echo "${s//./$DOTTOK}"
}

should_skip() {
  local rel="$1"
  IFS=':' read -ra SEGS <<< "$SKIP"
  local part
  IFS='/' read -ra PARTS <<< "$rel"
  for part in "${PARTS[@]}"; do
    for s in "${SEGS[@]}"; do
      [[ "$part" == "$s" ]] && return 0
    done
  done
  return 1
}

match_ext() {
  local name="$1"
  case "$name" in
    .gitignore) echo "gitignore|.gitignore|ROOT"; return 0;;
    .gitattributes) echo "gitattributes|.gitattributes|ROOT"; return 0;;
    .editorconfig) echo "editorconfig|.editorconfig|ROOT"; return 0;;
  esac
  local best_e="" best_p=""
  local e p
  for e in "${!E2P[@]}"; do
    local el=${#e} bl=${#best_e}
    if [[ "${name,,}" == *"${e,,}" && ${#name} -gt el ]]; then
      if [[ -z "$best_e" || el -gt bl ]]; then
        # must end with e
        if [[ "${name,,}" == *"${e,,}" && "${name: -${#e}}" == "$e" || "${name: -${#e}}" == "${e}" ]]; then
          # bash case-sensitive endswith:
          local tail="${name: -${#e}}"
          if [[ "${tail,,}" == "${e,,}" ]]; then
            best_e="$e"; best_p="${E2P[$e]}"
          fi
        fi
      fi
    fi
  done
  # fix: proper endswith loop
  best_e=""; best_p=""
  for e in "${!E2P[@]}"; do
    local nlen=${#name} elen=${#e}
    (( nlen > elen )) || continue
    local tail="${name: -elen}"
    if [[ "${tail,,}" == "${e,,}" ]]; then
      if [[ -z "$best_e" || elen -gt ${#best_e} ]]; then
        best_e="$e"; best_p="${E2P[$e]}"
      fi
    fi
  done
  if [[ -n "$best_e" ]]; then
    local stem="${name:0:$((${#name}-${#best_e}))}"
    echo "${best_p}|${best_e}|${stem}"
    return 0
  fi
  return 1
}

converted=0; skipped=0
SRC_ABS=$(cd "$SOURCE" && pwd)
mkdir -p "$DEST"
DEST_ABS=$(cd "$DEST" && pwd)

while IFS= read -r -d '' f; do
  rel="${f#$SRC_ABS/}"
  reldir=$(dirname "$rel")
  base=$(basename "$f")
  if should_skip "$rel"; then skipped=$((skipped+1)); continue; fi
  info=$(match_ext "$base" || true)
  if [[ -z "${info:-}" ]]; then
    if [[ "$AUTO" -eq 1 && "$base" == *.* && "$base" != .* ]]; then
      stem="${base%%.*}"
      ext=".${base#*.}"
      prefix=$(echo "$ext" | sed 's/^\.//; s/\.//g' | tr '[:upper:]' '[:lower:]')
      [[ -z "$prefix" ]] && { skipped=$((skipped+1)); continue; }
      info="${prefix}|${ext}|${stem}"
      E2P["$ext"]="$prefix"; P2E["$prefix"]="$ext"; AUTOADD["$prefix"]="$ext"
    else
      echo "WARN: unmapped $rel" >&2
      skipped=$((skipped+1)); continue
    fi
  fi
  IFS='|' read -r prefix ext stem <<< "$info"
  enc=$(encode_stem "$stem")
  newname="${prefix}__${enc}"
  if [[ "$reldir" == "." ]]; then dest="$DEST_ABS/$newname"; else dest="$DEST_ABS/$reldir/$newname"; fi
  if [[ "$DRY" -eq 0 && -e "$dest" ]]; then echo "Collision: $dest"; exit 1; fi
  bytes_copy "$f" "$dest"
  converted=$((converted+1))
done < <(find "$SRC_ABS" -type f -print0)

if [[ "$AUTO" -eq 1 || -n "$GENMAP" ]]; then
  out="${GENMAP:-$DEST_ABS/map__prefixes}"
  {
    echo "# prefix<TAB>extension (merged)"
    for p in "${!P2E[@]}"; do echo -e "$p\t${P2E[$p]}"; done | sort
  } > "$out"
  echo "Wrote map: $out"
fi
echo "Strip done. converted=$converted skipped=$skipped DryRun=$DRY"
echo "Source: $SRC_ABS"
echo "Dest  : $DEST_ABS"
