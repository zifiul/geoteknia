#!/usr/bin/env bash
# DAST ligero con curl (fase 5b — skill security-scan).
# Uso: bash scripts/security-dast.sh [rama-base] [base-url]
set -euo pipefail

BASE="${1:-main}"
BASE_URL="${2:-http://localhost:3000}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${REPO_ROOT}"

route_from_file() {
  local f="$1"
  if [[ "${f}" =~ app/api/(.+)/route\.ts ]]; then
    echo "/api/${BASH_REMATCH[1]}"
  fi
}

mapfile -t ROUTES < <(
  if git rev-parse --verify "${BASE}" >/dev/null 2>&1; then
    while read -r f; do
      p="$(route_from_file "${f}")"
      [[ -n "${p}" ]] && echo "${p}"
    done < <(git diff --name-only "${BASE}...HEAD" 2>/dev/null || true)
  fi
)

if ((${#ROUTES[@]} == 0)); then
  echo "DAST: omitido — no hay Route Handlers nuevos/modificados en el diff ${BASE}..HEAD"
  exit 0
fi

if ! curl -sf --max-time 5 "${BASE_URL}" >/dev/null 2>&1; then
  echo "DAST: NO EJECUTADO — servidor no disponible en ${BASE_URL} (levanta con: npm run dev)"
  exit 0
fi

failures=0
echo "DAST: probando ${#ROUTES[@]} endpoint(s) en ${BASE_URL}"

for route in $(printf '%s\n' "${ROUTES[@]}" | sort -u); do
  url="${BASE_URL}${route}"
  echo ""
  echo "--- ${route} ---"

  r1=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${url}" -H "Content-Type: text/plain" -d "not-json")
  echo "POST payload no-JSON -> HTTP ${r1} (esperado 400/415/422)"

  r2=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${url}" -H "Content-Type: application/json" -d "{}")
  echo "POST JSON vacío -> HTTP ${r2} (esperado 400)"

  r3=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${url}" -H "Content-Type: application/json" \
    -d '{"test":"<script>alert(1)</script>","email":"not-an-email"}')
  echo "POST payload malicioso -> HTTP ${r3} (esperado 400/403)"

  r4=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${url}")
  echo "GET sin auth -> HTTP ${r4}"

  for code in "${r1}" "${r2}" "${r3}"; do
    if [[ "${code}" =~ ^5 ]]; then failures=$((failures + 1)); fi
  done
done

if ((failures > 0)); then
  echo ""
  echo "DAST: FALLO — ${failures} respuesta(s) 5xx detectadas"
  exit 1
fi

echo ""
echo "DAST: completado sin respuestas 5xx"
