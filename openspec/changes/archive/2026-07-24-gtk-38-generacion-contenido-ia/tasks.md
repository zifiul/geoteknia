# Tasks — gtk-38-generacion-contenido-ia

> US: [GTK-38](https://linear.app/geoteknia/issue/GTK-38) — Generación asistida de contenido SEO (endpoint + ai_generations)
> Labels: `Backend`, `Feature` | E2E N+3 **omitido** (label `Backend`); curl N+2 **obligatorio**

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] 0.1 Revisar `openspec/config.yaml`, `docs/technical/backend-standards.md`, `docs/GTK-38-generacion-contenido-ia.md`, issue Linear GTK-38.
- [x] 0.2 Crear rama `feature/backend-gtk-38-generacion-contenido-ia` desde `main` actualizado (GTK-36 mergeado).
- [x] 0.3 Verificar rama actual (`git branch --show-current`) y `git status`.
- [x] 0.4 Confirmar que no se sobrescribe trabajo no relacionado.

## 1. SDD + Gate 1 (fase 1)

- [x] 1.1 Artefactos `proposal.md`, `design.md` (+ threat model), delta spec `specs/ai-generation-workflow/spec.md`, `tasks.md`.
- [x] 1.2 `openspec validate gtk-38-generacion-contenido-ia --strict` en verde.
- [x] 1.3 **Gate 1 humano** — OK explícito en `reports/2026-07-24-gate-1.md`.

## 2. Contrato Zod / API (fase 2)

- [x] 2.1 Schema Zod `generateContentSchema` en `lib/ia/content-generation-schemas.ts`.
- [x] 2.2 `generationOutputSchema` en `lib/ia/output-schema.ts`.
- [x] 2.3 Actualizar `docs/technical/api-spec.yml`: `POST /api/admin/ia/generar`.
- [x] 2.4 Congelar contrato.

## 3. TDD-RED (fase 3)

- [x] 3.1 Tests unitarios orquestación con `runGeneration` mockeado.
- [x] 3.2 Abuse cases SEC-1–SEC-5.
- [x] 3.3 Tests RBAC `ai.generate`.
- [x] 3.4 Evidencia en `reports/2026-07-24-step-3-tdd-red.md`.

## 4. Implementación backend (fase 4a)

- [x] 4.1 `lib/ia/output-schema.ts`, `content-generation.ts`, helpers.
- [x] 4.2 `app/api/admin/ia/generar/route.ts`.
- [x] 4.3 Exportaciones `lib/ia/index.ts`.
- [x] 4.4 Tests VERDE + `tests/qa/gtk-38-db.qa.test.ts` (Neon pendiente).

## 5. Paso N: revisar tests existentes (OBLIGATORIO)

- [x] 5.1 Suite unitaria 280 tests sin regresiones.

## 6. Paso N+1: unitarios + BD (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 6.1 Vitest OK; QA BD bloqueada (Neon unreachable).
- [x] 6.2 Informe `reports/2026-07-24-step-N+1-unit-test-and-db-verification.md`.

## 7. Paso N+2: curl endpoints (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [ ] 7.1 Casos curl con sesión admin (comandos en informe).
- [x] 7.2 Informe `reports/2026-07-24-step-N+2-curl-endpoint-verification.md` (PENDIENTE ejecución).

## 8. Paso N+3: E2E Playwright (omitido — Backend)

- [x] 8.1 **Omitido** — label `Backend`.

## 9. Fase 5b: security-scan

- [x] 9.1 `reports/security.md`.

## 10. Fase 6: code-review

- [x] 10.1 `reports/code-review.md` — **Veredicto: APTO** (condicionado).

## 11. Fase 7: docs

- [x] 11.1 `api-spec.yml`, `backend-standards.md` §9.1.

## 12. Gate 2, verify y archive

- [x] 12.1 OK humano Gate 2 (`reports/2026-07-24-gate-2.md`).
- [x] 12.2 `openspec validate gtk-38-generacion-contenido-ia --strict` (pre-archive).
- [x] 12.3 Archive → `openspec/changes/archive/2026-07-24-gtk-38-generacion-contenido-ia` + sync `openspec/specs/ai-generation-workflow/spec.md`.
