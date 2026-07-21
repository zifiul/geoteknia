#!/usr/bin/env bash
# Instala Semgrep en tools/semgrep-venv/ (Linux/macOS/WSL).
set -euo pipefail

PACKAGE="semgrep"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENV_DIR="${REPO_ROOT}/tools/semgrep-venv"
SEMGREP="${VENV_DIR}/bin/semgrep"
VERSION_FILE="${VENV_DIR}/VERSION"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 no encontrado en PATH." >&2
  exit 1
fi

if [[ -x "${SEMGREP}" ]]; then
  version="$("${SEMGREP}" --version 2>&1 | head -n1)"
  echo "Semgrep ya instalado en ${VENV_DIR} (${version})"
  echo "${version}" > "${VERSION_FILE}"
  exit 0
fi

echo "Creando venv en ${VENV_DIR}..."
python3 -m venv "${VENV_DIR}"
"${VENV_DIR}/bin/pip" install --upgrade pip >/dev/null
"${VENV_DIR}/bin/pip" install "${PACKAGE}"

if [[ ! -x "${SEMGREP}" ]]; then
  echo "No se encontró semgrep tras la instalación." >&2
  exit 1
fi

version="$("${SEMGREP}" --version 2>&1 | head -n1)"
echo "${version}" > "${VERSION_FILE}"
echo "Semgrep instalado correctamente: ${version}"
