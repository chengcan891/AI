<#
.SYNOPSIS
  Materialize extensionless prefixed files to real extensions (OUTPUT direction).
.DESCRIPTION
  READ plaintext via ContentIO (cmd /c type) from {prefix}__{stem} and WRITE {stem}{ext}.
  Never Rename-Item/Move-Item on content. Deletes extensionless copies under -Root after write.
.EXAMPLE
  .\materialize-prefixed.ps1 `
    -Root 'D:\WorkSpace\AI\skills\my-unity-scaffold\_out_check' `
    -MapFile 'D:\WorkSpace\AI\skills\extensionless-prefix-templates\map__prefixes'
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$Root,
  [Parameter(Mandatory = $true)][string]$MapFile,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

# Content I/O: cmd /c type plaintext path (cmd-file-reading / safenet-decrypted-reading)
$_contentIo = Join-Path $PSScriptRoot 'ContentIO.ps1'
if (-not (Test-Path -LiteralPath $_contentIo)) {
  $_contentIo = Join-Path (Split-Path -Parent $PSScriptRoot) 'scripts\ContentIO.ps1'
}
if (-not (Test-Path -LiteralPath $_contentIo)) {
  throw "ContentIO.ps1 not found next to script or under scripts/"
}
. $_contentIo

$DotTok = '_DOT_'

if (-not (Test-Path -LiteralPath $Root)) { throw "Root not found: $Root" }
if (-not (Test-Path -LiteralPath $MapFile)) { throw "MapFile not found: $MapFile" }

function Get-PrefixMap([string]$path) {
  $dict = @{}
  Get-Content -LiteralPath $path -Encoding UTF8 | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) { return }
    $parts = $line -split "`t"
    if ($parts.Count -lt 2) { $parts = $line -split '\s+', 2 }
    if ($parts.Count -ge 2) {
      $p = $parts[0].Trim(); $e = $parts[1].Trim()
      if (-not $e.StartsWith('.')) { $e = '.' + $e }
      $dict[$p] = $e
    }
  }
  if ($dict.Count -eq 0) { throw "Empty prefix map: $path" }
  return $dict
}

function Write-BytesCopy([string]$src, [string]$dest) {
  # Back-compat name: now routes through ContentIO plaintext read
  Write-ContentCopy $src $dest
}

function Resolve-PrefixedName([string]$name, [hashtable]$prefixMap) {
  if ($name -match '^([a-z0-9]+)__(.+)$') {
    $prefix = $Matches[1]; $stem = $Matches[2]
    if ($prefixMap.ContainsKey($prefix)) {
      return @{ Prefix = $prefix; Stem = $stem; Ext = $prefixMap[$prefix] }
    }
  }
  $sorted = $prefixMap.Keys | Sort-Object { $_.Length } -Descending
  foreach ($prefix in $sorted) {
    $p = $prefix + '_'
    if ($name.StartsWith($p) -and $name.Length -gt $p.Length -and ($name.IndexOf('__') -lt 0)) {
      $stem = $name.Substring($p.Length)
      if ($stem) { return @{ Prefix = $prefix; Stem = $stem; Ext = $prefixMap[$prefix] } }
    }
  }
  return $null
}

function Decode-Stem([string]$stem) {
  if ($stem -eq 'ROOT') { return '' }
  return $stem.Replace($DotTok, '.')
}

$prefixMap = Get-PrefixMap $MapFile
$count = 0
$files = @(Get-ChildItem -LiteralPath $Root -Recurse -File | Where-Object {
  (-not $_.Extension) -and ($_.Name -match '^[a-z0-9]+_') -and ($_.Name -ne 'map__prefixes')
})
foreach ($f in $files) {
  $info = Resolve-PrefixedName $f.Name $prefixMap
  if (-not $info) { continue }
  $stem = Decode-Stem $info.Stem
  if ($info.Prefix -eq 'gitignore' -or $info.Ext -eq '.gitignore') { $newName = '.gitignore' }
  elseif ($info.Prefix -eq 'gitattributes') { $newName = '.gitattributes' }
  elseif ($info.Prefix -eq 'editorconfig') { $newName = '.editorconfig' }
  elseif ($info.Prefix -eq 'dockerignore') { $newName = '.dockerignore' }
  elseif ($info.Prefix -eq 'npmrc') { $newName = '.npmrc' }
  elseif ($info.Prefix -eq 'nvmrc') { $newName = '.nvmrc' }
  else {
    if ([string]::IsNullOrEmpty($stem)) { Write-Warning "Empty stem for $($f.Name); skip"; continue }
    $newName = $stem + $info.Ext
  }
  $dest = Join-Path $f.DirectoryName $newName
  if (Test-Path -LiteralPath $dest) {
    throw "Materialize collision: $dest already exists (from $($f.Name))"
  }
  if (-not $DryRun) {
    Write-BytesCopy $f.FullName $dest
    Remove-Item -LiteralPath $f.FullName -Force
  }
  $count++
}
Write-Host "Materialized $count files under $Root (content rewrite, not rename) DryRun=$DryRun"
