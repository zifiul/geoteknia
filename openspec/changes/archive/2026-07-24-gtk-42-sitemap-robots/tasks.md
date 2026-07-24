# Tasks — gtk-42-sitemap-robots

> US: [GTK-42](https://linear.app/geoteknia/issue/GTK-42) — Labels: `Backend`, `Feature` | E2E N+3 **omitido** | Contrato fase 2 **omitido**

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] 0.1 Revisar `docs/GTK-42-sitemap-robots.md`, `app/robots.ts`, `docs/technical/data-model.md`.
- [x] 0.2 Rama `feature/backend-gtk-42-sitemap-robots` desde `main`.
- [x] 0.3 Verificar rama y `git status`.
- [x] 0.4 Confirmar estado de `app/robots.ts` (extender, no recrear).

## 1. SDD + Gate 1 (fase 1)

- [x] 1.1 `proposal.md`, `design.md` (+ threat model), delta spec, `tasks.md`.
- [x] 1.2 `openspec validate gtk-42-sitemap-robots --strict`.
- [x] 1.3 **Gate 1 humano** — OK en `reports/gate-1.md`.

## 2. Contrato Zod (omitido)

- [x] 2.1 **Omitida** — GET públicos sin input; registrar en resumen.

## 3. TDD-RED (fase 3)

- [x] 3.1 Tests `buildSiloUrl` y prioridades.
- [x] 3.2 Tests `sitemap-sources` (mocks Prisma) + SEC imágenes.
- [x] 3.3 Tests XML / robots.
- [x] 3.4 Evidencia en `reports/step-3-tdd-red.md`.

## 4. Implementación (fase 4a; 4b omitida)

- [x] 4.1 `lib/seo/*`, `app/sitemap.ts`, `app/sitemap-imagenes/route.ts`, `app/robots.ts`.
- [x] 4.2 `NEXT_PUBLIC_SITE_URL` en `lib/env.ts` y `.env.example`.
- [x] 4.3 Tests VERDE (`npm test`).

## 5. Paso N: tests existentes

- [x] 5.1 Sin regresiones (302 tests).

## 6. Paso N+1: unitarios + BD

- [x] 6.1 Vitest OK.
- [x] 6.2 Sin escritura BD — verify omitido.
- [x] 6.3 Informe `reports/step-N+1-unit-test-and-db-verification.md`.

## 7. Paso N+2: curl

- [x] 7.1 `reports/step-N+2-curl.md` — `robots.txt` 200; sitemap 500 con `.env` local incompleto (ver informe).

## 8. Paso N+3: E2E (omitido — Backend)

- [x] 8.1 **Omitido** — label `Backend`.

## 9. Fase 5b: security-scan

- [x] 9.1 `reports/security.md`.

## 10. Fase 6: code-review

- [x] 10.1 `reports/code-review.md` — **Veredicto: APTO**.

## 11. Fase 7: docs

- [x] 11.1 `backend-standards.md` / `frontend-standards.md` — `buildSiloUrl`.
- [x] 11.2 Sync spec viva `openspec/specs/dynamic-sitemap-robots/spec.md`.

## 12. Gate 2, verify y archive

- [x] 12.1 OK humano Gate 2 (`reports/gate-2.md`).
- [x] 12.2 Code-review APTO verificado; change archivado.
- [x] 12.3 Archive → `openspec/changes/archive/2026-07-24-gtk-42-sitemap-robots/`.
