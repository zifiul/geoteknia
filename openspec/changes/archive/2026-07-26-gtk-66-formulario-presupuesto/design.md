# Design — gtk-66-formulario-presupuesto

## Enfoque

- **Patrón de envío:** portar `TenderForm.tsx` (Turnstile, `buildPayload`, `readUtmParams`, códigos HTTP, `trackConversionEvent`) a wizard 3 pasos; extraer utilidades compartidas en `lib/forms/lead-form-shared.ts` y `lib/forms/budget-wizard.ts`.
- **Validación:** `budgetLeadSchema` completo en envío; pasos 1 y 3 con `pick` de campos obligatorios; paso 2 valida tipos si hay valores (plantas/superficie positivos).
- **Datos RSC:** `listPublishedServices({ take: 200 })`, `listOperationalProvinces()`, `listWorkTypologies()` para selects del paso 1–2.
- **Pre-relleno:** `searchParams` en `page.tsx` → props iniciales al cliente (`sanitizePrefill`).
- **UI Stitch:** proyecto `9787207935189076711`, design system `3480174961756698237`. Pantallas paso 1–3 (desktop/mobile IDs en comentario Linear GTK-66). Layout: hero «Solicitar presupuesto», tarjeta formulario (`border-brand-secondary/15`, `bg-brand-surface`), `StepIndicator` superior, CTAs primarios ochre (`brand-accent`), sticky submit en móvil paso 3 (`StickyCtaBar`).
- **Metadata:** `lib/budget/page-config.ts` (patrón licitaciones/contacto).

## Threat model

### Superficie

- Página pública; `fetch` a API propia; widget Turnstile (tercero); query params reflejados en estado de formulario (no HTML crudo).

### Actores

- Usuario legítimo, bot de spam, atacante con payloads maliciosos en query o cuerpo JSON.

### Datos sensibles

- PII en paso 3 (nombre, email, teléfono). Atribución UTM/landing en payload.

### Amenazas

| # | Amenaza | Mitigación |
|---|---------|------------|
| T1 | Spam masivo de leads | Turnstile server-side (GTK-28), rate limit `leads-presupuesto:{ip}` |
| T2 | Inyección XSS vía query params | React controlled inputs; `sanitizePrefill` truncado |
| T3 | Payload fuera de schema | Zod `.strict()` cliente y servidor |
| T4 | Fuga PII en analytics | `trackConversionEvent` sin PII; solo slugs y leadType |
| T5 | Bypass RGPD | `gdprConsent: z.literal(true)` en schema |

### Criterios seguridad

- [ ] SEC-1: No loguear email/teléfono en cliente.
- [ ] SEC-2: Turnstile token no reutilizado tras 403 (reset widget).
- [ ] SEC-3: Query params sanitizados antes de estado inicial.

## Decisiones

- No modificar `TenderForm` más allá de importar helpers compartidos (DRY mínimo).
- Turnstile solo en paso 3 (una verificación por envío).
- Sin JSON-LD en página de formulario.

## Integración

- Consumo API existente `public-lead-presupuesto-api`.
- Thank you GTK-63.
- CTAs GTK-49 → `?servicio=`.
