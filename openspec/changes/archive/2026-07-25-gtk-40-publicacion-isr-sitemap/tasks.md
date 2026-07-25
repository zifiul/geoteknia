# Tasks — gtk-40-publicacion-isr-sitemap

> US: [GTK-40](https://linear.app/geoteknia/issue/GTK-40/publicacion-de-contenido-al-frontal-con-isr-on-demand-y-actualizacion)
> Labels: `Backend`, `Feature` | E2E N+3 **omitido** | curl N+2 **obligatorio** (cron + sitemap)

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] 0.1 Revisar `openspec/config.yaml`, `backend-standards.md`, `data-model.md`, issue Linear GTK-40.
- [x] 0.2 Crear rama `feature/backend-gtk-40-publicacion-isr` desde `main`.
- [x] 0.3 Verificar rama actual y `git status`.
- [x] 0.4 Confirmar que no se sobrescribe trabajo no relacionado.

## 1. SDD + Gate 1 (fase 1)

- [x] 1.1 Artefactos `proposal.md`, `design.md` (+ threat model), delta specs, `tasks.md`.
- [x] 1.2 `openspec validate gtk-40-publicacion-isr-sitemap --strict` en verde.
- [x] 1.3 **Gate 1 humano** — OK explícito en `reports/2026-07-25-gate-1.md`.

## 2. Contrato Zod + api-spec (fase 2)

- [x] 2.1 Schemas Zod: entrada publish/unpublish (`contentType`, `id`); cron sin body o resumen tipado.
- [x] 2.2 Documentar `POST /api/cron/publicar-programados` en `docs/technical/api-spec.yml` (auth Bearer, 401/200, sin PII).
- [x] 2.3 `CRON_SECRET` en schema `lib/env.ts` (contrato congelado con env-validation).
- [x] 2.4 Congelar contrato.

## 3. TDD-RED (fase 3)

- [x] 3.1 Tests `publishContent` / `unpublishContent` (feliz, 409, `published_at`, revisión forzada).
- [x] 3.2 Tests revalidación (spy `revalidatePath`/`revalidateTag`, slugs `service_zone_page`, `blog_post`, `faq`).
- [x] 3.3 Tests cron (401, lote idempotente, fallo aislado) — parcial vía `verifyBearerSecret`; route E2E pendiente curl.
- [x] 3.4 Abuse cases SEC-1–SEC-6.
- [x] 3.5 Evidencia `reports/2026-07-25-step-3-tdd-red.md` (RED verificado).

## 4. Implementación backend (fase 4a)

- [x] 4.1 `lib/content/publish.ts`, `lib/content/revalidate.ts`.
- [x] 4.2 `workflow-registry.ts` (`publishedAt`, selects/joins), `workflow.ts` (`forceRevision`).
- [x] 4.3 `lib/audit/sanitize.ts` whitelist.
- [x] 4.4 Server Actions publicar/despublicar.
- [x] 4.5 `app/api/cron/publicar-programados/route.ts`, `vercel.json`.
- [x] 4.6 Registro editorial ampliado (`team_member`, `machinery`; `faq_group` sin bloque EDITORIAL en Prisma — omitido).
- [x] 4.7 Tests VERDE + `tests/qa/gtk-40-db.qa.test.ts` (creado; BD bloqueada).

## 5. Paso N: revisar tests existentes (OBLIGATORIO)

- [x] 5.1 Ajustar tests GTK-39/workflow si `forceRevision` o whitelist afectan expectativas.

## 6. Paso N+1: unitarios + BD (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 6.1 Vitest dirigido `tests/unit/content/**` + suite acordada.
- [ ] 6.2 `db-state-verify`: línea base, post-test, restauración (Neon unreachable).
- [x] 6.3 Informe `reports/2026-07-25-step-N+1-unit-test-and-db-verification.md`.

## 7. Paso N+2: curl endpoints (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [ ] 7.1 Cron sin secreto y con secreto válido (401 / 200 resumen).
- [ ] 7.2 Publicar/despublicar vía acción o script de test; verificar `/sitemap.xml` refleja cambio.
- [x] 7.3 Informe `reports/2026-07-25-step-N+2-curl-endpoint-verification.md` (comandos documentados).

## 8. Paso N+3: E2E Playwright (omitido — Backend)

- [x] 8.1 **Omitido** — label `Backend`; documentar en informe N+2. Verificación sitemap vía curl.

## 9. Fase 5b: security-scan

- [x] 9.1 `reports/security.md` (SAST, SCA, gitleaks, DAST ligero contra cron).

## 10. Fase 6: code-review

- [x] 10.1 `reports/code-review.md` — **Veredicto: APTO** (condicionado a curl/BD).

## 11. Fase 7: docs

- [x] 11.1 `api-spec.yml`, `.env.example` (CRON_SECRET).
- [x] 11.2 Sync specs vivas tras archive.

## 12. Gate 2, verify y archive

- [x] 12.1 OK humano Gate 2 (`reports/2026-07-25-gate-2.md`).
- [x] 12.2 Specs vivas sincronizadas en `openspec/specs/`.
- [x] 12.3 Archive → `openspec/changes/archive/2026-07-25-gtk-40-publicacion-isr-sitemap/`.
