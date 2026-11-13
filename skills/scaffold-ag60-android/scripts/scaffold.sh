#!/usr/bin/env bash
set -euo pipefail
APP_NAME=""; APP_ID=""; PKG_ROOT=""; TARGET=""; SKILL_HOME=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --app-name) APP_NAME="$2"; shift 2;;
    --app-id) APP_ID="$2"; shift 2;;
    --pkg-root) PKG_ROOT="$2"; shift 2;;
    --target) TARGET="$2"; shift 2;;
    --skill-home) SKILL_HOME="$2"; shift 2;;
    *) echo "Unknown $1"; exit 1;;
  esac
done
: "${APP_NAME:?}"; : "${APP_ID:?}"; : "${TARGET:?}"
PKG_ROOT="${PKG_ROOT:-$APP_ID}"
SKILL_HOME="${SKILL_HOME:-$(cd "$(dirname "$0")/.." && pwd)}"
PKG_PATH="${PKG_ROOT//.//}"
SKELETON="$SKILL_HOME/templates/skeleton"
ASSETS="$SKILL_HOME/assets/res-values"
MAP_FILE="$SKILL_HOME/map__prefixes"

[[ -d "$SKELETON" ]] || { echo "Skeleton missing: $SKELETON"; exit 1; }
[[ -d "$ASSETS" ]] || { echo "Assets missing: $ASSETS"; exit 1; }
[[ -f "$MAP_FILE" ]] || { echo "Prefix map missing: $MAP_FILE"; exit 1; }

mkdir -p "$TARGET"
if [[ -n "$(ls -A "$TARGET" 2>/dev/null || true)" ]]; then
  echo "Target not empty: $TARGET"; exit 1
fi

bytes_copy() {
  local src="$1" dest="$2"
  mkdir -p "$(dirname "$dest")"
  # Always stream content into a NEW file — never cp -a / mv (preserves encryption lineage)
  cat "$src" > "$dest"
}

copy_tree_by_bytes() {
  local src="$1" dest="$2"
  local src_abs dest_abs
  src_abs=$(cd "$src" && pwd)
  mkdir -p "$dest"
  dest_abs=$(cd "$dest" && pwd)
  while IFS= read -r -d '' d; do
    local rel="${d#$src_abs/}"
    mkdir -p "$dest_abs/$rel"
  done < <(find "$src_abs" -type d -print0)
  local n=0
  while IFS= read -r -d '' f; do
    local rel="${f#$src_abs/}"
    bytes_copy "$f" "$dest_abs/$rel"
    n=$((n+1))
  done < <(find "$src_abs" -type f -print0)
  echo "$n"
}

