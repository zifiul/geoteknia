# Proposal — gtk-29-lead-ubicacion-api

> US: [GTK-29 — POST /api/leads/ubicacion: microconversión "enviar ubicación de la parcela"](https://linear.app/geoteknia/issue/GTK-29/post-apileadsubicacion-microconversion-enviar-ubicacion-de-la-parcela)
> Dependencias: GTK-28 (presupuesto, ✅), GTK-26 (rate limit, ✅), GTK-27 (email, ✅), GTK-32 (`recordConversionEvent`, ✅)
> Desbloquea: widget frontend de ubicación (ticket futuro); abarata GTK-30/31 vía refactor DRY

## Why

Usuarios en obra o con prisa no completan el formulario multi-paso de presupuesto. La microconversión de ubicación captura referencia catastral o pin de mapa más un contacto mínimo (email **o** teléfono) en segundos, materializando RF-Q2 y el alta automática de ficha con `lead_type`/`channel` `ubicacion`.

## What Changes

- Nuevo `POST /api/leads/ubicacion` (`app/api/leads/ubicacion/route.ts`): público, Turnstile, rate limit (`leads-ubicacion:{ip}`), envelope JSON estándar.
- `locationLeadSchema` en `lib/leads/schema.ts` (contacto mínimo, ubicación con `superRefine`, `.strict()`).
- Caso de uso `createLocationLead` en `lib/leads/create-location-lead.ts` (transacción contact+lead+project, email condicional, `send_location` best-effort).
- **Refactor DRY** (sin cambio funcional de presupuesto): prefijo parametrizable en `reference_number` (`UBI-` vs `PRE-`), `generateUniqueReferenceNumber` y `upsertContact` compartidos, prefijo de título de proyecto parametrizable.
- Contrato `docs/technical/api-spec.yml` para el nuevo endpoint.
- Tests unitarios + handler; QA con `curl` y verificación BD; **sin E2E Playwright** (label `Backend`).

## Capabilities

### New Capabilities

- `public-lead-ubicacion-api`: captación HTTP de microconversión ubicación, anti-abuso, persistencia CRM, email condicional y evento `send_location`.

### Modified Capabilities

- `crm-contacts-leads-projects-pipeline`: upsert de contacto compartido con campos opcionales; alta lead+proyecto para canal `ubicacion` sin servicio obligatorio.
- `public-lead-presupuesto-api`: requisito de `reference_number` parametrizado por prefijo (presupuesto sigue en `PRE-`); consumo de helpers compartidos extraídos (comportamiento externo inalterado).
- `conversion-events`: cableado best-effort de `send_location` tras alta de ubicación (helper GTK-32).

## Impact

- **Código:** `app/api/leads/ubicacion/`, `lib/leads/*`, `lib/projects/create-project-from-lead.ts`, `docs/technical/api-spec.yml`.
- **BD:** escrituras en `contacts`, `leads`, `projects`, `conversion_events` (sin migración; enums y columnas ya existen).
- **API:** nuevo endpoint público; Turnstile y rate limit en contrato.
- **SEO:** sin impacto directo.
- **RGPD / seguridad:** PII de contacto y localización en BD EU; `gdpr_consent=true`; sin PII en logs; sin audit_log en captación pública.

## Fuera de alcance

- UI del widget de ubicación (ticket frontend).
- `POST /api/leads` lead magnet y licitación (GTK-30/31).
- E2E Playwright en este ticket (label `Backend`).
- Cambios de schema Prisma.
