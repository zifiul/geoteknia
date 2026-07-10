#!/usr/bin/env bash
# Ejecuta gitleaks detect (fase 5b — skill security-scan).
# Uso: bash scripts/gitleaks-detect.sh [rama-base]
set -euo pipefail

BASE="${1:-main}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GITLEAKS="${REPO_ROOT}/tools/gitleaks/gitleaks"
CONFIG="${REPO_ROOT}/.gitleaks.toml"

if [[ ! -x "${GITLEAKS}" ]]; then
  echo "gitleaks no está instalado. Ejecuta: bash scripts/install-gitleaks.sh" >&2
  exit 1
fi

cd "${REPO_ROOT}"
ARGS=(detect --source . --config "${CONFIG}" --verbose --redact)

if git rev-parse --verify "${BASE}" >/dev/null 2>&1; then
  ARGS+=(--log-opts "${BASE}..HEAD")
  echo "gitleaks: escaneando commits ${BASE}..HEAD"
else
  echo "gitleaks: rama base '${BASE}' no encontrada; escaneo completo del repositorio"
fi

exec "${GITLEAKS}" "${ARGS[@]}"
