<#
.SYNOPSIS
  Restore known plaintext seed into SafeNetLOCK-headed template files, then verify via cmd type.
#>
[CmdletBinding()]
param(
  [string]$SkillHome = 'D:\WorkSpace\AI\skills\scaffold-ag60-android',
  [string]$SeedDir = ''
)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'ContentIO.ps1')
if (-not $SeedDir) { $SeedDir = Join-Path $PSScriptRoot '..\seed-plain' }
$map = @{
  'kt__BaseViewBindingActivity' = 'base\BaseViewBindingActivity.kt'
  'kt__BaseVBCardDialogFragment' = 'base\BaseVBCardDialogFragment.kt'
  'kt__BaseViewBindingFragment' = 'base\BaseViewBindingFragment.kt'
}
$restored=0
Get-ChildItem -LiteralPath (Join-Path $SkillHome 'templates') -Recurse -File -Force | ForEach-Object {
  if ($map.ContainsKey($_.Name)) {
    $seed = Join-Path $SeedDir $map[$_.Name]
    if (-not (Test-Path -LiteralPath $seed)) { Write-Warning "Missing seed $seed"; return }
    $text = [IO.File]::ReadAllText($seed)
    # keep package placeholder style if template used __PKG__ — seed uses com.sino...; leave as-is (scaffold substitutes later on materialized trees)
    [IO.File]::WriteAllText($_.FullName, $text, [Text.UTF8Encoding]::new($false))
    $restored++
    Write-Host "Restored $($_.FullName)"
  }
}
# Also restore res-values assets from seed
$assets = Join-Path $SkillHome 'assets\res-values'
if ((Test-Path $assets) -and (Test-Path (Join-Path $SeedDir 'res-values'))) {
  Get-ChildItem (Join-Path $SeedDir 'res-values') -File | ForEach-Object {
    $pref = 'xml__' + $_.BaseName
    $dest = Join-Path $assets $pref
    if (-not (Test-Path $dest)) { $dest = Join-Path $assets $_.Name }
    # write both prefixed form if exists
    $candidates = @(
      (Join-Path $assets ('xml__' + $_.BaseName)),
      (Join-Path $assets $_.Name)
    )
    foreach ($c in $candidates) {
      if (Test-Path -LiteralPath $c) {
        [IO.File]::WriteAllText($c, [IO.File]::ReadAllText($_.FullName), [Text.UTF8Encoding]::new($false))
        Write-Host "Restored asset $c"
        $restored++
      }
    }
  }
}
Write-Host "Restored count=$restored"
# Smoke: cmd type on BaseViewBindingActivity
$sample = Get-ChildItem -LiteralPath (Join-Path $SkillHome 'templates') -Recurse -Filter 'kt__BaseViewBindingActivity' -File | Select-Object -First 1
if ($sample) {
  $tmp = Join-Path $env:TEMP 'smoke-BaseViewBindingActivity.plain'
  cmd.exe /c "type `"$($sample.FullName)`" > `"$tmp`""
  $t = [IO.File]::ReadAllText($tmp)
  $ok = ($t -match 'abstract class BaseViewBindingActivity') -and ($t -notmatch 'E-SafeNet')
  Write-Host "SMOKE cmd-type kotlin=$ok Len=$($t.Length) head=$($t.Substring(0,[Math]::Min(80,$t.Length)).Replace([char]10,' '))"
}
