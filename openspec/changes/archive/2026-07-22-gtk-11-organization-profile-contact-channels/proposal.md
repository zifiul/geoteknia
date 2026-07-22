# Proposal — gtk-11-organization-profile-contact-channels

> US: [GTK-11 — Configuración de organización y canales de contacto](https://linear.app/geoteknia/issue/GTK-11/configuracion-de-organizacion-y-canales-de-contacto)
> Variante: **Harness DB** | Dependencias: GTK-6, GTK-7 | Desbloquea: RF-08, RF-09, GTK-17 (seed), GTK-23, GTK-28

## Why

Los datos estructurados de home/contacto (RF-09) y los CTAs de contacto (RF-08) deben ser editables desde el portal sin redeploy. Materializa las entidades 19 y 20 del modelo: `organization_profile` (singleton NAP/Schema LocalBusiness) y `contact_channels` (click-to-call/WhatsApp por departamento).

## What Changes

- Crear enum `ContactDepartment` (`presupuestos`, `direccion_tecnica`, `licitaciones`).
- Crear modelo `OrganizationProfile` singleton con bloque AUDIT, NAP, GBP, `area_served` JSON y rating opcional.
- Crear modelo `ContactChannel` con bloque AUDIT, índice en `department` y plantilla de mensaje pre-rellenado.
- Migración `organization_profile_contact_channels` (DDL-only, sin data migration).
- Sin seed en este ticket (singleton y canales en DB-14 / GTK-17).

## Capabilities

### New Capabilities

- `organization-profile-contact-channels`: configuración corporativa singleton y canales de contacto por departamento.

### Modified Capabilities

- Ninguna.

## Impact

- **Código:** `prisma/schema.prisma`, migración SQL.
- **BD:** enum + 2 tablas en Neon EU.
- **API / UI:** ninguno (fases 2 y 4b omitidas).
- **RGPD:** datos de contacto corporativos públicos (no PII de terceros); región EU obligatoria.
- **Tickets desbloqueados:** seed GTK-17, CTAs RF-08, Schema.org RF-09.

## Fuera de alcance

- Seed de NAP real, place_id GBP y números por departamento (GTK-17 / DB-14).
- Lógica de dominio en `/lib/` (upsert singleton, resolución de canal activo).
- Route Handlers / UI del portal admin.
