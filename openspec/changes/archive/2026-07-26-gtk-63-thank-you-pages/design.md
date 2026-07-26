# Design — gtk-63-thank-you-pages

## Enfoque técnico

- **Rutas:** `app/(public)/gracias/{tipo}/page.tsx` — RSC, `searchParams` async (Next 15), sin fetch de BD.
- **UI Stitch:** layout calmado (`bg-brand-neutral`, tarjeta blanca centrada, acento `#C45A11` en CTA), icono éxito, bloque referencia en mono, sección «Próximos pasos» con `Link` descriptivos; mobile-first (`max-w-[640px]`, CTA descarga ancho completo en recurso).
- **Componentes:** `components/organisms/thankyou/ThankYouConfirmation.tsx` (RSC), `ThankYouConversionPing.client.tsx` (único cliente).
- **Config:** `lib/thankyou/config.ts` — mapeo tipo ↔ prefijo ref (`PRE`/`LIC`/`UBI`/`REC`), `eventName` dataLayer (`generate_lead`, `send_location`, `resource_download`), `leadType`.
- **Copy:** import desde `lib/leads/confirmation-copy.ts` (reexport de `lead-confirmation.ts`).
- **Sanitización:** `sanitizeReferenceParam`, `sanitizeDownloadUrl` (solo path `/api/recursos/download`, sin `..` ni URLs absolutas externas).
- **SEO:** `lib/thankyou/metadata.ts` con `THANK_YOU_PAGE_ROBOTS`; sin `alternates.canonical`.

## Threat model (GTK-63)

### Superficie

- Páginas públicas read-only; parámetros `ref` y `download` en query string.
- Client Component que escribe `sessionStorage` y `dataLayer`.

### Actores

- Visitante anónimo, bot, atacante que inyecta query maliciosa (XSS reflejado en UI, open redirect vía `download`).

### Datos sensibles

- `ref` puede correlacionar con lead (dato de negocio, no PII directa en URL). No loguear query en servidor. No enviar `ref` a analítica más allá del evento enum permitido.

### Amenazas descartadas

- Authz/API abuse: no hay mutaciones ni endpoints nuevos.
- Rate limit/Turnstile: no hay formularios en Thank You.

### Requisitos de seguridad

- **SEC-TY1:** `ref` y `download` validados antes de render; rechazo de HTML/script en display (texto escapado por React).
- **SEC-TY2:** `download` solo rutas relativas bajo `/api/recursos/download`; rechazar `http://`, `//`, `..`.
- **SEC-TY3:** `ThankYouConversionPing` usa `pushDataLayer` con payload `conversionEventSchema` (sin PII adicional).
- **SEC-TY4:** Sin `recordConversionEvent` ni mirror `/api/eventos` desde Thank You (evitar doble persistencia).

## Decisiones

| Tema | Decisión |
|------|----------|
| Técnico en UI | Siempre `resolveTechnicianDisplayName(null)` hasta que formularios pasen dato (no existe asignación CRM). |
| Canonical | Omitido (noindex transaccional). |
| Descarga E2E | Enlace visible aunque API GTK-61 pendiente; curl de descarga fuera de alcance. |
