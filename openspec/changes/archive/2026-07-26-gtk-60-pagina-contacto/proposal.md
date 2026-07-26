# Proposal — gtk-60-pagina-contacto

> Linear: [GTK-60](https://linear.app/geoteknia/issue/GTK-60/pagina-de-contacto-nap-canales-segmentados-mapa).

## Why

La web necesita un punto de contacto segmentado y coherente con GBP/footer para conversión local (RF-08/RF-09) y desbloquea GTK-76.

## What Changes

Sustituir el placeholder de `/contacto` por una página pública de negocio con NAP alineado al footer, tres departamentos de contacto (presupuestos, dirección técnica, licitaciones), horario, mapa diferido, JSON-LD `LocalBusiness`/`ProfessionalService` y `BreadcrumbList`, y CTAs a presupuesto, ubicación de parcela y WhatsApp segmentado.

## Alcance

- RSC en `app/(public)/contacto/page.tsx` con metadata estática (patrón `/licitaciones`).
- Organismos `ContactChannels`, `ContactConversionCtas`, `MapEmbed`; wrapper `lib/contact/local-business-schema.ts`.
- Reutilizar `getOrganizationProfile()`, `getContactChannelByDepartment()`, `PhoneLink`, `ContactTrackLink`, `buildPresupuestoHref`, `parseContactContextSlugs`, `buildLocalBusinessSchema()`.
- Mapa: **Opción A** — iframe Google Maps sin API key (`q={napAddress}&output=embed`), lazy vía `IntersectionObserver`.
- UI según Stitch (comentario Linear 2026-07-19): desktop `1a61f9ef65ea4b49b8687cf208215e10`, mobile `9bd5b45887944c599cfa2286761c239e`.

## Fuera de alcance

- Formulario presupuesto (GTK-66) y microconversión ubicación (GTK-65): solo enlaces.
- Opción B mapa (API key + `gbpPlaceId`).
- Nuevos Route Handlers.

## Impacto

- Desbloquea GTK-76 (auditoría WCAG formal).
- Sin cambio de contrato API.

## Trazabilidad

- RF-08, RF-09; reutiliza GTK-47, GTK-48, GTK-67.
