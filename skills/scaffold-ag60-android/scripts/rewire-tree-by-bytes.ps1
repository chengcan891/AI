<#
.SYNOPSIS
  Rewire a tree by rewriting file contents via ContentIO plaintext read (cmd /c type).
.DESCRIPTION
  Aligns with cmd-file-reading / safenet-decrypted-reading. Does NOT claim unlock;
  fails loudly if cmd type cannot obtain plaintext from SafeNetLOCK blobs.
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$Root
)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'ContentIO.ps1')
$n=0; $fail=0
Get-ChildItem -LiteralPath $Root -Recurse -File -Force | ForEach-Object {
  $tmp = Join-Path $env:TEMP ('rewire-' + [guid]::NewGuid().ToString('N'))
  try {
    Write-ContentCopy $_.FullName $tmp
    $bytes = [IO.File]::ReadAllBytes($tmp)
    Remove-Item -LiteralPath $_.FullName -Force
    [IO.File]::WriteAllBytes($_.FullName, $bytes)
    Remove-Item -LiteralPath $tmp -Force -EA SilentlyContinue
    $n++
  } catch {
    $fail++
    Write-Warning $_.Exception.Message
    Remove-Item -LiteralPath $tmp -Force -EA SilentlyContinue
  }
}
Write-Host "Rewired ok=$n fail=$fail under $Root"
