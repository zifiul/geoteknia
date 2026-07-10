#!/usr/bin/env bash
# Ejecuta npm audit (SCA — fase 5b).
set -euo pipefail

if [[ "${1:-}" == "--json" ]]; then
  npm audit --json
else
  npm audit
fi
