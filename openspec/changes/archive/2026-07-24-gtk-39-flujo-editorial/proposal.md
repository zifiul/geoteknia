# Proposal — gtk-39-flujo-editorial

> US: [GTK-39 — Flujo editorial humano-en-el-bucle (revisión, aprobación, versionado)](https://linear.app/geoteknia/issue/GTK-39/flujo-editorial-humano-en-el-bucle-revision-aprobacion-versionado)
> Labels: `Backend`, `Feature` | Dependencias: GTK-25 ✅, GTK-22 ✅, GTK-38 ✅, GTK-41 ✅ | Frontera: GTK-40 (ISR/`published_at`)

## Why

El contenido geotécnico es YMYL: ninguna salida de IA puede publicarse sin revisión humana. GTK-38 genera borradores; falta la máquina de estados editorial, trazabilidad de aprobación y versionado en `content_revisions` antes de que GTK-40 publique al frontal. Materializa RF-20 y US-17.

## What Changes

- **`lib/content/workflow.ts`:** grafo único de transiciones (`assertTransition`), mapa transición → permiso RBAC → acción de auditoría, registro polimórfico `content_type` → delegados por entidad EDITORIAL.
- **`lib/content/revisions.ts`:** `createRevision` (snapshots body/SEO, `version_number`, `current_version`) solo cuando el cuerpo cambia; enlace opcional `ai_generation_id`.
- **Server Actions** en `app/(admin)/contenido/[type]/[id]/actions.ts`: `submitForReview`, `approveContent`, `rejectContent`, `transitionToPublish`, `unpublishContent`, `regenerateToDraft` — patrón GTK-41 (`withPermission`, `runContentAction`, `ContentActionResult`).
- **Auditoría:** `approve`/`reject`/`publish` (mustAudit); `content_update` para submit, unpublish y regenerar.
- **YMYL:** flag `requiresTechnicalVerification` en el envelope de acción cuando aplique.
- **Sin** nuevos permisos RBAC (`content.update` para revisar/aprobar/rechazar; `content.publish` para publicar/despublicar).
- **Sin** `published_at`, revalidación ISR ni efecto de publicación (GTK-40).
- **Tests:** Vitest (dominio + RBAC + auditoría) + verificación BD; **E2E N+3 omitido** (label `Backend`); **curl N+2 omitido** (sin Route Handlers nuevos).
- **Docs:** `backend-standards.md` (grafo compartido con GTK-40).

## Capabilities

### New Capabilities

- `editorial-workflow`: máquina de estados, Server Actions de transición, versionado `content_revisions`, RBAC y auditoría del flujo editorial.

### Modified Capabilities

- (ninguna — el CRUD en `admin-content-crud` ya prohíbe `aprobado`/`publicado` vía schemas; este change añade el camino sancionado sin modificar requisitos CRUD existentes)

## Impact

- **Código:** `lib/content/workflow.ts`, `lib/content/revisions.ts`, `lib/content/index.ts`, `app/(admin)/contenido/[type]/[id]/actions.ts`, schemas Zod de entrada de transición, tests en `tests/unit/content/**`, `tests/qa/gtk-39-db.qa.test.ts`.
- **BD:** escritura en tablas editoriales (estado, `reviewed_by_id`, `approved_by_id`, `approved_at`, `current_version`), `content_revisions`, `audit_logs` (sin migración).
- **API:** sin endpoints HTTP nuevos; contrato = schemas Zod de Server Actions (fase 2).
- **Seguridad / RGPD:** RBAC estricto; sin PII en logs; transacción atómica transición + revisión + auditoría mustAudit.
- **SEO/ISR:** no publica; GTK-40 consumirá el mismo grafo.

## Fuera de alcance

- UI del editor admin (US frontend posterior).
- `published_at`, sitemap, JSON-LD en frontal, `revalidatePath`/`revalidateTag` (GTK-40).
- Nuevo permiso `content.approve` o separación de funciones 4-eyes.
- Re-publicación desde `despublicado` (decisión de negocio abierta; grafo deja salidas vacías).
- Rate limiting dedicado (GTK-26 opcional).
- E2E Playwright en este ticket (label `Backend`).
