#!/usr/bin/env bash
# require-code-review.sh - Gate duro pre-archive del harness de Geoteknia.
#
# Verifica que el change OpenSpec tiene un informe de code-review con veredicto
# APTO antes de permitir /opsx:archive (ver docs/harness-geoteknia.md, fase 6,
# y la skill openspec-workflow).
#
# Uso:    bash ai-specs/scripts/require-code-review.sh <change-name>
# Salida: exit 0 si existe un informe con "Veredicto: APTO"; exit 1 en cualquier
#         otro caso (sin change, sin reports, sin informe, NO APTO).

set -euo pipefail

if [[ $# -ne 1 || -z "${1}" ]]; then
  echo "GATE require-code-review: FALLO — uso: $(basename "$0") <change-name>" >&2
  exit 1
fi

CHANGE_NAME="$1"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CHANGE_DIR="${REPO_ROOT}/openspec/changes/${CHANGE_NAME}"
REPORTS_DIR="${CHANGE_DIR}/reports"

if [[ ! -d "${CHANGE_DIR}" ]]; then
  echo "GATE require-code-review: FALLO — no existe el change '${CHANGE_NAME}' en openspec/changes/." >&2
  exit 1
fi

if [[ ! -d "${REPORTS_DIR}" ]]; then
  echo "GATE require-code-review: FALLO — el change '${CHANGE_NAME}' no tiene carpeta reports/." >&2
  exit 1
fi

# Informes candidatos: code-review.md o cualquier *code-review*.md en reports/.
mapfile -t CANDIDATES < <(find "${REPORTS_DIR}" -maxdepth 1 -type f -iname "*code-review*.md" | sort)

if [[ ${#CANDIDATES[@]} -eq 0 ]]; then
  echo "GATE require-code-review: FALLO — no hay informe de code-review en ${REPORTS_DIR}." >&2
  echo "La fase 6 del harness debe generar reports/code-review.md (skill code-review-gate)." >&2
  exit 1
fi

# Se evalúa el informe más reciente por nombre (sort: el último de la lista).
REPORT="${CANDIDATES[-1]}"

if grep -qE '^[[:space:]]*Veredicto:[[:space:]]*NO[[:space:]]+APTO[[:space:]]*$' "${REPORT}"; then
  echo "GATE require-code-review: FALLO — veredicto NO APTO en ${REPORT}." >&2
  echo "Corrige los bloqueantes (vuelta a fase 4) y repite el review antes de archivar." >&2
  exit 1
fi

if grep -qE '^[[:space:]]*Veredicto:[[:space:]]*APTO[[:space:]]*$' "${REPORT}"; then
  echo "GATE require-code-review: OK — veredicto APTO en ${REPORT}."
  exit 0
fi

echo "GATE require-code-review: FALLO — el informe ${REPORT} no contiene una línea 'Veredicto: APTO' ni 'Veredicto: NO APTO'." >&2
echo "El informe debe terminar con el veredicto literal (skill code-review-gate)." >&2
exit 1
