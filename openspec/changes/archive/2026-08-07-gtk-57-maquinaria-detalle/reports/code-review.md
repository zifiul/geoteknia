# Code Review — gtk-57-maquinaria-detalle

- Fecha: 2026-08-07
- Diff revisado: working tree (~15 ficheros: página, lib, componentes, tests, openspec)
- Evidencia revisada: `reports/2026-08-07-step-N+1-unit-test.md`, `reports/security.md`

## Alineación spec ↔ implementación

- [x] Ficha `/maquinaria/[slug]` RSC con `PUBLISHED_EDITORIAL_WHERE` y `notFound()` para no publicados (spec `public-machinery-detail`).
- [x] ISR `revalidate = 3600`, `generateStaticParams` desde `listPublishedMachinery()`.
- [x] SEO sintético vía `buildMachinerySeoBlock` + `buildMetadata` (sin bloque SEO en BD).
- [x] JSON-LD `Product` (`buildMachineryProductSchema`) + `BreadcrumbList` (silo `machinery`).
- [x] Enlaces al detalle en `MachineCard` y `ServiceEquipment` (delta `public-machinery-listing`).
- [x] Revalidación de `/maquinaria` al publicar equipo.
- [x] `listMachineryByService()` sin cambios de firma (compatibilidad GTK-49).

## Hallazgos

| Severidad | Área | Hallazgo | Evidencia | Fix sugerido |
|-----------|------|----------|-----------|--------------|
| Menor | Rendimiento | `generateMetadata` y la página llaman `getPublishedMachineryBySlug` por separado (2 queries por request) | `page.tsx` | Aceptable en ISR; optimizable en futuro con `cache()` de React |
| Menor | QA | E2E de navegación listado→ficha hace skip si BD sin maquinaria publicada | `maquinaria-detalle.spec.ts` | Seed de test o fixture en CI cuando haya datos estables |

Sin hallazgos Bloqueantes ni Mayores.

## Sección de seguridad

- Resultado del scan (5b): **LIMPIO** (`reports/security.md`).
- SEC-1..SEC-4 del threat model: implementados (filtro publicado, escape React, join servicios publicados, superficie GET read-only).
- Checklist OWASP: sin desviaciones en el diff (A01/A03/A05 cubiertos por patrones existentes del silo editorial).

## Arquitectura

- Lógica en `/lib` (`machinery.ts`, `machinery-seo.ts`, `machinery-product-schema.ts`, `jsonld.ts`); página y organismos finos.
- RSC sin Client Components innecesarios; reutiliza `SpecTable`, `MachineryServiceTrackLink`, `Breadcrumbs`.
- Refactor DRY del mapeo fila→DTO compartido entre listado y detalle.

Veredicto: APTO
