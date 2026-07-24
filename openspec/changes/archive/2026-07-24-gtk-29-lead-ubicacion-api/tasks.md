# Tasks — gtk-29-lead-ubicacion-api

> US: [GTK-29](https://linear.app/geoteknia/issue/GTK-29/post-apileadsubicacion-microconversion-enviar-ubicacion-de-la-parcela)
> Rama: `feature/backend-gtk-29-lead-ubicacion`
> Label `Backend`: fase 5a **omite E2E Playwright** (N+3).

## 0. Setup (OBLIGATORIO — primero)

- [x] 0.1 Crear rama `feature/backend-gtk-29-lead-ubicacion` desde `main`.
- [x] 0.2 Verificar rama activa y `git status` (no pisar trabajo no relacionado).
- [x] 0.3 Abrir change OpenSpec `gtk-29-lead-ubicacion-api` con proposal/design/specs/tasks (fase 1 SDD).
- [x] 0.4 **Gate 1 humano:** aprobado 2026-07-24.

## 1. Contrato (fase 2)

- [x] 1.1 Añadir `POST /api/leads/ubicacion` y schemas en `docs/technical/api-spec.yml`.
- [x] 1.2 Congelar `locationLeadSchema` en `lib/leads/schema.ts`.
- [x] 1.3 `reports/2026-07-24-phase-2-contract.md`.

## 2. TDD-RED (fase 3)

- [x] 2.1–2.6 Vitest + `reports/2026-07-24-step-2-tdd-red.md`.

## 3. Implementación backend (fase 4a)

- [x] 3.1–3.4 Refactor DRY + endpoint + VERDE.

## 4. Implementación frontend (fase 4b)

- [x] 4.1 **Omitida** (label Backend).

## 5. Revisar tests existentes (OBLIGATORIO)

- [x] 5.1 Regresión GTK-28 OK.

## 6. Tests unitarios + verificación BD (OBLIGATORIO)

- [x] 6.1–6.3 `reports/2026-07-24-step-N+1-unit-test-and-db-verification.md`.

## 7. Pruebas manuales con curl (OBLIGATORIO)

- [x] 7.1–7.2 Handler + QA; `reports/2026-07-24-step-N+2-curl-endpoint-verification.md`.

## 8. E2E Playwright (N+3)

- [x] 8.1 **Omitido — label Backend**.

## 9. Security scan (fase 5b)

- [x] 9.1 `reports/security.md`.

## 10. Code review (fase 6)

- [x] 10.1 `reports/code-review.md` — **Veredicto: APTO**.

## 11. Docs (fase 7)

- [x] 11.1–11.2 `reports/2026-07-24-phase-7-docs.md`.

## 12. Archive (fase 8 — tras Gate 2 humano)

- [x] 12.1 Gate `require-code-review` (APTO en `reports/code-review.md`).
- [x] 12.2 `openspec validate` + sync specs vivas.
- [x] 12.3 **Gate 2 humano** — `reports/2026-07-24-gate-2.md`.
- [ ] 12.4 Commit y PR: **manual (humano)**.
