# Ejecuta Semgrep SAST (fase 5b — skill security-scan).
# Uso: powershell -ExecutionPolicy Bypass -File scripts/semgrep-scan.ps1 [rama-base]
# Escanea ficheros del diff main..HEAD; si no hay diff, escanea app/, lib/, tests/.

param(
    [string]$Base = "main"
)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$SemgrepExe = Join-Path $RepoRoot "tools\semgrep-venv\Scripts\semgrep.exe"

if (-not (Test-Path $SemgrepExe)) {
    Write-Error "Semgrep no está instalado. Ejecuta: npm run security:install-semgrep"
}

Set-Location $RepoRoot

$configs = @(
    "--config", "p/typescript",
    "--config", "p/react",
    "--config", "p/owasp-top-ten"
)

$scanArgs = @("scan") + $configs + @("--error")

$extensions = '\.(ts|tsx|js|jsx|mjs)$'
$files = @()

$baseExists = git rev-parse --verify $Base 2>$null
if ($LASTEXITCODE -eq 0) {
    $diffFiles = git diff --name-only "${Base}...HEAD" 2>$null
    if ($diffFiles) {
        $files = $diffFiles | Where-Object { $_ -match $extensions -and (Test-Path $_) }
    }
}

if ($files.Count -gt 0) {
    Write-Host "semgrep: escaneando $($files.Count) fichero(s) del diff ${Base}..HEAD"
    & $SemgrepExe @scanArgs @files
} else {
    Write-Host "semgrep: sin ficheros escaneables en diff ${Base}..HEAD; escaneando app/, lib/, tests/"
    & $SemgrepExe @scanArgs app lib tests
}

exit $LASTEXITCODE