declare -A PMAP=()
while IFS= read -r line || [[ -n "${line:-}" ]]; do
  [[ -z "${line:-}" || "$line" =~ ^# ]] && continue
  if [[ "$line" == *$'\t'* ]]; then p=${line%%$'\t'*}; e=${line#*$'\t'}; else p=${line%% *}; e=${line#* }; fi
  p="${p// /}"; e="${e// /}"
  [[ -n "$p" && -n "$e" ]] && PMAP["$p"]="$e"
done < "$MAP_FILE"

resolve_prefixed() {
  local name="$1"
  if [[ "$name" =~ ^([a-z0-9]+)__(.+)$ ]]; then
    local prefix="${BASH_REMATCH[1]}" stem="${BASH_REMATCH[2]}"
    local ext="${PMAP[$prefix]:-}"
    [[ -n "$ext" ]] && { printf '%s\t%s\t%s' "$prefix" "$stem" "$ext"; return 0; }
  fi
  return 1
}

expand_pkg_path() {
  local root="$1"
  while IFS= read -r -d '' d; do
    local parent cursor seg
    parent=$(dirname "$d")
    cursor="$parent"
    IFS='.' read -ra SEGS <<< "$PKG_ROOT"
    for seg in "${SEGS[@]}"; do
      cursor="$cursor/$seg"
      mkdir -p "$cursor"
    done
    while IFS= read -r -d '' f; do
      local rel dest
      rel="${f#$d/}"
      dest="$cursor/$rel"
      bytes_copy "$f" "$dest"
    done < <(find "$d" -type f -print0)
    rm -rf "$d"
  done < <(find "$root" -type d -name '__PKG_PATH__' -print0 | sort -z -r)
}

materialize_prefixed() {
  local root="$1"
  local n=0
  while IFS= read -r -d '' f; do
    local base dir info prefix stem ext newname dest
    base=$(basename "$f"); dir=$(dirname "$f")
    [[ "$base" == "map__prefixes" ]] && continue
    [[ "$base" == *.* ]] && continue
    info=$(resolve_prefixed "$base" || true)
    [[ -z "${info:-}" ]] && continue
    IFS=$'\t' read -r prefix stem ext <<< "$info"
    if [[ "$prefix" == "gitignore" ]]; then newname=".gitignore"
    else newname="${stem}${ext}"; fi
    dest="$dir/$newname"
    if [[ -e "$dest" ]]; then echo "Collision: $dest" >&2; exit 1; fi
    bytes_copy "$f" "$dest"
    rm -f "$f"
    n=$((n+1))
  done < <(find "$root" -type f -print0)
  echo "$n"
}

echo "Copying skeleton by BYTES (not cp -a)..."
N0=$(copy_tree_by_bytes "$SKELETON" "$TARGET")
echo "  wrote $N0 new files"

echo "Expanding __PKG_PATH__..."
expand_pkg_path "$TARGET"

echo "Materializing extensions..."
N1=$(materialize_prefixed "$TARGET")
echo "  materialized $N1 files"

find "$TARGET" -type f \( -name '*.kt' -o -name '*.kts' -o -name '*.xml' -o -name '*.md' -o -name '*.properties' -o -name '*.pro' -o -name '*.txt' -o -name '*.java' -o -name '.gitignore' \) -print0 |
while IFS= read -r -d '' f; do
  sed -i "s|__APP_NAME__|${APP_NAME}|g; s|__APP_ID__|${APP_ID}|g; s|__PKG_ROOT__|${PKG_ROOT}|g; s|__PKG_PATH__|${PKG_PATH}|g" "$f"
done

RES="$TARGET/common/common-res/src/main/res/values"
mkdir -p "$RES"
TMP_STRINGS=""
if [[ -f "$RES/strings.xml" ]]; then TMP_STRINGS=$(cat "$RES/strings.xml"); fi
while IFS= read -r -d '' f; do
  bytes_copy "$f" "$RES/$(basename "$f")"
done < <(find "$ASSETS" -maxdepth 1 -type f -print0)
N2=$(materialize_prefixed "$RES")
if [[ -n "$TMP_STRINGS" ]]; then
  printf '%s' "$TMP_STRINGS" | sed "s|__APP_NAME__|${APP_NAME}|g; s|__APP_ID__|${APP_ID}|g; s|__PKG_ROOT__|${PKG_ROOT}|g; s|__PKG_PATH__|${PKG_PATH}|g" > "$RES/strings.xml"
fi
find "$RES" -type f -name '*.xml' -print0 |
while IFS= read -r -d '' f; do
  sed -i "s|__APP_NAME__|${APP_NAME}|g; s|__APP_ID__|${APP_ID}|g; s|__PKG_ROOT__|${PKG_ROOT}|g; s|__PKG_PATH__|${PKG_PATH}|g" "$f"
done

DRAWABLE="$TARGET/common/common-res/src/main/res/drawable"
mkdir -p "$DRAWABLE"
printf '%s\n' '<?xml version="1.0" encoding="utf-8"?>' \
  '<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">' \
  '    <solid android:color="#00000000"/>' '</shape>' > "$DRAWABLE/bg_transparent.xml"

echo "OK: $TARGET (bytes=$N0 materialize=$((N1+N2)); no cp -a)"
