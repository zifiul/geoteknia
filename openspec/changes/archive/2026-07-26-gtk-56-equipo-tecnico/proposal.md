# Proposal — gtk-56-equipo-tecnico

> US: [GTK-56 — Equipo técnico: directorio y fichas (schema Person)](https://linear.app/geoteknia/issue/GTK-56/equipo-tecnico-directorio-y-fichas-schema-person)
> Diseño Stitch: proyecto `9787207935189076711`, DS `3480174961756698237` — `/equipo` desktop `523524d420604c849d669aff841798a8`, mobile `2310092c1cba43189eff5d8fa78df8ea`; ficha desktop `39a96395ef5343c7906412a69ee9535f`, mobile `325b487cb3a542ff8ee417a9f91d21e3`.
> Dependencias: GTK-45, GTK-41, GTK-47 (Done). Bloquea GTK-55, GTK-53.

## Why

Reforzar E-E-A-T (YMYL) y solvencia técnica P3 con directorio `/equipo` y fichas individuales con JSON-LD `Person`, enlazando casos firmados por cada técnico.

## What Changes

- Lectores públicos `listPublishedTeamMembers`, `getPublishedTeamMemberBySlug`, `listPublishedCaseStudiesByTeamMember`.
- `SeoBlockInput` sintético (`schemaType: Person`, `noindex: false`) — sin bloque SEO en BD.
- Rutas RSC `app/(public)/equipo/page.tsx`, `app/(public)/equipo/[slug]/page.tsx` (SSG + ISR).
- Organismos `TeamGrid`, `MemberProfile`, `MemberProjects` alineados a Stitch.
- Tracking engagement: `select_item` (directorio), `select_content` (proyectos) vía `pushRawDataLayer`.
- Tests Vitest + E2E Playwright.

## Capabilities

### New

- `public-team-directory`: directorio y fichas de equipo publicadas.

### Modified

- Ninguna spec viva obligatoria fuera del delta del change.

## Impact

- **Contrato API:** omitido (sin Route Handlers).
- **QA:** E2E obligatorio (label `Frontend`).

## Fuera de alcance

Autoría blog (GTK-55), firmante en detalle de caso (GTK-53), flag de visibilidad de colegiación, Lighthouse CI GTK-77.
