# Proposal — gtk-40-publicacion-isr-sitemap

> US: [GTK-40 — Publicación de contenido al frontal con ISR on-demand y actualización de sitemap](https://linear.app/geoteknia/issue/GTK-40/publicacion-de-contenido-al-frontal-con-isr-on-demand-y-actualizacion)
> Labels: `Backend`, `Feature` | Dependencias: GTK-39 ✅, GTK-42 ✅, GTK-41 ✅, GTK-25 ✅, GTK-22 ✅ | E2E N+3 **omitido** (label `Backend`)

## Why

GTK-39 deja el contenido en `aprobado` y permite transiciones a `publicado`/`despublicado` sin efecto en el frontal: no fija `published_at`, no revalida ISR ni invalida el sitemap. Sin este cierre no se puede escalar la producción de silos servicio × zona sin redeploy. Materializa RF-21 y US-18 (URL en el silo correcto, sitemap actualizado, `/admin` no indexable).

## What Changes

- **`lib/content/publish.ts`:** orquestación `publishContent` / `unpublishContent` (validación `schema_type`, transición vía GTK-39 con `forceRevision`, revalidación post-commit).
- **`lib/content/revalidate.ts`:** `revalidatePath` del silo (`buildSiloPath` con slugs relacionados) + `revalidateTag(SITEMAP_CACHE_TAG)`; mapeo especial para `faq`.
- **Server Actions** publicar/despublicar en `app/(admin)/contenido/[type]/[id]/` — `content.publish`, patrón GTK-41.
- **Cron** `app/api/cron/publicar-programados/route.ts` (fuera de `/api/admin`), `CRON_SECRET`, `vercel.json`.
- **Ajustes transversales:** `workflow-registry` (`publishedAt` en `publicado`), `workflow.ts` (`forceRevision`), `audit/sanitize.ts` (whitelist `content_update`), `lib/env.ts` (`CRON_SECRET`).
- **Alcance editorial (Hallazgo 7):** ampliar registro para `team_member`, `machinery`, `faq_group` publicables.
- **Tests:** Vitest + BD + abuse cases; **curl** cron y sitemap; **E2E omitido** (Backend; sitemap parcialmente verificable vía curl).

## Capabilities

### New Capabilities

- `content-publication-isr`: efecto de publicación/despublicación, ISR on-demand, cron de publicación programada, integración sitemap.

### Modified Capabilities

- `editorial-workflow`: `forceRevision` en publish/unpublish; `publishedAt` al pasar a `publicado`; tipos editoriales ampliados.
- `dynamic-sitemap-robots`: cumplimiento de revalidación on-demand al publicar/despublicar (consumo de `SITEMAP_CACHE_TAG`).
- `audit-log-service`: metadata permitida en `content_update` (`event`, `previousStatus`, `workflowStatus`).
- `env-validation`: variable `CRON_SECRET` obligatoria en entornos que ejecuten cron.

## Impact

- **Código:** `lib/content/publish.ts`, `revalidate.ts`, cron route, Server Actions, `workflow-registry.ts`, `workflow.ts`, `audit/sanitize.ts`, `lib/env.ts`, `vercel.json`, tests en `tests/unit/content/**`, `tests/qa/gtk-40-db.qa.test.ts`.
- **BD:** escritura `published_at`, `content_revisions` forzadas en publish/unpublish, `audit_logs`; sin migración.
- **API:** nuevo Route Handler cron (documentar en `api-spec.yml`); Server Actions sin nuevo path HTTP admin.
- **SEO/ISR:** revalidación puntual por silo + tag sitemap; publicación sin redeploy.
- **Seguridad:** RBAC `content.publish`; cron por secreto en cabecera (timing-safe), fuera del matcher de sesión del middleware.

## Fuera de alcance

- UI admin de botones publicar/despublicar (US frontend).
- Páginas públicas `app/(public)/` (revalidación implementada; verificación 200 E2E pendiente — Hallazgo 14).
- E2E Playwright en este ticket (label `Backend`).
- Cambios en `app/sitemap.ts` / `sitemap-config.ts` (GTK-42 ya exporta el tag).
- Re-publicación desde `despublicado` (sin cambio de grafo).
