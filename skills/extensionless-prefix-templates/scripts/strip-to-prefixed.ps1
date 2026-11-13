<#
.SYNOPSIS
  Strip a project tree to extensionless + prefix storage (INPUT direction).
.DESCRIPTION
  Reads plaintext via ContentIO (cmd /c type for text) and WRITES a new prefixed file under -Dest.
  Never Rename-Item/Move-Item on content. Source tree is left unchanged unless -InPlace (discouraged).
.EXAMPLE
  # Safe: copy unity2OpenGL into a skill/templates folder as prefixed storage
  .\strip-to-prefixed.ps1 `
    -Source 'D:\WorkSpace\SinoFarm\unity2OpenGL' `
    -Dest   'D:\WorkSpace\AI\skills\my-unity-scaffold\templates\skeleton' `
    -MapFile 'D:\WorkSpace\AI\skills\extensionless-prefix-templates\map__prefixes' `
    -AutoMapUnknown
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$Source,
  [Parameter(Mandatory = $true)][string]$Dest,
  [string]$MapFile = "",
  [string[]]$SkipDir = @('.git', '.svn', '.hg', 'node_modules', '.gradle', 'build', 'bin', 'obj', '.idea', '.vs', 'Library', 'Temp', 'Logs', 'PackageCache', '__pycache__', '.turbo', 'dist', 'out'),
  [switch]$AutoMapUnknown,
  [switch]$DryRun,
  [switch]$InPlace,
  [string]$GeneratedMapOut = ""
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

