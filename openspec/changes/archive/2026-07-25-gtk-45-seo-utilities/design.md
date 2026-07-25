# Design — gtk-45-seo-utilities

## Context

GTK-43 archivado: `lib/seo/site-url.ts` (`resolveMetadataBase`), `lib/seo/silo-urls.ts` (`buildSiloPath`, `resolveContentUrl`), sitemap (GTK-42). `lib/content/schemas/seo.ts` define el Bloque SEO Zod alineado con `data-model.md`. GTK-44 añadió design system; `components/seo/` es carpeta hermana de atoms/molecules según `frontend-standards.md` §3.

## Goals / Non-Goals

**Goals:**

- Builders Schema.org tipados contra enum Prisma `SchemaType`.
- `buildMetadata()` como frontera única para Metadata API pública.
- `BreadcrumbList` coherente con silo y sitemap.
- Escapado y `<JsonLd>` solo en servidor (cero JS cliente para JSON-LD).
- Cobertura Vitest + E2E en página de prueba (label Frontend).

**Non-Goals:**

- Plantillas de negocio, layout público GTK-47, gestión transversal noindex GTK-78.
- Lighthouse CI gate global (solo verificación en página de prueba según DoD Linear).

## Decisions

### Reutilización vs duplicación

**Decisión:** `buildMetadata` llama a `resolveMetadataBase` y `resolveContentUrl`; breadcrumbs usa `buildSiloPath` y kinds de `sitemap-config.ts`. No duplicar lógica de URL.

**Alternativa descartada:** canonical calculado en cada plantilla (divergencia con sitemap).

### Escapado JSON-LD

**Decisión:** `json-ld-escape.ts` post-procesa `JSON.stringify` sustituyendo `<` por `\u003c` (y reglas documentadas en tests) para mitigar `</script>`. Distinto de `escapeXml` (sitemap).

### Tipos Schema.org vs enum

**Decisión:** `@type` en JSON usa strings Schema.org (`ProfessionalService`, `CreativeWork`, etc.) mapeados desde `SchemaType` Prisma. Builders exportan funciones por familia (`buildServiceSchema`, `buildArticleSchema`, …).

### Server vs Client

**Decisión:** Todo el ticket es RSC + `/lib`. `<JsonLd>` sin `'use client'`. Los builders son funciones puras importables desde Server Components y tests.

### Página de prueba

**Decisión:** `app/(public)/dev-seo/page.tsx` (o ruta equivalente acotada) con `noindex` opcional en metadata de prueba si se desea no indexar catálogo interno; documentar en threat model. Alternativa: `noindex: true` en Bloque SEO de prueba para no contaminar índice.

### Imágenes en schema

**Decisión:** URLs absolutas vía `MEDIA_STORAGE_BASE_URL` / helpers existentes de media cuando el row trae `og_image_id` o URL de asset resuelta por el caller (builders aceptan `imageUrl` opcional ya resuelta en servidor).

## Risks / Trade-offs

- **[XSS vía contenido editorial en JSON-LD]** → Mitigación: escape en script + datos solo desde servidor; SEC tests con `</script>`.
- **[JSON inválido por Unicode]** → Mitigación: `JSON.stringify` nativo + tests con comillas y `&`.
- **[Divergencia canonical vs sitemap]** → Mitigación: única fuente `resolveContentUrl`.
- **[Página de prueba indexable]** → Mitigación: `noindex` en metadata de dev-seo o documentar eliminación pre-producción.

## Migration Plan

Nuevos módulos sin breaking changes. Plantillas futuras importan `@/lib/seo/metadata` y `@/components/seo/json-ld`.

## Open Questions

- Ninguna bloqueante: alcance acotado a utilidades según Linear GTK-45.

## Threat model

### Superficie de ataque

- HTML público generado en servidor con `<script type="application/ld+json">` y metadata.
- Página de prueba pública (`/dev-seo` o similar) con strings controlados en tests y payload malicioso simulado.
- Sin endpoints HTTP nuevos ni Server Actions.
- Sin componentes cliente que reciban datos de usuario para JSON-LD.

### Actores

- Anónimo, crawler, atacante que intenta inyectar HTML/JS vía campos CMS reflejados en JSON-LD (simulado en tests).

### Datos sensibles implicados

- Solo contenido publicable (títulos, descripciones, URLs públicas). Sin PII de leads/contacts en builders.

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | XSS / ruptura DOM vía `</script>` en JSON-LD | Contenido CMS en script inline | Alto | `json-ld-escape.ts`, tests RED/GREEN, E2E view-source |
| T2 | Canonical malicioso (open redirect) | `canonical_url` en Bloque SEO | Medio | Zod `z.url()` en CMS (GTK-41); builders no revalidan más que URL absoluta |
| T3 | Exfiltración por JSON-LD en admin | Uso erróneo de `<JsonLd>` en admin | Bajo | Solo rutas públicas en esta US; admin sin JSON-LD de negocio |

**Descartadas:** escalada RBAC (sin auth API), abuse de formularios (sin POST), SQLi (sin BD en builders), PII en logs (builders sin console.log de contenido).

### Requisitos de seguridad (criterios de aceptación verificables)

- [ ] SEC-1: Strings con `</script>` en datos de prueba no producen HTML ejecutable tras render SSR (test unitario de escape + E2E view-source).
- [ ] SEC-2: `<JsonLd>` y builders no usan `dangerouslySetInnerHTML` (SAST en diff).
- [ ] SEC-3: Página de prueba no expone datos de admin ni tokens; metadata de prueba con `noindex` o ruta documentada como no indexable.
