#!/usr/bin/env bash
# Ejecuta pnpm audit (SCA — fase 5b).
set -euo pipefail

if [[ "${1:-}" == "--json" ]]; then
  pnpm audit --json
else
  pnpm audit
fi
