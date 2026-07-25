# Design — gtk-48-home

## Enfoque técnico

- **Página:** `app/(public)/page.tsx` — RSC, `export const revalidate = 3600`, datos vía `unstable_cache` con tags `SITEMAP_CACHE_TAG` + `ORGANIZATION_PROFILE_CACHE_TAG`.
- **UI:** organismos en `components/organisms/home/` siguiendo tokens `brand-*` y layout Stitch (hero oscuro, acento `#C45A11`, contenedor `max-w-[1200px]`, secciones `py-section`).
- **Datos:** `listPublishedServices`, `listRecentPublishedCaseStudies(take)`, `listActiveAccreditations` (publicado + `deletedAt: null`; acreditaciones sin campo `is_active` en Prisma — equivalente editorial publicado). `listPublishedGeoZones` (take 1) para CTA P2.
- **JSON-LD:** helper `buildHomeLocalBusinessSchema` en `lib/home/local-business-schema.ts` que compone perfil + servicios + `env.NEXT_PUBLIC_SITE_URL`.
- **Hero LCP:** `next/image` con `priority` cuando exista `heroImage` del primer servicio pilar publicado; si no, hero solo tipográfico (sin imagen ficticia).
- **Personas:** P1 → primer servicio pilar o `/servicios`; P2 → primera zona publicada o `/zonas`; P3 → `/acreditaciones`.
- **Revalidación:** `revalidatePublishedContent` añade `revalidatePath('/')` para service, geo_zone, case_study, accreditation.

## Decisiones de negocio documentadas

| Tema | Decisión |
|------|----------|
| aggregateRating | Omitir hasta tener `reviewCount` verificable (solo `aggregate_rating` decimal en BD). |
| Casos destacados | Últimos N publicados por `projectYear` desc, `updatedAt` desc (sin migración `is_featured`). |
| Acreditaciones activas | `workflowStatus: publicado` (no existe `is_active` en modelo). |

## Threat model (GTK-48)

### Superficie

- Página pública read-only; sin formularios propios; enlaces a silos y `tel:`/`mailto:`/`wa.me`.
- JSON-LD y metadata derivados de BD (riesgo de XSS en salida si CMS comprometido).

### Actores

- Visitante anónimo, crawler, atacante con contenido CMS malicioso (editor comprometido).

### Datos sensibles

- NAP organización (público por diseño). Sin PII de usuarios en home.

### Requisitos de seguridad (criterios)

- **SEC-H1:** Escapar JSON-LD vía `escapeJsonLdScriptContent` (GTK-45); no interpolar HTML crudo de CMS en `dangerouslySetInnerHTML`.
- **SEC-H2:** Lecturas públicas solo `workflowStatus: publicado` y `deletedAt: null` — no exponer borradores.
- **SEC-H3:** CTAs de conversión solo eventos del enum Zod; navegación interna sin ampliar contrato `/api/eventos`.
- **SEC-H4:** URLs de media resueltas con `resolveMediaFileUrl` y dominio permitido en `next.config`.
- **SEC-H5:** Sin secretos en componentes cliente; `server-only` en capa de contenido.
