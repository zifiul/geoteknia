# Tasks — gtk-33-calculadora-alcance

> US: [GTK-33](https://linear.app/geoteknia/issue/GTK-33/post-apicalculadora-calculadora-de-alcance-de-estudio-geotecnico)
> Rama: `feature/backend-gtk-33-calculadora-alcance`
> Label `Backend`: fase 5a **omite E2E Playwright** (N+3). E2E: GTK-64.

## 0. Setup (OBLIGATORIO — primero)

- [x] 0.1 Crear rama `feature/backend-gtk-33-calculadora-alcance` desde `main`.
- [x] 0.2 Verificar rama activa y `git status` (no pisar trabajo no relacionado).
- [x] 0.3 Abrir change OpenSpec `gtk-33-calculadora-alcance` con proposal/design/specs/tasks (fase 1 SDD).
- [x] 0.4 **Gate 1 humano:** aprobado 2026-07-24 (proposal + specs + design + threat model).

## 1. Contrato (fase 2)

- [x] 1.1 Añadir `POST /api/calculadora` y schemas en `docs/technical/api-spec.yml` (200/400/422/429/500; prefill; sin precio).
- [x] 1.2 Congelar `lib/calculator/schema.ts` (entrada, fórmula `linear`, salida + prefill).
- [x] 1.3 Registrar congelación en `reports/2026-07-24-phase-2-contract.md`.

## 2. TDD-RED (fase 3)

- [x] 2.1 `tests/unit/calculator/schema.test.ts` — `.strict()`, fórmula corrupta.
- [x] 2.2 `tests/unit/calculator/estimate.test.ts` — selección rangos, 4 reglas seed, ceil, desempate, noRule, sin precio.
- [x] 2.3 `tests/unit/calculator/rules-repository.test.ts` — Decimal→number, filtros activos/deleted.
- [x] 2.4 `tests/unit/api/calculadora.test.ts` — 200/400/422/429; SEC-1..SEC-6; telemetría best-effort.
- [x] 2.5 Ejecutar Vitest y evidencia RED en `reports/2026-07-24-step-3-tdd-red.md`.

## 3. Implementación backend (fase 4a)

- [x] 3.1 `lib/calculator/*` (schema, estimate, rules-repository, calculate-alcance, index).
- [x] 3.2 `app/api/calculadora/route.ts`.
- [x] 3.3 Tests fase 3 en VERDE.

## 4. Implementación frontend (fase 4b)

- [x] 4.1 **Omitida** — sin UI (GTK-64).

## 5. Revisar tests existentes (OBLIGATORIO)

- [x] 5.1 Revisar suites relacionadas (rate-limit, analytics); sin regresiones.

## 6. Tests unitarios + verificación BD (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 6.1 Baseline/diff BD (`db-state-verify`); solo `conversion_events` opcional; restaurar.
- [x] 6.2 Ejecutar Vitest dirigido + suite unitaria razonable.
- [x] 6.3 Informe `reports/2026-07-24-step-6-unit-test-and-db-verification.md`.

## 7. Pruebas manuales con curl (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 7.1 200 por tipología seed, 400 inválido, 422 fuera de rango; sin precio; prefill presente.
- [x] 7.2 Informe `reports/2026-07-24-step-7-curl-endpoint-verification.md`.

## 8. E2E Playwright (N+3)

- [x] 8.1 **Omitido — issue label `Backend`**. E2E: GTK-64.

## 9. Security scan (fase 5b)

- [x] 9.1 Skill `security-scan`; informe `reports/security.md`.

## 10. Code review (fase 6)

- [x] 10.1 Informe `reports/code-review.md` con línea `Veredicto: APTO` o `NO APTO`.

## 11. Docs (fase 7)

- [x] 11.1 Actualizar `backend-standards.md` §5.1 (`POST /api/calculadora`).
- [x] 11.2 Informe `reports/2026-07-24-phase-7-docs.md`.

## 12. Archive (fase 8 — tras Gate 2 humano)

- [x] 12.1 Gate `require-code-review` (APTO en `reports/code-review.md`).
- [x] 12.2 Archive + sync specs vivas (`public-calculadora-api`). Gate 2: `reports/2026-07-24-gate-2.md`.
- [ ] 12.3 Commit y PR: **manual (humano)**.
