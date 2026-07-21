#!/usr/bin/env bash
# Ejecuta Semgrep SAST (fase 5b — skill security-scan).
# Uso: bash scripts/semgrep-scan.sh [rama-base]
set -euo pipefail

BASE="${1:-main}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SEMGREP="${REPO_ROOT}/tools/semgrep-venv/bin/semgrep"

if [[ ! -x "${SEMGREP}" ]]; then
  echo "Semgrep no está instalado. Ejecuta: bash scripts/install-semgrep.sh" >&2
  exit 1
fi

cd "${REPO_ROOT}"

mapfile -t FILES < <(
  if git rev-parse --verify "${BASE}" >/dev/null 2>&1; then
    git diff --name-only "${BASE}...HEAD" 2>/dev/null \
      | grep -E '\.(ts|tsx|js|jsx|mjs)$' \
      | while read -r f; do [[ -f "${f}" ]] && echo "${f}"; done
  fi
)

CONFIGS=(--config p/typescript --config p/react --config p/owasp-top-ten)

if ((${#FILES[@]} > 0)); then
  echo "semgrep: escaneando ${#FILES[@]} fichero(s) del diff ${BASE}..HEAD"
  exec "${SEMGREP}" scan "${CONFIGS[@]}" --error "${FILES[@]}"
else
  echo "semgrep: sin ficheros escaneables en diff ${BASE}..HEAD; escaneando app/, lib/, tests/"
  exec "${SEMGREP}" scan "${CONFIGS[@]}" --error app lib tests
fi
