# Design — gtk-61-recursos-lead-magnets

## Enfoque

- **Datos:** `listPublishedLeadMagnets()` / `getPublishedLeadMagnetBySlug(slug)` con `...PUBLISHED_EDITORIAL_WHERE`, `isGated: true`. Portada: join `ogImageId` → `media_assets`, URL pública con `resolveMediaFileUrl`.
- **Descarga:** `lib/leads/resource-download-token.ts` parsea/valida token; `GET /api/recursos/download` carga lead + magnet + asset, `NextResponse.redirect` a URL pública del PDF. Sin rate limit dedicado en MVP (enlace opaco); opcional clave `recursos-download:{ip}` si hay abuso.
- **SEO:** kind `lead_magnet` en `buildSiloPath` → `/recursos/{slug}`; índice con `lib/resources/catalog-config.ts`. `BreadcrumbList` en listado y ficha.
- **UI (Stitch):** hero editorial en `/recursos` (eyebrow «Recursos técnicos», H1 + lead); grid de tarjetas con imagen, tipo y CTA. Ficha: layout dos columnas en desktop (contenido + card de formulario sticky), una columna en mobile; formulario con campos nombre, email, empresa, rol, GDPR, Turnstile.
- **Formulario:** `ResourceForm` (patrón `TenderForm`): validación Zod cliente, `POST /api/recursos/{slug}`, errores `role="alert"`, redirect a `thankYouUrl` con query `ref` + `download` (ruta relativa `/api/recursos/download?...` aceptada por `sanitizeDownloadUrl`).

## Threat model

### Superficie de ataque

- `GET /api/recursos/download?token=` (enumeración/reuso de token).
- `POST /api/recursos/[slug]` (ya endurecido GTK-30; no modificar contrato salvo nota de publicación).
- Formulario público y query params `utm_*`, `rol`.
- Páginas RSC sin datos de lead en HTML.

### Actores

- Anónimo, bot de spam, atacante con token filtrado.

### Datos sensibles

- PII en formulario (nombre, email, empresa, teléfono, rol) — solo vía HTTPS al POST existente; no loguear en cliente.

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Reuso de token de descarga | Compartir URL `download` | Acceso no autorizado al PDF | Token opaco; MVP acepta reuso — ver decisión |
| T2 | Token adivinado | Brute force UUID | Bajo (UUID v4) | Validación estricta de formato |
| T3 | Open redirect en Thank You | `download` query | Phishing | `sanitizeDownloadUrl` (GTK-63) |
| T4 | Spam en formulario | POST automatizado | PII basura | Turnstile + rate limit existente |
| T5 | Fuga de `file_url` interna | Respuesta API | Exposición storage | Solo redirect; tests sin JSON con URL |
| T6 | Captura de borradores | POST sin filtro publicado | Lead sobre contenido no publicado | Lectores públicos con `PUBLISHED_EDITORIAL_WHERE`; nota: `findGatedLeadMagnetBySlug` pendiente alinear en ticket GTK-30 |

### Requisitos de seguridad (criterios de aceptación)

- [ ] SEC-1: `GET /api/recursos/download` con token malformado → 400 sin cuerpo con rutas internas.
- [ ] SEC-2: Token con lead inexistente o `leadMagnetId` incoherente → 404.
- [ ] SEC-3: Respuesta exitosa no es JSON con `file_url` de `media_assets`.
- [ ] SEC-4: Thank You solo acepta `download` bajo prefijo `/api/recursos/download` (reutilizar sanitize).
- [ ] SEC-5: Formulario no envía sin `gdprConsent: true` ni sin Turnstile (schema Zod).

### Riesgo aceptado MVP

- Token determinista `base64url(leadId:leadMagnetId)` **reutilizable**; documentado para revisión futura (campo `downloadedAt` o JWT expirable).

## Decisiones

- Recursos no gated: excluidos de rutas públicas en este change.
- No duplicar evento `resource_download` en frontend.
- `form_start` vía `pushRawDataLayer` (no está en `CONVERSION_EVENT_NAME_VALUES`).

## Integración

- Reutilizar GTK-30 POST, GTK-63 Thank You, GTK-45 `buildMetadata`, patrones GTK-62 para catálogo editorial.
