# Design — gtk-65-microconversion-ubicacion

## Decisión mapa (Opción A)

Se adopta **Opción A**: sin mapa interactivo ni `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. Ubicación vía **referencia catastral** (vía principal) o **coordenadas del navegador** (`navigator.geolocation`, opt-in del usuario). Coherente con GTK-60 (`MapEmbed` sin clave) y el objetivo Quick Win móvil ≤15 s. `MapPicker.tsx` queda fuera de alcance.

## Enfoque técnico

- **Componente:** `LocationWidget` (`'use client'`), props opcionales `serviceSlug`, `provinceSlug` (desde servidor o `parseContactContextSlugs` en cliente con `usePathname` + `useSearchParams`).
- **UI (Stitch):** FAB fijo inferior derecha (`min-h-11 min-w-11`, z-index por debajo de consent/modales críticos, `bottom-20` en móvil para no tapar sticky contact). Desktop: `Dialog` centrado (`max-w-lg`). Móvil: mismo `DialogContent` con clases bottom-sheet (`max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:translate-none max-md:rounded-b-none max-md:rounded-t-xl max-md:max-h-[90vh] overflow-y-auto`).
- **Formulario:** campos catastral, email, teléfono (opcional nombre), checkbox RGPD, `TurnstileWidget`. Botón «Usar mi ubicación» rellena `mapLat`/`mapLng` si el usuario acepta permiso.
- **Validación:** `locationLeadSchema.safeParse` en submit (mismo schema que servidor); errores con `issuesToFieldErrors` + `role="alert"`.
- **Envío:** patrón `TenderForm` — `interpretLeadSubmitResponse`, códigos 201/400/403/429, `readUtmParams()` incluye `landingUrl` (atribución servicio vía URL).
- **Analytics:** al abrir diálogo, `pushRawDataLayer({ event: 'form_start', form_name: 'ubicacion', ... })`; tras 201, `trackConversionEvent({ eventName: 'send_location', leadType: 'ubicacion', serviceSlug, provinceSlug, pageUrl })`.

## Threat model (GTK-65)

| Área | Riesgo | Mitigación |
|------|--------|------------|
| Spam / bots | Abuso del endpoint público | Turnstile + rate limit ya en GTK-29; token obligatorio antes de submit |
| XSS | Reflejo de inputs en UI | React controlled inputs; mensajes de error desde Zod |
| PII en cliente | Email/tel en estado local | Sin persistencia localStorage; solo POST HTTPS |
| Geolocalización | Fuga de precisión sin consentimiento | Solo tras clic explícito; coords opcionales |
| RBAC | N/A | Endpoint público sin sesión; sin escalada |
| CSRF | POST desde origen cruzado | Same-origin fetch + Turnstile |

Requisitos SEC: reutilizar contrato congelado; sin nuevos Route Handlers; validación Zod estricta en cliente como espejo del servidor.

## Integración

- `Dialog`, `FormField`, `TurnstileWidget`, `lib/forms/lead-form-shared`, `locationLeadSchema`.
- Montaje: `ServiceDetailPage` pasa `serviceSlug={service.slug}` y provincia si aplica en query.
