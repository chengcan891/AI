#!/usr/bin/env bash
set -euo pipefail
DOTTOK="_DOT_"
ROOT=""; MAP=""; DRY=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --root) ROOT="$2"; shift 2;;
    --map) MAP="$2"; shift 2;;
    --dry-run) DRY=1; shift;;
    *) echo "Unknown $1"; exit 1;;
  esac
done
: "${ROOT:?}"; : "${MAP:?}"
[[ -d "$ROOT" ]] || { echo "Root missing: $ROOT"; exit 1; }
[[ -f "$MAP" ]] || { echo "Map missing: $MAP"; exit 1; }

declare -A PMAP=()
while IFS= read -r line || [[ -n "${line:-}" ]]; do
  [[ -z "${line:-}" || "$line" =~ ^# ]] && continue
  if [[ "$line" == *$'\t'* ]]; then p=${line%%$'\t'*}; e=${line#*$'\t'}; else p=${line%% *}; e=${line#* }; fi
  p="${p// /}"; e="${e// /}"
  [[ "$e" == .* ]] || e=".$e"
  PMAP["$p"]="$e"
done < "$MAP"

bytes_copy() {
  mkdir -p "$(dirname "$2")"
  cat "$1" > "$2"
}

resolve() {
  local name="$1"
  if [[ "$name" =~ ^([a-z0-9]+)__(.+)$ ]]; then
    local prefix="${BASH_REMATCH[1]}" stem="${BASH_REMATCH[2]}"
    local ext="${PMAP[$prefix]:-}"
    [[ -n "$ext" ]] && { printf '%s\t%s\t%s' "$prefix" "$stem" "$ext"; return 0; }
  fi
  return 1
}

n=0
while IFS= read -r -d '' f; do
  base=$(basename "$f"); dir=$(dirname "$f")
  [[ "$base" == *.* ]] && continue
  [[ "$base" == "map__prefixes" ]] && continue
  info=$(resolve "$base" || true)
  [[ -z "${info:-}" ]] && continue
  IFS=$'\t' read -r prefix stem ext <<< "$info"
  if [[ "$stem" == "ROOT" ]]; then stem=""; fi
  stem="${stem//$DOTTOK/.}"
  case "$prefix" in
    gitignore) newname=".gitignore";;
    gitattributes) newname=".gitattributes";;
    editorconfig) newname=".editorconfig";;
    dockerignore) newname=".dockerignore";;
    npmrc) newname=".npmrc";;
    nvmrc) newname=".nvmrc";;
    *) newname="${stem}${ext}";;
  esac
  dest="$dir/$newname"
  if [[ -e "$dest" ]]; then echo "Collision: $dest"; exit 1; fi
  if [[ "$DRY" -eq 0 ]]; then
    bytes_copy "$f" "$dest"
    rm -f "$f"
  fi
  n=$((n+1))
done < <(find "$ROOT" -type f -print0)
echo "Materialized $n files under $ROOT (content rewrite, not rename) DryRun=$DRY"