if (-not $MapFile) {
  $MapFile = Join-Path (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)) 'map__prefixes'
}
if (-not (Test-Path -LiteralPath $Source)) { throw "Source not found: $Source" }
if (-not (Test-Path -LiteralPath $MapFile)) { throw "MapFile not found: $MapFile" }
if ($InPlace) { throw "Refusing -InPlace (unsafe for encrypted trees). Always use -Dest as a separate output folder." }
if ([IO.Path]::GetFullPath($Dest).TrimEnd('\') -eq [IO.Path]::GetFullPath($Source).TrimEnd('\')) {
  throw "Dest must differ from Source (refusing in-place)."
}

function Get-PrefixMap([string]$path) {
  $dict = [ordered]@{}
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
  return $dict
}

function Write-BytesCopy([string]$src, [string]$dest) {
  # Back-compat name: now routes through ContentIO plaintext read
  Write-ContentCopy $src $dest
}

function Encode-Stem([string]$stem) {
  if ([string]::IsNullOrEmpty($stem)) { return 'ROOT' }
  return ($stem.Replace('.', $DotTok))
}

function Match-Extension([string]$fileName, [hashtable]$extToPrefix) {
  # Special dotfiles
  if ($fileName -eq '.gitignore') { return @{ Ext = '.gitignore'; Prefix = 'gitignore'; Stem = 'ROOT' } }
  if ($fileName -eq '.gitattributes') { return @{ Ext = '.gitattributes'; Prefix = 'gitattributes'; Stem = 'ROOT' } }
  if ($fileName -eq '.editorconfig') { return @{ Ext = '.editorconfig'; Prefix = 'editorconfig'; Stem = 'ROOT' } }
  if ($fileName -eq '.dockerignore') { return @{ Ext = '.dockerignore'; Prefix = 'dockerignore'; Stem = 'ROOT' } }
  if ($fileName -eq '.npmrc') { return @{ Ext = '.npmrc'; Prefix = 'npmrc'; Stem = 'ROOT' } }
  if ($fileName -eq '.nvmrc') { return @{ Ext = '.nvmrc'; Prefix = 'nvmrc'; Stem = 'ROOT' } }

  $lower = $fileName.ToLowerInvariant()
  $sortedExt = $extToPrefix.Keys | Sort-Object { $_.Length } -Descending
  foreach ($ext in $sortedExt) {
    if ($lower.EndsWith($ext.ToLowerInvariant()) -and $fileName.Length -gt $ext.Length) {
      $stem = $fileName.Substring(0, $fileName.Length - $ext.Length)
      return @{ Ext = $ext; Prefix = $extToPrefix[$ext]; Stem = $stem }
    }
  }
  return $null
}

function Auto-PrefixForExt([string]$ext) {
  # .gradle.kts -> gradlekts
  $p = $ext.TrimStart('.').Replace('.', '').ToLowerInvariant()
  if (-not $p) { return $null }
  return $p
}

$prefixMap = Get-PrefixMap $MapFile
# ext -> prefix
$extToPrefix = @{}
foreach ($k in $prefixMap.Keys) { $extToPrefix[$prefixMap[$k]] = $k }

$skipSet = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($s in $SkipDir) { [void]$skipSet.Add($s) }

$converted = 0
$skippedUnmapped = 0
$skippedDir = 0
$autoAdded = @{}  # prefix -> ext for generated map merge

if (-not $DryRun) {
  if (-not (Test-Path -LiteralPath $Dest)) {
    New-Item -ItemType Directory -Force -Path $Dest | Out-Null
  }
}

$sourceFull = [IO.Path]::GetFullPath($Source)
Get-ChildItem -LiteralPath $Source -Recurse -Force -File | ForEach-Object {
  $relDir = $_.DirectoryName.Substring($sourceFull.Length).TrimStart('\', '/')
  $parts = @()
  if ($relDir) { $parts = $relDir -split '[\\/]' }
  foreach ($seg in $parts) {
    if ($skipSet.Contains($seg)) {
      $script:skippedDir++
      return
    }
  }

  $m = Match-Extension $_.Name $extToPrefix
  if (-not $m) {
    if ($AutoMapUnknown) {
      # everything after first dot
      $idx = $_.Name.IndexOf('.')
      if ($idx -le 0) {
        $script:skippedUnmapped++
        Write-Warning "No extension, skip: $($_.FullName)"
        return
      }
      $stem = $_.Name.Substring(0, $idx)
      $ext = $_.Name.Substring($idx)  # includes dots
      $prefix = Auto-PrefixForExt $ext
      if (-not $prefix) { $script:skippedUnmapped++; return }
      $m = @{ Ext = $ext; Prefix = $prefix; Stem = $stem }
      if (-not $extToPrefix.ContainsKey($ext)) {
        $extToPrefix[$ext] = $prefix
        $autoAdded[$prefix] = $ext
      }
    } else {
      $script:skippedUnmapped++
      Write-Warning "Unmapped extension, skip: $($_.Name)"
      return
    }
  }

  $encStem = Encode-Stem $m.Stem
  $newName = '{0}__{1}' -f $m.Prefix, $encStem
  $destDir = if ($relDir) { Join-Path $Dest $relDir } else { $Dest }
  $destPath = Join-Path $destDir $newName
  if (-not $DryRun -and (Test-Path -LiteralPath $destPath)) {
    throw "Collision: $destPath (from $($_.FullName))"
  }
  Write-BytesCopy $_.FullName $destPath
  $script:converted++
}

# empty dirs optional 鈥?skip

if ($GeneratedMapOut -or $autoAdded.Count -gt 0) {
  $outMap = if ($GeneratedMapOut) { $GeneratedMapOut } else { Join-Path $Dest 'map__prefixes' }
  $lines = New-Object System.Collections.Generic.List[string]
  $lines.Add('# prefix<TAB>extension (merged base + auto)')
  $seen = @{}
  foreach ($p in $prefixMap.Keys) {
    $lines.Add("$p`t$($prefixMap[$p])"); $seen[$p] = $true
  }
  foreach ($p in ($autoAdded.Keys | Sort-Object)) {
    if (-not $seen.ContainsKey($p)) { $lines.Add("$p`t$($autoAdded[$p])") }
  }
  if (-not $DryRun) {
    $parent = Split-Path -Parent $outMap
    if ($parent -and -not (Test-Path $parent)) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
    [IO.File]::WriteAllText($outMap, (($lines -join "`n") + "`n"), [Text.UTF8Encoding]::new($false))
  }
  Write-Host "Wrote/updated map: $outMap"
}

Write-Host "Strip done. converted=$converted skippedUnmapped=$skippedUnmapped skippedUnderSkipDirFiles=$skippedDir DryRun=$DryRun"
Write-Host "Source: $Source"
Write-Host "Dest  : $Dest"
