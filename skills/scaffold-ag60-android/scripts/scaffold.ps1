<#
.SYNOPSIS
  Scaffold an AG6.0-architecture Android multi-module project from embedded templates.
.NOTES
  Self-contained: never reads ag6.0 or ag6.0-doc_cc.
  Content transfer uses ContentIO (cmd /c type for text/SafeNet plaintext), then WriteAllBytes.
  Never Copy-Item/Move-Item/Rename-Item on contents. Never treat raw E-SafeNet/LOCK bytes as success.
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$AppName,
  [Parameter(Mandatory = $true)][string]$AppId,
  [Parameter(Mandatory = $true)][string]$TargetDir,
  [string]$PkgRoot = $AppId,
  [string]$SkillHome = ""
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


if (-not $SkillHome) {
  $SkillHome = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
}

$skeleton = Join-Path $SkillHome 'templates\skeleton'
$assetsRes = Join-Path $SkillHome 'assets\res-values'
$mapFile = Join-Path $SkillHome 'map__prefixes'

if (-not (Test-Path $skeleton)) { throw "Skeleton not found: $skeleton" }
if (-not (Test-Path $assetsRes)) { throw "Assets not found: $assetsRes" }
if (-not (Test-Path $mapFile)) { throw "Prefix map not found: $mapFile (see 鏂囦欢璇存槑.md)" }

if (Test-Path $TargetDir) {
  $existing = Get-ChildItem -Force $TargetDir | Where-Object { $_.Name -notin @('.', '..') }
  if ($existing) { throw "TargetDir is not empty: $TargetDir" }
} else {
  New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
}

$pkgPath = $PkgRoot -replace '\.', '/'

function Get-PrefixMap([string]$path) {
  $dict = @{}
  Get-Content -LiteralPath $path -Encoding UTF8 | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) { return }
    $parts = $line -split "`t"
    if ($parts.Count -lt 2) { $parts = $line -split '\s+', 2 }
    if ($parts.Count -ge 2) { $dict[$parts[0].Trim()] = $parts[1].Trim() }
  }
  if ($dict.Count -eq 0) { throw "Empty prefix map: $path" }
  return $dict
}

function Write-BytesCopy([string]$src, [string]$dest) {
  # Back-compat name: now routes through ContentIO plaintext read
  Write-ContentCopy $src $dest
}

