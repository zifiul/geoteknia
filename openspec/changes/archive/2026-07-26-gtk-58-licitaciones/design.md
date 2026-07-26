# Design — gtk-58-licitaciones

## Enfoque

- **Datos (opción A):** lectores Prisma en `lib/content/tenders.ts` — `deletedAt: null`, orden por `order`/`organismName`. Casos relacionados: join `relatedCase` filtrando `PUBLISHED_EDITORIAL_WHERE` en aplicación (omitir enlace si no publicado). Seed idempotente en `prisma/seed.ts` desde `lib/content/tenders-seed-data.ts` (sin CRUD admin en este change).
- **Formulario:** `TenderForm` client component; validación en blur/campo y en submit con `tenderLeadSchema`; widget Turnstile (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`) vía `TurnstileWidget`; fetch a `/api/leads/licitacion`; UTM/`landingUrl`/`gaClientId` desde helpers de atribución si existen en el proyecto.
- **SEO:** `lib/tenders/page-config.ts` metadata estática; breadcrumbs manuales (patrón GTK-57/GTK-50).
- **UI (Stitch):** hero «Obra pública» / H1 licitaciones y subcontratación geotécnica; bloque clasificación CPV/grupos; tabla experiencia organismos; grid proyectos públicos; formulario en tarjeta lateral/stack móvil; CTA acreditaciones; paleta y tipografía del design system público.

## Threat model (GTK-58)

| Área | Riesgo | Mitigación |
|------|--------|------------|
| XSS | Textos de seed/CMS en tablas | React escape; sin `dangerouslySetInnerHTML` |
| PII | Datos de contacto en formulario | Solo POST al endpoint existente; sin logs cliente; sin PII en dataLayer |
| Spam | Abuso del formulario | Turnstile server-side (GTK-31); rate limit en API |
| CSRF | POST público | JSON + Turnstile; same-origin fetch |
| Open redirect | `plataformaUrl` | Validación URL Zod en schema compartido |
| Integridad | Divergencia cliente/servidor | Mismo `tenderLeadSchema` |
| Enumeración | Thank-you ref | Patrón GTK-63 existente |

Requisitos SEC como criterios de aceptación: payload fuera de schema → 400; Turnstile inválido → 403; sin filas BD en abuso (heredado GTK-31).

## Decisiones

- **GTK-59:** enlace a `/acreditaciones` sin bloquear este ticket; corregir relación Linear GTK-58↔GTK-59 en comentario de archive.
- **URL API:** `POST /api/leads/licitacion` (no `/api/licitaciones`).
- `revalidate = 3600` alineado con otros listados públicos.
- Provincias: campo opcional texto/slug según select si hay listado público de provincias; si no, input texto acotado (max 200).

## Integración

- Reutilizar `FormField`, tokens `brand-*`, patrones de hero de `/maquinaria`.
- Tests unitarios con mock de Prisma (patrón GTK-57).
