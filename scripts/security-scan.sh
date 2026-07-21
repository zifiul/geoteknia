#!/usr/bin/env bash
# Orquestador de los cuatro chequeos de seguridad (fase 5b).
# Uso: bash scripts/security-scan.sh [rama-base]
set -euo pipefail

BASE="${1:-main}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${REPO_ROOT}"

declare -A STATUS=()
declare -A EXIT_CODE=()

run_check() {
  local name="$1"
  shift
  echo ""
  printf '=%.0s' {1..60}; echo
  echo " CHEQUEO: ${name} "
  printf '=%.0s' {1..60}; echo
  set +e
  "$@"
  local code=$?
  set -e
  EXIT_CODE["${name}"]="${code}"
  if [[ "${code}" -eq 0 ]]; then
    STATUS["${name}"]="OK"
  else
    STATUS["${name}"]="FALLO (exit ${code})"
  fi
}

run_check "SAST" bash scripts/semgrep-scan.sh "${BASE}"
run_check "SCA" bash scripts/security-audit.sh
run_check "Secretos" bash scripts/gitleaks-detect.sh "${BASE}"
run_check "DAST" bash scripts/security-dast.sh "${BASE}"

echo ""
printf '=%.0s' {1..60}; echo
echo " RESUMEN security:scan (diff base: ${BASE}) "
printf '=%.0s' {1..60}; echo
for name in SAST SCA Secretos DAST; do
  printf "  %-10s %s\n" "${name}:" "${STATUS[${name}]}"
done

failed=0
for name in SAST SCA Secretos DAST; do
  if [[ "${EXIT_CODE[${name}]}" -ne 0 ]]; then failed=1; fi
done

if [[ "${failed}" -eq 1 ]]; then
  echo ""
  echo "security:scan FALLO — revisa la salida anterior y documenta en reports/security.md"
  exit 1
fi

echo ""
echo "security:scan OK — todos los chequeos ejecutados sin fallos bloqueantes"
