#!/usr/bin/env bash
# Instala gitleaks en tools/gitleaks/ (Linux/macOS/WSL).
set -euo pipefail

VERSION="8.30.1"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOOLS_DIR="${REPO_ROOT}/tools/gitleaks"
VERSION_FILE="${TOOLS_DIR}/VERSION"

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"
case "${OS}-${ARCH}" in
  linux-x86_64|linux-amd64)  ASSET="gitleaks_${VERSION}_linux_x64.tar.gz" ;;
  linux-aarch64|linux-arm64) ASSET="gitleaks_${VERSION}_linux_arm64.tar.gz" ;;
  darwin-x86_64|darwin-amd64) ASSET="gitleaks_${VERSION}_darwin_x64.tar.gz" ;;
  darwin-arm64)              ASSET="gitleaks_${VERSION}_darwin_arm64.tar.gz" ;;
  *) echo "Plataforma no soportada: ${OS}-${ARCH}" >&2; exit 1 ;;
esac

if [[ -f "${VERSION_FILE}" && "$(cat "${VERSION_FILE}")" == "${VERSION}" && -x "${TOOLS_DIR}/gitleaks" ]]; then
  echo "gitleaks v${VERSION} ya instalado en ${TOOLS_DIR}"
  "${TOOLS_DIR}/gitleaks" version
  exit 0
fi

mkdir -p "${TOOLS_DIR}"
URL="https://github.com/gitleaks/gitleaks/releases/download/v${VERSION}/${ASSET}"
TMP="$(mktemp)"
trap 'rm -f "${TMP}"' EXIT

echo "Descargando gitleaks v${VERSION} (${ASSET})..."
curl -fsSL "${URL}" -o "${TMP}"
tar -xzf "${TMP}" -C "${TOOLS_DIR}"
chmod +x "${TOOLS_DIR}/gitleaks"
echo "${VERSION}" > "${VERSION_FILE}"
echo "gitleaks instalado correctamente:"
"${TOOLS_DIR}/gitleaks" version
