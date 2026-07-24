# Proposal — gtk-41-crud-contenido

> US: [GTK-41 — CRUD de contenido publicable y maestros](https://linear.app/geoteknia/issue/GTK-41/crud-de-contenido-publicable-y-maestros-servicios-zonas-casos-blog)
> Labels: `Backend`, `Feature` | Dependencias: GTK-25 (RBAC, ✅), GTK-22 (audit, ✅), modelos Prisma de contenido (✅) | Relacionados: GTK-39 (flujo editorial), GTK-40 (publicación ISR) — **fuera de alcance de publicación**
> Entrega incremental en olas **41a→41e** (mismo change OpenSpec; commits/reviews por ola recomendados).

## Why

Los modelos de contenido y maestros ya existen en BD, pero `lib/content/` está vacío salvo seeds y no hay mutaciones en `/admin`. Sin CRUD validado (Zod SEO/EDITORIAL, slugs, M:N, soft delete y auditoría) no pueden operar GTK-39 (revisión humana) ni GTK-40 (publicación al frontal). Materializa RF-01, RF-03–RF-09, RF-11, RF-12, RF-16 y RF-Q1.

## What Changes

- **Ola 41a — Fundamentos:** `lib/content/slug.ts`, `errors.ts`, `schemas/seo.ts`, `schemas/editorial.ts`, patrón de resultado de acción, helper de auditoría de contenido; `MEDIA_STORAGE_BASE_URL` en `lib/env.ts`; migración `AuditAction` += `content_update` (mustAudit) + whitelist en `lib/audit/*`.
- **Olas 41b–41e — Dominio + Server Actions** bajo `app/(admin)/contenido/**` y `lib/content/<entidad>.ts` para las 14 entidades / silos del ticket (servicios, geo-zonas, intersección, casos, blog, FAQs, equipo, maquinaria, acreditaciones, lead magnets, media, calculator rules, organization profile, contact channels).
- **Reglas transversales:** crear en `borrador_ia` con `is_ai_assisted=false` si origen manual; **nunca** `workflow_status=publicado` desde CRUD; slug único por tabla → 409; soft delete; RBAC `content.*`; singletons de config solo `admin`; `tecnico` → 403.
- **Tests:** Vitest (dominio, validación, RBAC, abuse cases); verificación BD por ola; **sin E2E** (label `Backend` — UI/E2E en US frontend futura).
- **Sin** Route Handlers HTTP nuevos (mutaciones vía Server Actions; contrato = schemas Zod compartidos).

## Capabilities

### New Capabilities

- `admin-content-crud`: escritura CMS en `/admin` para entidades publicables y maestros con validación SEO/EDITORIAL, integridad M:N y auditoría.

### Modified Capabilities

- (ninguna — capability nueva)

## Impact

- **Código:** `lib/content/**`, `app/(admin)/contenido/**`, `lib/env.ts`, `lib/audit/*`, tests en `tests/unit/content/**`.
- **BD:** migración enum `AuditAction`; escritura en tablas de contenido existentes y tablas puente M:N.
- **API:** sin cambios en `api-spec.yml` salvo nota documental opcional de Server Actions internas (fase 2 omitida si no hay Route Handlers).
- **SEO/ISR:** base de validación SEO; publicación y revalidación quedan en GTK-40.
- **RGPD:** sin PII nueva; contenido editorial en EU; soft delete; sin cuerpos en logs ni metadata de auditoría sin whitelist.

## Fuera de alcance

- Publicación al frontal, ISR/revalidate y transiciones editoriales avanzadas (GTK-39/GTK-40).
- UI de formularios/listados en `/admin` (ticket Frontend futuro; este change expone dominio + Server Actions).
- Subida de binarios a object storage (solo registro de `file_url` / referencia; URL base vía `MEDIA_STORAGE_BASE_URL`).
- Nuevo permiso `config.*` (MVP: rol `admin` explícito para singletons).
- E2E Playwright en este ticket (label `Backend`).
