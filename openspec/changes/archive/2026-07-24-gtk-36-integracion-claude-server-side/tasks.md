# Tasks — gtk-36-integracion-claude-server-side

> US: [GTK-36](https://linear.app/geoteknia/issue/GTK-36) — Integración Claude server-side
> Labels: `Backend`, `Feature` | E2E N+3 omitido; curl N+2 omitido; contrato HTTP omitido (librería interna)

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] 0.1 Revisar `openspec/config.yaml`, `docs/technical/backend-standards.md`, issue Linear GTK-36.
- [x] 0.2 Crear rama `feature/backend-gtk-36-integracion-claude` desde `main`.
- [x] 0.3 Verificar rama actual y `git status`.
- [x] 0.4 Confirmar que no se sobrescribe trabajo no relacionado.

## 1. Contrato Zod / API (fase 2)

- [x] 1.1 **Omitida** — sin Route Handlers ni Server Actions nuevos (GTK-38).

## 2. TDD-RED (fase 3)

- [x] 2.1 Tests `runGeneration` (éxito, error transitorio, streaming, cache_control, sin temperature).
- [x] 2.2 Tests `computeCostEur` / `persistTokenUsage` + abuse SEC-1/SEC-2.
- [x] 2.3 Evidencia RED en `reports/2026-07-24-step-3-tdd-red.md`.

## 3. Implementación (fase 4a)

- [x] 3.1 `lib/ia/client.ts`, `models.ts`, `generate.ts`, `token-usage.ts`, `errors.ts`, `index.ts`.
- [x] 3.2 `lib/env.ts` + `.env.example` (vars IA_*).
- [x] 3.3 Tests VERDE + `tests/qa/gtk-36-db.qa.test.ts`.

## 4. Paso N: revisar tests existentes (OBLIGATORIO)

- [x] 4.1 Suite completa Vitest sin regresiones (unitarios).

## 5. Paso N+1: unitarios + BD (OBLIGATORIO)

- [x] 5.1 Informe `reports/2026-07-24-step-N+1-unit-test-and-db-verification.md`.

## 6. Paso N+2: curl (omitido)

- [x] 6.1 **Omitido** — sin Route Handlers.

## 7. Paso N+3: E2E (omitido — Backend)

- [x] 7.1 **Omitido** — E2E en GTK-38 / US frontend.

## 8. Fase 5b: security-scan

- [x] 8.1 `reports/security.md`.

## 9. Fase 6: code-review

- [x] 9.1 `reports/code-review.md` con **Veredicto: APTO**.

## 10. Fase 7: docs

- [x] 10.1 `backend-standards.md` §9, informe fase 7.

## 11. Gate 2 y archive

- [x] 11.1 OK humano Gate 1 (`reports/2026-07-24-gate-1.md`).
- [x] 11.1b OK humano Gate 2 (`reports/2026-07-24-gate-2.md`).
- [x] 11.2 `openspec validate --strict`.
- [x] 11.3 Archive + sync specs (`openspec/specs/ai-claude-integration/spec.md`).