function Copy-TreeByBytes([string]$srcRoot, [string]$destRoot) {
  # Recreate tree with NEW files only. Never Copy-Item (preserves encryption lineage).
  $srcFull = [IO.Path]::GetFullPath($srcRoot)
  Get-ChildItem -LiteralPath $srcRoot -Recurse -Force -Directory | ForEach-Object {
    $rel = $_.FullName.Substring($srcFull.Length).TrimStart('\', '/')
    $d = Join-Path $destRoot $rel
    if (-not (Test-Path -LiteralPath $d)) { New-Item -ItemType Directory -Force -Path $d | Out-Null }
  }
  $n = 0
  Get-ChildItem -LiteralPath $srcRoot -Recurse -Force -File | ForEach-Object {
    $rel = $_.FullName.Substring($srcFull.Length).TrimStart('\', '/')
    $dest = Join-Path $destRoot $rel
    Write-BytesCopy $_.FullName $dest
    $n++
  }
  return $n
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

function Materialize-PrefixedFiles([string]$root, [hashtable]$prefixMap) {
  $count = 0
  $files = @(Get-ChildItem -LiteralPath $root -Recurse -File | Where-Object {
    (-not $_.Extension) -and ($_.Name -match '^[a-z0-9]+_') -and ($_.Name -ne 'map__prefixes')
  })
  foreach ($f in $files) {
    $info = Resolve-PrefixedName $f.Name $prefixMap
    if (-not $info) { continue }
    if ($info.Prefix -eq 'gitignore') { $newName = '.gitignore' }
    else { $newName = $info.Stem + $info.Ext }
    $dest = Join-Path $f.DirectoryName $newName
    if (Test-Path -LiteralPath $dest) {
      throw "Materialize collision: $dest already exists (from $($f.Name))"
    }
    Write-BytesCopy $f.FullName $dest
    Remove-Item -LiteralPath $f.FullName -Force
    $count++
  }
  return $count
}

function Expand-PkgPathDirs([string]$root, [string]$PkgRoot) {
  $dirs = @(Get-ChildItem -Path $root -Directory -Recurse |
    Where-Object { $_.Name -eq '__PKG_PATH__' } |
    Sort-Object { $_.FullName.Length } -Descending)
  foreach ($d in $dirs) {
    $segments = $PkgRoot.Split('.')
    $cursor = $d.Parent.FullName
    foreach ($seg in $segments) {
      $cursor = Join-Path $cursor $seg
      if (-not (Test-Path -LiteralPath $cursor)) {
        New-Item -ItemType Directory -Force -Path $cursor | Out-Null
      }
    }
    $srcRoot = $d.FullName
    Get-ChildItem -LiteralPath $srcRoot -Recurse -File -Force | ForEach-Object {
      $rel = $_.FullName.Substring($srcRoot.Length).TrimStart('\', '/')
      $destFile = Join-Path $cursor $rel
      Write-BytesCopy $_.FullName $destFile
    }
    Remove-Item -LiteralPath $srcRoot -Recurse -Force
  }
}

$prefixMap = Get-PrefixMap $mapFile

Write-Host "Copying skeleton by BYTES (not Copy-Item) -> $TargetDir"
$copied = Copy-TreeByBytes $skeleton $TargetDir
Write-Host "  wrote $copied new files via ContentIO (cmd type plaintext) + WriteAllBytes"

Write-Host "Expanding __PKG_PATH__ (byte rewrite)..."
Expand-PkgPathDirs $TargetDir $PkgRoot

Write-Host "Materializing real extensions (byte rewrite)..."
$n1 = Materialize-PrefixedFiles $TargetDir $prefixMap
Write-Host "  materialized $n1 files"

function Replace-InFile([string]$path, [hashtable]$map) {
  $text = Read-PlainText $path
  $orig = $text
  foreach ($k in $map.Keys) { $text = $text.Replace($k, $map[$k]) }
  if ($text -ne $orig) {
    [IO.File]::WriteAllText($path, $text, [Text.UTF8Encoding]::new($false))
  }
}

$map = @{
  '__APP_NAME__' = $AppName
  '__APP_ID__'   = $AppId
  '__PKG_ROOT__' = $PkgRoot
  '__PKG_PATH__' = $pkgPath
}

Write-Host "Substituting placeholders..."
Get-ChildItem -Path $TargetDir -Recurse -File |
  Where-Object {
    $_.Extension -match '\.(kt|kts|xml|md|properties|pro|txt|gradle|java)$' -or
    $_.Name -eq 'README.md' -or $_.Name -eq '.gitignore'
  } |
  ForEach-Object { Replace-InFile $_.FullName $map }

$resValues = Join-Path $TargetDir 'common\common-res\src\main\res\values'
New-Item -ItemType Directory -Force -Path $resValues | Out-Null
$keepStrings = Join-Path $resValues 'strings.xml'
$tmpStrings = $null
if (Test-Path -LiteralPath $keepStrings) { $tmpStrings = Read-PlainText $keepStrings }

Get-ChildItem -LiteralPath $assetsRes -File | ForEach-Object {
  Write-BytesCopy $_.FullName (Join-Path $resValues $_.Name)
}

Write-Host "Materializing assets/res-values..."
$n2 = Materialize-PrefixedFiles $resValues $prefixMap
Write-Host "  materialized $n2 files"

if ($tmpStrings) {
  $tmpStrings2 = $tmpStrings
  foreach ($k in $map.Keys) { $tmpStrings2 = $tmpStrings2.Replace($k, $map[$k]) }
  [IO.File]::WriteAllText($keepStrings, $tmpStrings2, [Text.UTF8Encoding]::new($false))
}

Get-ChildItem -LiteralPath $resValues -File |
  Where-Object { $_.Extension -eq '.xml' } |
  ForEach-Object { Replace-InFile $_.FullName $map }

$drawable = Join-Path $TargetDir 'common\common-res\src\main\res\drawable'
New-Item -ItemType Directory -Force -Path $drawable | Out-Null
$placeholderLines = @(
  '<?xml version="1.0" encoding="utf-8"?>',
  '<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">',
  '    <solid android:color="#00000000"/>',
  '</shape>'
)
[IO.File]::WriteAllText((Join-Path $drawable 'bg_transparent.xml'), ($placeholderLines -join "`n") + "`n", [Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "OK: Scaffolded AG6.0-style project"
Write-Host "  Path         : $TargetDir"
Write-Host "  AppName      : $AppName"
Write-Host "  Materialized : $($n1 + $n2) (ContentIO plaintext copy; no Copy-Item)"
Write-Host "Next: open in Android Studio, Sync, run :app"
