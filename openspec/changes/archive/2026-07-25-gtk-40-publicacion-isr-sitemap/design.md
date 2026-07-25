# Design — gtk-40-publicacion-isr-sitemap

## Context

GTK-39 implementa el grafo editorial y Server Actions de transición sin efecto en el frontal. GTK-42 dejó `SITEMAP_CACHE_TAG`, `buildSiloPath` y sitemap cacheado por tag. Faltan `lib/content/publish.ts`, revalidación post-commit, cron de `scheduled_publish_at` y ampliaciones en workflow/auditoría. El middleware exige sesión en `/api/admin/*`, por lo que el cron debe vivir en `/api/cron/*`. No existe aún `app/(public)/`; la revalidación es correcta pero la verificación E2E de 200 queda pendiente.

## Goals / Non-Goals

**Goals:**

- Cerrar el ciclo `aprobado → publicado` con `published_at`, revisión forzada, auditoría y revalidación ISR + sitemap.
- Despublicación con traza y exclusión del sitemap.
- Cron idempotente y resistente a fallos por ítem.
- Ampliar tipos publicables (`team_member`, `machinery`, `faq_group`) alineados con el sitemap.

**Non-Goals:**

- UI admin de publicar/despublicar.
- Páginas públicas del silo.
- E2E Playwright en este ticket (label `Backend`).
- Modificar `app/sitemap.ts` (GTK-42).

## Decisions

### D1 — Ubicación del cron (Hallazgo 1)

**Decisión:** `app/api/cron/publicar-programados/route.ts`, autenticación `Authorization: Bearer CRON_SECRET`, comparación `timingSafeEqual`.

**Alternativa descartada:** `/api/admin/cron/...` — bloqueado por middleware sin cookie de sesión.

### D2 — `published_at` al despublicar (Hallazgo 2)

**Decisión:** conservar `published_at` como histórico; el sitemap filtra por `workflow_status`.

### D3 — `schema_type` (Hallazgo 3)

**Decisión:** validar coherencia tipo↔enum al publicar; no reasignar (NOT NULL desde CRUD).

### D4 — Revisión en publish/unpublish (Hallazgo 4)

**Decisión:** `forceRevision: true` en `applyEditorialTransition` para traza YMYL del snapshot publicado.

### D5 — Whitelist auditoría (Hallazgo 5)

**Decisión:** añadir `previousStatus`, `workflowStatus`, `event` a `content_update`.

### D6 — Tipos editoriales (Hallazgo 7)

**Decisión:** registrar `team_member`, `machinery`, `faq_group` en el registro editorial publicable.

### D7 — Paths de revalidación (Hallazgos 8–10)

**Decisión:** solo rutas relativas vía `buildSiloPath`; cargar joins de slugs en `publish.ts`/`revalidate.ts`; `faq` revalida página contenedora (`faq_group` / servicio asociado).

### D8 — Orden transacción vs caché (Hallazgo 12)

**Decisión:** `db.$transaction` (estado + revisión + audit) → luego `revalidatePublishedContent` best-effort.

### D9 — Server Action vs Route Handler

**Decisión:** publicar/despublicar = Server Actions (GTK-41); cron = Route Handler único documentado en `api-spec.yml`.

## Risks / Trade-offs

- **[Riesgo]** Revalidación falla pero BD publicada → **Mitigación:** best-effort + log/Sentry; ISR 1h de respaldo.
- **[Riesgo]** Cron expuesto sin secreto fuerte → **Mitigación:** `CRON_SECRET` ≥32, 401 genérico, sin filtrar detalles.
- **[Riesgo]** Escalada vía cron si secreto filtra → **Mitigación:** secreto solo en Vercel env, nunca en repo/logs.
- **[Riesgo]** `buildSiloPath` sin slugs → **Mitigación:** tests unitarios para `service_zone_page` y `blog_post`.

## Migration Plan

1. Desplegar con `CRON_SECRET` en Vercel antes de activar entrada en `vercel.json`.
2. Sin migración Prisma.
3. Rollback: desactivar cron en `vercel.json`; publicaciones manuales siguen vía Server Actions.

## Open Questions

- Ninguna bloqueante tras decisiones D1–D8 (alineadas con Linear GTK-40).

## Threat model

### Superficie de ataque

- Server Actions publicar/despublicar (`/admin` contenido).
- Route Handler `POST /api/cron/publicar-programados` (sin sesión, secreto en cabecera).
- Efectos `revalidatePath` / `revalidateTag` (abuso limitado a invalidación de caché, no lectura de datos).

### Actores

- Anónimo (solo cron si obtiene secreto).
- `editor` / `tecnico` sin `content.publish`.
- `gestor` / `admin` con `content.publish`.
- Vercel Cron (actor de confianza con secreto).

### Datos sensibles implicados

- Contenido editorial SEO (no PII de leads). Metadatos de auditoría sin cuerpo editorial.
- `CRON_SECRET` — credencial de infraestructura; no persistir en logs.

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Publicar sin permiso | Server Action | Alto (YMYL en web) | RBAC `content.publish` + tests 403 |
| T2 | Invocar cron sin secreto | HTTP | Alto (publicación masiva) | Bearer + timing-safe; 401 |
| T3 | Fuga de `CRON_SECRET` | logs/respuestas | Alto | No loguear; mensajes genéricos |
| T4 | Publicar contenido schema incoherente | datos corruptos | Medio SEO | Validación pre-transición |
| T5 | DoS por revalidación | muchas publicaciones | Bajo | Revalidación puntual por path |
| T6 | Metadata audit descartada | unpublish sin traza | Medio compliance | Whitelist ampliada + test |

**Descartadas:** Turnstile en cron (no formulario público); IDOR en publish — mismo patrón GTK-41 con UUID + permiso.

### Requisitos de seguridad (criterios de aceptación verificables)

- [ ] SEC-1: Server Action publicar sin `content.publish` → envelope 403 sin escritura BD.
- [ ] SEC-2: `POST /api/cron/publicar-programados` sin Bearer válido → 401 sin publicar.
- [ ] SEC-3: Comparación de `CRON_SECRET` en tiempo constante (no early return por primer byte).
- [ ] SEC-4: Respuestas de error del cron no incluyen el secreto ni stack en producción.
- [ ] SEC-5: `audit_logs` de unpublish persisten `event` y estados en metadata saneada.
- [ ] SEC-6: Publicar desde estado ≠ `aprobado` → 409 sin mutación (abuse case escalada editorial).
