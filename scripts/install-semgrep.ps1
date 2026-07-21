# Instala Semgrep en tools/semgrep-venv/ (venv Python local, no global).
# Uso: powershell -ExecutionPolicy Bypass -File scripts/install-semgrep.ps1

$ErrorActionPreference = "Stop"

$Package = "semgrep"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$VenvDir = Join-Path $RepoRoot "tools\semgrep-venv"
$SemgrepExe = Join-Path $VenvDir "Scripts\semgrep.exe"
$VersionFile = Join-Path $VenvDir "VERSION"
$Python = (Get-Command python -ErrorAction SilentlyContinue).Source

if (-not $Python) {
    Write-Error "Python no encontrado en PATH. Instala Python 3.10+ (https://www.python.org/downloads/)."
}

if ((Test-Path $SemgrepExe)) {
    $installed = & $SemgrepExe --version 2>&1 | Select-Object -First 1
    Write-Host "Semgrep ya instalado en $VenvDir ($installed)"
    Set-Content -Path $VersionFile -Value $installed.Trim() -NoNewline
    exit 0
}

Write-Host "Creando venv en $VenvDir..."
& $Python -m venv $VenvDir

$PipExe = Join-Path $VenvDir "Scripts\pip.exe"
Write-Host "Instalando $Package..."
& $PipExe install --upgrade pip | Out-Null
& $PipExe install $Package

if (-not (Test-Path $SemgrepExe)) {
    Write-Error "No se encontró semgrep.exe tras la instalación."
}

$version = (& $SemgrepExe --version 2>&1 | Select-Object -First 1).Trim()
Set-Content -Path $VersionFile -Value $version -NoNewline
Write-Host "Semgrep instalado correctamente: $version"
