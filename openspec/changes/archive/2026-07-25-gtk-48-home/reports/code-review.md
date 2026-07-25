# Code review — gtk-48-home

## Alcance

Home RSC, lecturas públicas CMS, extensión JSON-LD, tracking engagement vs conversión, revalidación `/`.

## Checklist

- [x] Filtro `publicado` centralizado (`published-filter.ts`).
- [x] Sin anidar `<a>`; `EngagementTrackLink` único.
- [x] Threat model SEC-H1–H5 cubierto.
- [x] `security.md` limpio.
- [x] Tests unitarios + E2E.
- [x] UI alineada a Stitch (hero oscuro, grid personas, acento naranja, contenedor 1200px).

## Seguridad

Sin hallazgos abiertos; ver `reports/security.md`.

**Veredicto: APTO**
