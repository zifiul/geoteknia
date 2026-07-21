# Instala gitleaks en tools/gitleaks/ (binario local, no global).
# Uso: powershell -ExecutionPolicy Bypass -File scripts/install-gitleaks.ps1

$ErrorActionPreference = "Stop"

$Version = "8.30.1"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$ToolsDir = Join-Path $RepoRoot "tools\gitleaks"
$ExePath = Join-Path $ToolsDir "gitleaks.exe"
$VersionFile = Join-Path $ToolsDir "VERSION"

if ((Test-Path $VersionFile) -and (Get-Content $VersionFile -Raw).Trim() -eq $Version -and (Test-Path $ExePath)) {
    Write-Host "gitleaks v$Version ya instalado en $ToolsDir"
    & $ExePath version
    exit 0
}

New-Item -ItemType Directory -Force -Path $ToolsDir | Out-Null

$ZipUrl = "https://github.com/gitleaks/gitleaks/releases/download/v$Version/gitleaks_${Version}_windows_x64.zip"
$ZipPath = Join-Path $env:TEMP "gitleaks_$Version.zip"

Write-Host "Descargando gitleaks v$Version..."
Invoke-WebRequest -Uri $ZipUrl -OutFile $ZipPath -UseBasicParsing

Write-Host "Extrayendo en $ToolsDir..."
Expand-Archive -Path $ZipPath -DestinationPath $ToolsDir -Force
Remove-Item $ZipPath -Force

if (-not (Test-Path $ExePath)) {
    Write-Error "No se encontró gitleaks.exe tras la extracción."
}

Set-Content -Path $VersionFile -Value $Version -NoNewline
Write-Host "gitleaks instalado correctamente:"
& $ExePath version
