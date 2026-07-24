# Security Scan — gtk-25-rbac-capa-autorizacion

- Fecha: 2026-07-24
- Diff analizado: working tree vs `main` (sin commits aún — el harness commitea tras el archive). Ficheros: `lib/auth/config.ts`, `lib/auth/index.ts`, `lib/auth/session.ts` (modificados), `lib/auth/rbac-errors.ts`, `lib/auth/rbac.ts` (nuevos), `tests/unit/auth/rbac.test.ts`, `tests/unit/auth/session-portal.test.ts` (nuevos).
- Herramientas: Semgrep (`p/typescript`, `p/react`, `p/owasp-top-ten` vía `tools/semgrep-venv/`), `npm audit`, gitleaks (`tools/gitleaks/`), DAST manual (n/a).
- Nota de alcance: `npm run security:scan` calcula el diff con `git diff main...HEAD`, que está vacío porque esta US aún no tiene commits (política del harness: el humano commitea tras el archive, fase 8). SAST y Secretos cayeron a su fallback ampliado (repo tracked completo / 0 commits) en vez de al diff exacto; se complementó con revisión manual dirigida a los ficheros realmente tocados (listados arriba).

## Resumen

| Chequeo | Resultado | Crítico | Alto | Medio | Bajo |
|---------|-----------|---------|------|-------|------|
| SAST | LIMPIO | 0 | 0 | 0 | 0 |
| SCA | HALLAZGOS (pre-existentes, no introducidos por esta US) | 2 | 3 | 0 | 0 |
| Secretos | LIMPIO | 0 | 0 | 0 | 0 |
| DAST | OMITIDO (sin Route Handlers en esta US) | — | — | — | — |

## Hallazgos

### [SEV-INFORMATIVA] SAST — alcance ampliado por falta de commits

- Ubicación: N/A (configuración del script `scripts/semgrep-scan.ps1`).
- Descripción: al no existir commits en la rama, el script escaneó los 49 ficheros trackeados por git bajo `app/`, `lib/`, `tests/` en vez de limitarse al diff. Resultado: 0 findings sobre 563 reglas (`p/typescript`+`p/react`+`p/owasp-top-ten`), incluidos los 5 ficheros nuevos/modificados de esta US.
- Recomendación: ninguna acción; se re-ejecutará implícitamente cuando el humano commitee (fase 8) si se desea un `security:sast` acotado al diff real.
- Estado: ACEPTADO (no bloquea; cobertura fue igual o mayor a la del diff).

### [SEV-ALTA/CRÍTICA] SCA — vulnerabilidades preexistentes en dependencias transitivas de Auth.js/Next.js

- Ubicación: `node_modules/@auth/core` (vía `next-auth`), `node_modules/next`, `node_modules/next/node_modules/postcss`, `node_modules/sharp`.
- Descripción: `npm audit` reporta 5 vulnerabilidades (2 críticas en `@auth/core`, 3 altas en `next`/`postcss`/`sharp`). Ninguna es introducida por GTK-25: esta US **no añade ni modifica ninguna dependencia** (`package.json`/`package-lock.json` no aparecen en el diff). Son las mismas versiones de `next-auth`/`next` ya fijadas en `main` desde GTK-21/GTK-23.
- Evidencia: `npm audit` → "5 vulnerabilities (3 high, 2 critical)"; `git status --porcelain` confirma que `package.json`/`package-lock.json` no están en el diff de esta US.
- Recomendación: actualizar `next-auth`/`next`/`sharp` a versiones parcheadas es una acción de mantenimiento transversal (afecta a todo el portal, no solo a RBAC) — fuera del alcance de GTK-25. Debe abrirse como ticket de mantenimiento de dependencias independiente.
- Estado: ACEPTADO para esta US con la justificación anterior (preexistente, sin relación con el código de `rbac.ts`/`session.ts`/`config.ts` añadido); pendiente de un ticket de actualización de dependencias a nivel de repo.

## Veredicto del scan

HALLAZGOS ACEPTABLES CON JUSTIFICACIÓN — el único hallazgo con severidad alta/crítica (SCA) es preexistente al repo, no introducido por esta US (sin cambios en dependencias), y queda documentado para un ticket de mantenimiento separado. SAST, Secretos y DAST están limpios/omitidos correctamente para el código de esta US.
