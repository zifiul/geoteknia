# Orquestador de los cuatro chequeos de seguridad (fase 5b — skill security-scan).
# Uso: powershell -ExecutionPolicy Bypass -File scripts/security-scan.ps1 [rama-base]

param(
    [string]$Base = "main"
)

$ErrorActionPreference = "Continue"
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

$separator = "=" * 60
$statusSast = "PENDIENTE"
$statusSca = "PENDIENTE"
$statusSecrets = "PENDIENTE"
$statusDast = "PENDIENTE"
$codeSast = 0
$codeSca = 0
$codeSecrets = 0
$codeDast = 0

Write-Host ""
Write-Host $separator
Write-Host " CHEQUEO: SAST "
Write-Host $separator
powershell -ExecutionPolicy Bypass -File (Join-Path $RepoRoot "scripts\semgrep-scan.ps1") -Base $Base
$codeSast = $LASTEXITCODE
if ($codeSast -eq 0) { $statusSast = "OK" } else { $statusSast = "FALLO (exit $codeSast)" }

Write-Host ""
Write-Host $separator
Write-Host " CHEQUEO: SCA "
Write-Host $separator
powershell -ExecutionPolicy Bypass -File (Join-Path $RepoRoot "scripts\security-audit.ps1")
$codeSca = $LASTEXITCODE
if ($codeSca -eq 0) { $statusSca = "OK" } else { $statusSca = "FALLO (exit $codeSca)" }

Write-Host ""
Write-Host $separator
Write-Host " CHEQUEO: Secretos "
Write-Host $separator
powershell -ExecutionPolicy Bypass -File (Join-Path $RepoRoot "scripts\gitleaks-detect.ps1") -Base $Base
$codeSecrets = $LASTEXITCODE
if ($codeSecrets -eq 0) { $statusSecrets = "OK" } else { $statusSecrets = "FALLO (exit $codeSecrets)" }

Write-Host ""
Write-Host $separator
Write-Host " CHEQUEO: DAST "
Write-Host $separator
powershell -ExecutionPolicy Bypass -File (Join-Path $RepoRoot "scripts\security-dast.ps1") -Base $Base
$codeDast = $LASTEXITCODE
if ($codeDast -eq 0) { $statusDast = "OK" } else { $statusDast = "FALLO (exit $codeDast)" }

Write-Host ""
Write-Host $separator
Write-Host " RESUMEN security:scan (diff base: $Base) "
Write-Host $separator
Write-Host ("  {0,-10} {1}" -f "SAST:", $statusSast)
Write-Host ("  {0,-10} {1}" -f "SCA:", $statusSca)
Write-Host ("  {0,-10} {1}" -f "Secretos:", $statusSecrets)
Write-Host ("  {0,-10} {1}" -f "DAST:", $statusDast)

$failed = ($codeSast -ne 0) -or ($codeSca -ne 0) -or ($codeSecrets -ne 0) -or ($codeDast -ne 0)
if ($failed) {
    Write-Host ""
    Write-Host "security:scan FALLO - revisa la salida anterior y documenta en reports/security.md"
    exit 1
}

Write-Host ""
Write-Host "security:scan OK - todos los chequeos ejecutados sin fallos bloqueantes"
exit 0
