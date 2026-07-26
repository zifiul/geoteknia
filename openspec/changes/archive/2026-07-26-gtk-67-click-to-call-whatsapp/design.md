# Design — gtk-67-click-to-call-whatsapp

## Enfoque

- **Datos:** `getContactChannelByDepartment(department)` con `unstable_cache` y tag `ORGANIZATION_PROFILE_CACHE_TAG`; selecciona `phone`, `whatsappNumber`, `email`, `prefilledMessageTemplate`. `getGeneralContactChannel()` intacto para footer y fallback.
- **Regla de departamento (documentada):**
  - Rutas `/servicios/**`, `/zonas/**` → `presupuestos`.
  - Ruta `/licitaciones` y prefijo → `licitaciones` (email vía `TenderMailtoLink`; tel/WhatsApp del canal licitaciones si aplica en layout).
  - Resto del sitio → canal **genérico** (`getGeneralContactChannel`) en sticky/header.
- **Plantilla WhatsApp:** placeholders `{{servicio}}` y `{{provincia}}`; mensaje por defecto si `prefilledMessageTemplate` es null. Slugs desde `parseContactContextSlugs(pathname, searchParams)` (path + query `?servicio=`/`?provincia=`). Etiquetas legibles: `humanizeSlug` en cliente; páginas de servicio pasan `service.name` al strip.
- **UI (Stitch showcase):** botones tel/WhatsApp en cabecera desktop (≥44px, icono + texto), barra sticky móvil con mismos patrones GTK-47; contraste y `aria-label` por departamento («Llamar a presupuestos», «WhatsApp presupuestos», «Email licitaciones»).

## Threat model (GTK-67)

| Área | Riesgo | Mitigación |
|------|--------|------------|
| Open redirect | `wa.me` / `mailto:` | URLs construidas solo con dígitos de teléfono CMS y emails de BD; sin input de usuario en href |
| XSS en plantilla | Texto CMS en `text=` | `encodeURIComponent` en `buildWhatsAppUrl`; plantilla solo desde servidor |
| Fuga PII en analytics | Dimensiones servicio/provincia | Solo slugs públicos de ruta; sin datos de formulario |
| Enumeración | Canales por departamento | Datos públicos de negocio; mismo criterio que NAP |
| Consentimiento | Eventos sin consent | `trackConversionEvent` existente; navegación `href` independiente |

Requisitos SEC: sin endpoints nuevos; sin mutaciones; validación Zod no aplica (sin API).

## Decisiones

- Un solo `buildWhatsAppUrl` extendido (no función paralela).
- `TenderMailtoLink` fino sobre `ContactTrackLink` (no duplicar tracking).
- Layout público precarga `presupuestos`, `licitaciones` y canal general; el cliente elige según `resolveContactDepartmentForPath`.

## Integración

- Reutilizar `PhoneLink`, `ContactTrackLink`, `buildContactContextQuery`, `trackConversionEvent`.
- `load-service-page` y `ServiceContactStrip` usan canal `presupuestos` + mensaje con nombre de servicio.
