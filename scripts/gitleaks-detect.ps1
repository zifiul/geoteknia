# Ejecuta gitleaks detect sobre el repositorio (fase 5b — skill security-scan).
# Uso: powershell -ExecutionPolicy Bypass -File scripts/gitleaks-detect.ps1 [rama-base]
# Ejemplo con diff de feature: scripts/gitleaks-detect.ps1 main

param(
    [string]$Base = "main"
)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$ExePath = Join-Path $RepoRoot "tools\gitleaks\gitleaks.exe"
$ConfigPath = Join-Path $RepoRoot ".gitleaks.toml"

if (-not (Test-Path $ExePath)) {
    Write-Error "gitleaks no está instalado. Ejecuta: npm run security:install-gitleaks"
}

Set-Location $RepoRoot

$args = @(
    "detect",
    "--source", ".",
    "--config", $ConfigPath,
    "--verbose",
    "--redact"
)

# Escanear solo commits de la rama actual respecto a la base (alineado con security-scan skill).
$baseRef = git rev-parse --verify $Base 2>$null
if ($LASTEXITCODE -eq 0) {
    $args += @("--log-opts", "${Base}..HEAD")
    Write-Host "gitleaks: escaneando commits ${Base}..HEAD"
} else {
    Write-Host "gitleaks: rama base '$Base' no encontrada; escaneo completo del repositorio"
}

& $ExePath @args
exit $LASTEXITCODE
