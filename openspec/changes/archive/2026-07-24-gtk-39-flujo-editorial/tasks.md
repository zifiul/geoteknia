# Tasks — gtk-39-flujo-editorial

> US: [GTK-39](https://linear.app/geoteknia/issue/GTK-39) — Flujo editorial humano-en-el-bucle
> Labels: `Backend`, `Feature` | E2E N+3 **omitido** | curl N+2 **omitido** (sin Route Handlers)

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] 0.1 Revisar `openspec/config.yaml`, `docs/technical/backend-standards.md`, `docs/technical/data-model.md`, issue Linear GTK-39.
- [x] 0.2 Crear rama `feature/backend-gtk-39-flujo-editorial` desde `main` actualizado.
- [x] 0.3 Verificar rama actual (`git branch --show-current`) y `git status`.
- [x] 0.4 Confirmar que no se sobrescribe trabajo no relacionado.

## 1. SDD + Gate 1 (fase 1)

- [x] 1.1 Artefactos `proposal.md`, `design.md` (+ threat model), delta spec `specs/editorial-workflow/spec.md`, `tasks.md`.
- [x] 1.2 `openspec validate gtk-39-flujo-editorial --strict` en verde.
- [x] 1.3 **Gate 1 humano** — OK explícito en `reports/2026-07-24-gate-1.md`.

## 2. Contrato Zod (fase 2 — Server Actions, sin api-spec HTTP)

- [x] 2.1 Schemas Zod en `lib/content/schemas/workflow.ts` (`contentType`, `id`, transición, nota opcional).
- [x] 2.2 Extender tipos de `ContentActionResult` para `requiresTechnicalVerification` / payload de éxito.
- [x] 2.3 Documentar contrato en `backend-standards.md` (Server Actions workflow); **no** nuevo path en `api-spec.yml` salvo nota cross-ref si aplica.
- [x] 2.4 Congelar contrato.

## 3. TDD-RED (fase 3)

- [x] 3.1 Tests `assertTransition` (feliz + 409).
- [x] 3.2 Tests `createRevision` (incremento versión; sin revisión en approve).
- [x] 3.3 Abuse cases SEC-1–SEC-6 (RBAC, saltos, validación, auditoría).
- [x] 3.4 Tests Server Actions con mocks Prisma / integración ligera.
- [x] 3.5 Evidencia en `reports/2026-07-24-step-3-tdd-red.md` (RED verificado).

## 4. Implementación backend (fase 4a)

- [x] 4.1 `lib/content/workflow.ts` (grafo, registro polimórfico, `applyWorkflowTransition`).
- [x] 4.2 `lib/content/revisions.ts` (`createRevision`).
- [x] 4.3 `app/(admin)/contenido/[type]/[id]/actions.ts`.
- [x] 4.4 Exportaciones `lib/content/index.ts`.
- [x] 4.5 Tests VERDE + `tests/qa/gtk-39-db.qa.test.ts`.

## 5. Paso N: revisar tests existentes (OBLIGATORIO)

- [x] 5.1 Suite unitaria sin regresiones en módulos `lib/content` y auth.

## 6. Paso N+1: unitarios + BD (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 6.1 Vitest dirigido + suite acordada en `package.json`.
- [x] 6.2 `db-state-verify`: línea base, post-test, restauración (QA bloqueada si Neon unreachable).
- [x] 6.3 Informe `reports/2026-07-24-step-N+1-unit-test-and-db-verification.md`.

## 7. Paso N+2: curl endpoints (omitido)

- [x] 7.1 **Omitido** — sin Route Handlers nuevos; registrar en informe N+1 o nota en tasks.

## 8. Paso N+3: E2E Playwright (omitido — Backend)

- [x] 8.1 **Omitido** — label `Backend`; E2E cubrirá US frontend integrada.

## 9. Fase 5b: security-scan

- [x] 9.1 `reports/security.md` (SAST diff, SCA, gitleaks; DAST omitido sin HTTP nuevo).

## 10. Fase 6: code-review

- [x] 10.1 `reports/code-review.md` — **Veredicto: APTO**.

## 11. Fase 7: docs

- [x] 11.1 `backend-standards.md`: grafo editorial fuente única + registro polimórfico.
- [x] 11.2 Coherencia con `data-model.md` § revisiones (sin duplicar).
- [x] 11.3 Spec viva `openspec/specs/editorial-workflow/spec.md` sincronizada.

## 12. Gate 2, verify y archive

- [x] 12.1 OK humano Gate 2 (`reports/2026-07-24-gate-2.md`).
- [x] 12.2 `openspec validate gtk-39-flujo-editorial --strict` pre-archive.
- [x] 12.3 Archive + sync `openspec/specs/editorial-workflow/spec.md`.
