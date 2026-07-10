#!/usr/bin/env bash
# code_review.sh - Informe básico de revisión de código para Geoteknia

set -euo pipefail

echo "Iniciando revisión de código..."

if ! command -v agent >/dev/null 2>&1; then
  echo "Error: no se ha encontrado el comando 'agent' en el PATH."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUTPUT_FILE="${SCRIPT_DIR}/revision_${TIMESTAMP}.txt"

if agent -p --output-format text \
  "Revisa los cambios de código recientes del proyecto Geoteknia (monolito modular Next.js 15 + TypeScript estricto + Prisma + Auth.js) y da feedback sobre:
  - Calidad y legibilidad del código.
  - Posibles bugs o casos no contemplados.
  - Cumplimiento de docs/technical/backend-standards.md y docs/technical/frontend-standards.md (capas, Zod, RBAC/2FA, RGPD/PII).
  - Fugas de PII hacia logs, analítica o prompts de Claude.
  - Consideraciones de seguridad (validación de entrada, permisos, secretos).
  - Cumplimiento de buenas prácticas del stack (Next.js App Router, Prisma, Vitest/Playwright).

  Da sugerencias de mejora concretas, en español." > "${OUTPUT_FILE}"; then
  if [[ -s "${OUTPUT_FILE}" ]]; then
    echo "Revisión de código completada correctamente."
    echo "Informe guardado en: ${OUTPUT_FILE}"
  else
    echo "La revisión de código ha fallado: el fichero de salida está vacío."
    exit 1
  fi
else
  echo "La revisión de código ha fallado al ejecutar 'agent'."
  exit 1
fi
