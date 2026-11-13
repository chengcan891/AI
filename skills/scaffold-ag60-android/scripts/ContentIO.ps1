# Shared content I/O aligned with cmd-file-reading / safenet-decrypted-reading.
# Prefer cmd /c type for text-like files (transparent plaintext under SafeNet).
# Never treat raw ReadAllBytes of E-SafeNet/LOCK as success.

function Test-SafeNetCipherHead([byte[]]$bytes) {
  if (-not $bytes -or $bytes.Length -lt 12) { return $false }
  $n = [Math]::Min(48, $bytes.Length)
  $ascii = [Text.Encoding]::ASCII.GetString($bytes, 0, $n)
  return ($ascii -match 'E-SafeNet' -or $ascii -match 'LOCK')
}

function Test-IsTextLikePath([string]$path) {
  $name = [IO.Path]::GetFileName($path)
  $ext = [IO.Path]::GetExtension($path).ToLowerInvariant()
  if (-not $ext) {
    # extensionless prefix templates: kt__Foo, xml__strings, md__README, ...
    if ($name -match '^(kt|java|xml|md|gradle|kts|properties|txt|pro|json|yaml|yml|gitignore|editorconfig)[_]') { return $true }
    return $true
  }
  return $ext -in @(
    '.kt', '.java', '.xml', '.md', '.gradle', '.kts', '.properties', '.txt', '.pro',
    '.json', '.yaml', '.yml', '.toml', '.csv', '.svg', '.html', '.css', '.js', '.ts',
    '.c', '.cpp', '.h', '.hpp', '.cs', '.py', '.sh', '.ps1', '.bat', '.cmd'
  )
}

function Read-PlainBytesViaCmdType([string]$src) {
  $tmp = Join-Path $env:TEMP ('cmdtype-' + [guid]::NewGuid().ToString('N') + '.bin')
  try {
    $arg = '/c type "' + $src + '" > "' + $tmp + '"'
    $p = Start-Process -FilePath 'cmd.exe' -ArgumentList $arg -Wait -PassThru -WindowStyle Hidden
    if (-not (Test-Path -LiteralPath $tmp)) { return $null }
    $bytes = [IO.File]::ReadAllBytes($tmp)
    if ($bytes.Length -eq 0) { return $null }
    return $bytes
  } finally {
    Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
  }
}

function Read-PlainContentBytes([string]$src) {
  if (-not (Test-Path -LiteralPath $src)) { throw "Source not found: $src" }
  $raw = [IO.File]::ReadAllBytes($src)
  $textLike = Test-IsTextLikePath $src
  $rawLocked = Test-SafeNetCipherHead $raw

  if ($textLike -or $rawLocked) {
    $viaCmd = Read-PlainBytesViaCmdType $src
    if ($viaCmd -and -not (Test-SafeNetCipherHead $viaCmd)) {
      return $viaCmd
    }
    if ($rawLocked) {
      throw @"
SafeNetLOCK: cannot obtain plaintext for:
  $src
cmd /c type still returned ciphertext (or empty). This usually means a prior
ReadAllBytes/WriteAllBytes copied the encrypted blob as raw file content.
Restore from a plaintext seed, or re-strip the source tree using ContentIO
(cmd type) — do not decrypt with MyFileAudit/EFS tools.
"@
    }
  }
  return $raw
}

function Write-ContentCopy([string]$src, [string]$dest) {
  $parent = Split-Path -Parent $dest
  if ($parent -and -not (Test-Path -LiteralPath $parent)) {
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
  }
  $bytes = Read-PlainContentBytes $src
  [IO.File]::WriteAllBytes($dest, $bytes)
}

function Read-PlainText([string]$src, [Text.Encoding]$encoding = $null) {
  if (-not $encoding) { $encoding = [Text.UTF8Encoding]::new($false) }
  $bytes = Read-PlainContentBytes $src
  return $encoding.GetString($bytes)
}
