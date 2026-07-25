# public-analytics-consent

Capa pública de medición: GTM, Consent Mode v2, banner RGPD y dataLayer alineado con `conversionEventSchema` (GTK-46).

## Requirements

### Requirement: GTM con Consent Mode v2 denegado por defecto

El sistema SHALL cargar el contenedor GTM en el layout público mediante `next/script` con estrategia `afterInteractive` y SHALL inicializar Google Consent Mode v2 con `ad_storage`, `analytics_storage`, `ad_user_data` y `ad_personalization` en `denied` antes de que cualquier tag de marketing o analítica pueda ejecutarse. El ID del contenedor SHALL leerse de `NEXT_PUBLIC_GTM_ID` (documentado en `.env.example`). La carga del script externo de GTM MAY diferirse hasta opt-in de analítica o marketing.

#### Scenario: Primera carga sin consentimiento previo

- **WHEN** un visitante carga cualquier página del route group `(public)` sin cookie de consentimiento válida
- **THEN** el estado de Consent Mode permanece `denied` para las cuatro señales v2 y no se realizan peticiones de red a dominios de marketing/analítica atribuibles a tags GTM antes de aceptar

#### Scenario: GTM ausente en entorno sin ID

- **WHEN** `NEXT_PUBLIC_GTM_ID` no está definido
- **THEN** no se inyecta script GTM y el banner de consentimiento puede seguir gestionando preferencias locales sin error en runtime

### Requirement: Banner RGPD accesible y persistente

El sistema SHALL mostrar un banner de cookies RGPD/LOPDGDD en la primera visita con acciones aceptar, rechazar y configurar por categorías. El banner SHALL construirse sobre `components/molecules/Dialog.tsx` y `components/atoms/Button.tsx`. La elección SHALL persistirse (cookie y/o localStorage) y el banner no SHALL reaparecer hasta expiración o retirada del consentimiento. El sistema SHALL exportar un punto de reconfiguración reutilizable (p. ej. `openConsentPreferences`) para que GTK-47 lo enlace en el footer.

#### Scenario: Aceptar habilita analítica

- **WHEN** el usuario acepta la categoría de analítica (o acepta todo)
- **THEN** Consent Mode actualiza las señales correspondientes a `granted` y el banner se oculta

#### Scenario: Rechazar mantiene denegación

- **WHEN** el usuario rechaza cookies no esenciales
- **THEN** las señales de marketing/analítica permanecen `denied` y el banner se oculta

#### Scenario: Accesibilidad del diálogo

- **WHEN** el banner o el modal de configuración está abierto
- **THEN** el foco inicial está dentro del diálogo, la navegación por teclado funciona y el componente expone `role="dialog"` con etiqueta accesible (comportamiento heredado del `Dialog` del design system)

### Requirement: pushDataLayer tipado y condicionado a consentimiento

`lib/analytics/datalayer.ts` SHALL exponer `pushDataLayer(payload)` donde `payload` cumple `ConversionEventInput` de `lib/analytics/schema.ts` (incluidos los ocho nombres de `CONVERSION_EVENT_NAME_VALUES`). SHALL comprobar `typeof window` antes de acceder al dataLayer. SHALL emitir al `window.dataLayer` solo si existe consentimiento de analítica. SHALL aplicar `sanitizePageUrl` a `pageUrl` antes de cualquier push.

#### Scenario: Sin consentimiento de analítica

- **WHEN** `pushDataLayer` se invoca sin consentimiento de analítica
- **THEN** no se añade el evento de conversión al dataLayer

#### Scenario: Payload alineado con schema estricto

- **WHEN** `pushDataLayer` recibe campos válidos de `ConversionEventInput`
- **THEN** el objeto enviado al dataLayer usa exclusivamente claves permitidas por `conversionEventSchema` (camelCase inglés)

### Requirement: track espeja a POST /api/eventos

`lib/analytics/track.ts` SHALL llamar a `pushDataLayer` y, cuando haya consentimiento de analítica, SHALL enviar el mismo payload (con `pageUrl` saneado) a `POST /api/eventos` mediante `fetch`. SHALL reutilizar `CONVERSION_EVENT_NAME_VALUES` / tipos de `schema.ts` sin redeclarar constantes. SHALL NOT implementar rate limiting propio (el endpoint ya aplica `checkRateLimit`).

#### Scenario: Mirror válido tras aceptar

- **WHEN** el usuario ha concedido analítica y `trackConversionEvent` (o equivalente exportado) se invoca con un evento válido
- **THEN** el cuerpo JSON del `fetch` a `/api/eventos` pasa `ingestSchema` / `conversionEventSchema`

#### Scenario: Sin mirror sin consentimiento

- **WHEN** no hay consentimiento de analítica
- **THEN** `track` no llama a `/api/eventos`

### Requirement: Atribución UTM sin PII

El sistema SHALL capturar parámetros `utm_*` y `gclid` de la URL en el cliente y SHALL almacenarlos en el dataLayer o estructura de atribución documentada sin incluir datos personales en query persistida más allá de lo necesario para atribución técnica.

#### Scenario: Landing con UTM

- **WHEN** la URL contiene `utm_source` y `utm_campaign`
- **THEN** un evento técnico de atribución queda disponible en dataLayer sin bloquearse por falta de consentimiento de analítica (solo metadatos de campaña, no PII)

### Requirement: Integración en layout público

`app/(public)/layout.tsx` SHALL montar los componentes de GTM y consentimiento sin convertir todo el layout en Client Component; los hijos de página permanecen RSC salvo los módulos de analytics marcados con `'use client'`.

#### Scenario: Layout mínimo preservado

- **WHEN** se renderiza el layout público
- **THEN** la estructura `min-h-dvh flex flex-col` se mantiene y los analytics se añaden como hermanos o envoltorio compatible
