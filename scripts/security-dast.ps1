# DAST ligero con curl (fase 5b - skill security-scan).
# Uso: powershell -ExecutionPolicy Bypass -File scripts/security-dast.ps1 [rama-base] [base-url]
# Requiere servidor local (npm run dev). Se omite si no hay Route Handlers en el diff.

param(
    [string]$Base = "main",
    [string]$BaseUrl = "http://localhost:3000"
)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

function Route-FileToPath {
    param([string]$File)
    if ($File -notmatch 'app[/\\]api[/\\](.+)[/\\]route\.ts$') { return $null }
    $segments = $Matches[1] -replace '\\', '/'
    return "/api/$segments"
}

$routes = @()
if (git rev-parse --verify $Base 2>$null) {
    $diffFiles = git diff --name-only "${Base}...HEAD" 2>$null
    if ($diffFiles) {
        foreach ($f in $diffFiles) {
            $path = Route-FileToPath $f
            if ($path) { $routes += $path }
        }
    }
}

if ($routes.Count -eq 0) {
    Write-Host "DAST: omitido - no hay Route Handlers nuevos/modificados en el diff ${Base}..HEAD"
    exit 0
}

try {
    $null = Invoke-WebRequest -Uri $BaseUrl -Method Get -TimeoutSec 5 -UseBasicParsing
} catch {
    Write-Host "DAST: NO EJECUTADO - servidor no disponible en ${BaseUrl} (levanta con: npm run dev)"
    exit 0
}

$failures = 0
Write-Host "DAST: probando $($routes.Count) endpoint(s) en ${BaseUrl}"

foreach ($route in ($routes | Select-Object -Unique)) {
    $url = "${BaseUrl}${route}"
    Write-Host ""
    Write-Host "--- ${route} ---"

    $r1 = curl.exe -s -o NUL -w "%{http_code}" -X POST $url -H "Content-Type: text/plain" -d "not-json"
    Write-Host "POST payload no-JSON -> HTTP $r1 (esperado 400/415/422)"

    $r2 = curl.exe -s -o NUL -w "%{http_code}" -X POST $url -H "Content-Type: application/json" -d '{}'
    Write-Host "POST JSON vacio -> HTTP $r2 (esperado 400)"

    $payload = '{"test":"<script>alert(1)</script>","email":"not-an-email"}'
    $r3 = curl.exe -s -o NUL -w "%{http_code}" -X POST $url -H "Content-Type: application/json" -d $payload
    Write-Host "POST payload malicioso -> HTTP $r3 (esperado 400/403)"

    $r4 = curl.exe -s -o NUL -w "%{http_code}" -X GET $url
    Write-Host "GET sin auth -> HTTP $r4"

    foreach ($code in @($r1, $r2, $r3)) {
        if ($code -match '^5\d\d$') { $failures++ }
    }
}

if ($failures -gt 0) {
    Write-Host ""
    Write-Host "DAST: FALLO - $failures respuesta(s) 5xx detectadas"
    exit 1
}

Write-Host ""
Write-Host "DAST: completado sin respuestas 5xx"
exit 0
