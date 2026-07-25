# Design: POST /api/recursos/[slug]: descarga de lead magnet gated

## Enfoque técnico

Monolito modular Next.js 15 App Router en TypeScript estricto. La captura de leads por recurso técnico se ubica en un Route Handler público de alta disponibilidad (`app/api/recursos/[slug]/route.ts`), desacoplando la lógica de negocio a la capa de servicios `/lib/leads` y reutilizando la infraestructura de captación establecida en GTK-28/29/31/32.

### Arquitectura de capas

1. **Route Handler (`app/api/recursos/[slug]/route.ts`):**
   - Extrae el parámetro `slug` de las params de la ruta.
   - Aplica rate limiting por IP (`recursos:${ip}`) usando `checkRateLimit`.
   - Parsea el body del request contra `resourceLeadSchema`.
   - Busca el lead magnet vía `findGatedLeadMagnetBySlug(slug)`.
   - Valida el token Cloudflare Turnstile vía `verifyTurnstileToken`.
   - Invoca el caso de uso `createResourceLead(validatedData, leadMagnet)`.
   - Retorna la respuesta formateada con `apiSuccess(201, ...)` o propaga `LeadCaptureError` / ZodError con `apiError`.

2. **Dominio y Servicio (`lib/leads/create-resource-lead.ts`):**
   - Reutiliza `upsertContact` para buscar o crear el contacto por email o teléfono.
   - Genera número de referencia único en transacción Prisma (`generateUniqueReferenceNumber(tx, 'REC')`).
   - Crea `lead` (`lead_type='recurso'`, `channel='lead_magnet'`, `lead_magnet_id`, `source`, `gdpr_consent: true`) y `project` (`titlePrefix: 'Recurso'`, `service_id: leadMagnet.service_id ?? null`) atómicamente.
   - Tras el commit exitoso:
     - Dispara `sendLeadConfirmation` con fallbacks de servicio y provincia (`serviceName: leadMagnet.title`, `province: 'Por determinar'`).
     - Llama a `recordConversionEvent(tx, { eventName: 'resource_download', ... })` de manera best-effort.
   - Genera la `downloadUrl` (en el MVP: token/URL única vinculada al lead magnet/lead creado) evitando exponer el `file_url` directo de `media_assets`.

3. **Validación Runtime Zod (`lib/leads/schema.ts`):**
   ```typescript
   export const resourceLeadSchema = z.object({
     nombre: z.string().trim().min(2).max(200),
     email: emailField,
     empresa: z.string().trim().max(200).optional(),
     telefono: phoneField.optional(),
     rol: professionalRoleSchema.optional(),
     gdprConsent: z.literal(true),
     turnstileToken: z.string().min(1),
     utmSource: z.string().trim().max(200).optional(),
     utmMedium: z.string().trim().max(200).optional(),
     utmCampaign: z.string().trim().max(200).optional(),
     gaClientId: z.string().trim().max(200).optional(),
     landingUrl: z.string().trim().url().optional(),
   }).strict();
   ```

4. **Acceso a Datos (`lib/content/lead-magnets.ts`):**
   - Función `findGatedLeadMagnetBySlug(slug: string)`:
     ```typescript
     export async function findGatedLeadMagnetBySlug(slug: string) {
       return prisma.leadMagnet.findFirst({
         where: {
           slug,
           isGated: true,
           fileId: { not: null },
           deletedAt: null,
         },
         select: {
           id: true,
           title: true,
           slug: true,
           thankYouUrl: true,
           fileId: true,
           serviceId: true,
         },
       });
     }
     ```

## Threat Model (Shift-Left Security)

### Superficie de ataque
- **HTTP Endpoint:** `POST /api/recursos/[slug]` (Público sin sesión de usuario).
- **Parámetros:** Route Slug (`[slug]`), Body JSON (`resourceLeadSchema`).

### Actores
- **Público / Visitante anónimo:** Usuario que solicita la descarga del recurso.
- **Atacante / Bot:** Intento de automatización, spam de leads, enumeración de recursos o agotamiento de recursos.

### Datos sensibles (PII / RGPD)
- **Campos:** Nombre, Email, Empresa, Teléfono, Rol profesional.
- **Tratamiento:** Persistencia exclusiva en PostgreSQL Neon EU (`contacts`/`leads`). Excluido de logs del servidor y prompts de IA. Consentimiento `gdprConsent: z.literal(true)` obligatorio.

### Requisitos y salvaguardas de seguridad
1. **Autenticación / Anti-Bot:** Verificación servidor Cloudflare Turnstile token (`verifyTurnstileToken`). 403 `TURNSTILE_INVALID` si falla.
2. **Rate Limiting:** Protección anti-DDoS / abuso por IP con `checkRateLimit` (clave `recursos:${ip}`). 429 `RATE_LIMITED` en caso de exceso.
3. **Validación Estricta:** Zod schema con `.strict()` rejection de campos desconocidos (prevención de mass assignment) e inyección de datos.
4. **Protección de Almacenamiento Interno:** La respuesta no retorna la ruta interna ni la URL del bucket de `media_assets`. En su lugar devuelve `downloadUrl` estilizada/protegida (token/URL única) + `thankYouUrl`.
5. **Aislamiento de BD:** Transacción Prisma atómica para `lead` y `project`. Sin huérfanos.

## Manejo de errores y respuestas

| Escenario | Código HTTP | Code Envelope | Descripción |
|---|---|---|---|
| Captura exitosa | 201 Created | Success | Retorna `{ downloadUrl, thankYouUrl, referenceNumber }` |
| Payload inválido / GDPR sin marcar | 400 Bad Request | `VALIDATION_ERROR` | Detalle Zod por campo |
| Turnstile inválido / expirado | 403 Forbidden | `TURNSTILE_INVALID` | Falla la verificación Turnstile |
| Recurso inexistente, borrado o libre (`is_gated=false`) | 404 Not Found | `RESOURCE_NOT_FOUND` | No existe recurso gated activo |
| Límite de peticiones superado | 429 Too Many Requests | `RATE_LIMITED` | Header `Retry-After` incluido |
| Error interno de servidor / BD | 500 Internal Error | `INTERNAL_ERROR` | Log estructurado sin PII |
