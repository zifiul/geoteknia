# Ejecuta npm audit (SCA — fase 5b, skill security-scan).
# Uso: powershell -ExecutionPolicy Bypass -File scripts/security-audit.ps1 [-Json]
# Salida JSON opcional para el informe reports/security.md.

param(
    [switch]$Json
)

$ErrorActionPreference = "Continue"

if ($Json) {
    npm audit --json
} else {
    npm audit
}

exit $LASTEXITCODE
