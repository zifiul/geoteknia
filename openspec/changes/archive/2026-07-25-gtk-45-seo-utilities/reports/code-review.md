# Code review — gtk-45-seo-utilities

- **Fecha:** 2026-07-25
- **Base:** `main..HEAD` (rama `feature/frontend-gtk-45-utilidades-seo`)
- **Estándares:** `base-standards.md`, `frontend-standards.md` §6, delta spec `seo-utilities`

## Checklist funcional

- [x] Builders JSON-LD por `SchemaType` en `lib/seo/jsonld.ts`
- [x] `buildMetadata()` reutiliza `resolveMetadataBase` y `resolveContentUrl`
- [x] Breadcrumbs sobre `buildSiloPath` / kinds de sitemap
- [x] `json-ld-escape.ts` distinto de `escapeXml`
- [x] `<JsonLd>` RSC en `components/seo/` (no dentro de atoms)
- [x] Página `/dev-seo` con `noindex`
- [x] Tests unitarios + E2E

## Seguridad (OWASP / threat model)

- [x] `reports/security.md` — sin hallazgos nuevos críticos en diff
- [x] SEC-1–3 cubiertos (escape, sin `dangerouslySetInnerHTML`, noindex prueba)
- [x] Sin PII en JSON-LD de prueba

## Observaciones menores

- Consumo en plantillas reales pendiente (GTK-48+).
- Validación manual Rich Results Test recomendada en DoD Linear (humano).

**Veredicto: APTO**
