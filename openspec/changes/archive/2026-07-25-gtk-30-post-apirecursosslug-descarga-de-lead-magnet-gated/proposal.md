# Proposal: POST /api/recursos/[slug]: descarga de lead magnet gated

## Intención

Implementar el Route Handler público `POST /api/recursos/[slug]` para la descarga de recursos técnicos gated (checklists, guías, tablas, modelos de anejos) a cambio de datos de contacto de leads en fase de investigación.
Materializa el Requisito Funcional RF-11 (descarga de recursos técnicos / lead magnets), US-10 (lead magnet gated con Thank You de URL única) y RF-18 (alta de ficha de lead/proyecto), completando el pipeline de captación B2B de Geoteknia (tras GTK-28, GTK-29 y GTK-31).

## Alcance

- Route Handler `POST /api/recursos/[slug]` en `app/api/recursos/[slug]/route.ts` con rate limiting por IP (`recursos:${ip}`).
- Validación Zod del formulario breve vía `resourceLeadSchema` en `lib/leads/schema.ts` (nombre, email, empresa opcional, teléfono opcional, rol profesional opcional, `gdprConsent: z.literal(true)` obligatorio, `turnstileToken`).
- Lectura pública del recurso gated vía `findGatedLeadMagnetBySlug` en `lib/content/lead-magnets.ts` (retorna `LeadMagnet` si `is_gated=true`, `file_id IS NOT NULL` y `deleted_at IS NULL`; retorna 404 si no existe, si está borrado o si `is_gated=false`).
- Caso de uso `createResourceLead` en `lib/leads/create-resource-lead.ts`:
  - `upsertContact`: deduplicación por email o teléfono en `contacts`.
  - Transacción Prisma: crea `lead` (`lead_type='recurso'`, `channel='lead_magnet'`, `lead_magnet_id`, `reference_number` con prefijo `REC-`) y `project` (`titlePrefix: 'Recurso'`, sin requerir provincia ni servicio obligatorios).
  - Envío de email transaccional (`sendLeadConfirmation`) post-commit con fallbacks (`serviceName: leadMagnet.title`, `province: 'Por determinar'`).
  - Registro de evento de conversión `resource_download` post-commit best-effort vía `recordConversionEvent`.
  - Generación de `downloadUrl` (token un uso de descarga en `thank_you_url`, sin exponer la `file_url` interna de `media_assets`) + `thankYouUrl`.
- Contrato API en `docs/technical/api-spec.yml` con esquemas de respuesta y error estándar (`ApiEnvelope`).
- Cobertura con tests unitarios/integración en Vitest, verificación de BD Neon, pruebas `curl` y pruebas E2E con Playwright MCP.

## Fuera de alcance

- Firma S3/R2/Vercel Blob real para expirar URLs de archivos de `media_assets` (se pospone hasta integrar SDK de almacenamiento real; en el MVP se usa la URL no listada / token sin exponer la ruta interna).
- Gestión o descarga de recursos de acceso libre (`is_gated=false`), los cuales corresponden a rutas GET estáticas directas fuera de este flujo de captación.
- Modificación del flujo editorial YMYL (`GTK-39`): `lead_magnet` se mantiene como entidad de configuración de captación B2B cuya disponibilidad gated depende exclusivamente de `is_gated=true`, `file_id` presente y `deleted_at IS NULL`.
- Formulario UI React / interfaz pública de descarga (se implementará en la US de frontend correspondiente).

## Impacto

- **Ticket Linear relacionado:** [GTK-30](https://linear.app/geoteknia/issue/GTK-30/post-apirecursosslug-descarga-de-lead-magnet-gated).
- **SEO / ISR:** Sin impacto directo en páginas públicas SSG/ISR (la ruta `/api/recursos/[slug]` es un Route Handler POST no indexable).
- **RGPD / PII:** Recoge datos de contacto (`contacts`/`leads`) con `gdpr_consent=true` obligatorio. PII almacenada exclusivamente en PostgreSQL EU (Neon), nunca enviada a Claude ni registrada en logs.
- **Seguridad / /admin:** Endpoint público protegido por Cloudflare Turnstile server-side (403/502) y rate limiting Redis/In-Memory (429). Sin impacto en `/admin`.
