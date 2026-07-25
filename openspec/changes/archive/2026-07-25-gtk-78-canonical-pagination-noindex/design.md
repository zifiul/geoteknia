# Design — gtk-78-canonical-pagination-noindex

## Context

GTK-45 entregó `buildMetadata()` + `resolveContentUrl` (canonical de entidad sin query). GTK-42 filtra `noindex` en sitemap. GTK-43/ admin layout ya marcan `/admin` no indexable. GTK-78 añade la capa **listado** reutilizable antes de GTK-50/54/63.

## Goals / Non-Goals

**Goals:**

- Utilidades puras en `lib/seo/` con tests exhaustivos.
- Laboratorio `dev-seo` para E2E (Fase 1 del ticket).
- Contrato documentado en cabeceras de módulo para GTK-49–55 y GTK-63.
- `rel=prev`/`rel=next` vía RSC (no Metadata API).

**Non-Goals:**

- Integrar en `/blog`, `/proyectos`, `/gracias` (Fase 2).
- Modificar `buildMetadata()` para entidades.

## Decisions

### Canonical de listado

**Decisión:** Canonical = `basePath` normalizado + `?page=N` solo si `N > 1`. Sin `utm_*`, sin filtros (`servicio`, `provincia`, etc.) en la URL canónica. Los filtros se detectan con `analyzeListingSearchParams(params, allowedFilterKeys)` para robots, no para canonical.

### Paginación prev/next

**Decisión:** `buildPaginationNavLinks` devuelve URLs absolutas; `PaginationLinks` (RSC) inserta `<link rel="prev|next">`. Documentar en comentario de módulo que `generateMetadata().alternates` no cubre prev/next.

### Thank You

**Decisión:** exportar `THANK_YOU_PAGE_ROBOTS` constante `{ index: false, follow: false }` para GTK-63.

### dev-seo

**Decisión:** `app/(public)/dev-seo/canonical-lab/page.tsx` con `generateMetadata({ searchParams })` leyendo `page`, `servicio` (filtro simulado) y UTM.

## Threat model

### Superficie de ataque

- Metadata HTML público (`link[rel=canonical]`, robots).
- Parámetros de URL en laboratorio `canonical-lab` (sin persistencia).
- Sin endpoints nuevos ni Server Actions.

### Actores

- Crawler, atacante con URLs maliciosas (`javascript:` en query — no reflejado en canonical si solo usamos paths controlados).

### Datos sensibles

- Ninguna PII; solo URLs públicas.

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Open redirect vía canonical | `basePath` no validado en caller | Medio | Normalizar path (leading slash, sin protocolo); callers usan paths fijos de plantilla |
| T2 | Indexación de thin content filtrado | Filtros no curados indexables | Medio | `resolveListingRobots` → noindex; tests + E2E |
| T3 | XSS en `<link href>` | Query reflejada en href | Bajo | Canonical construido solo desde enteros `page` y path fijo; sin reflejar strings arbitrarios en href |

**Descartadas:** RBAC, SQLi, PII en logs, abuse de formularios.

### Requisitos de seguridad

- [ ] SEC-1: `buildListingCanonical` / `buildPaginatedCanonical` rechazan `basePath` con esquema `http(s)://` o `//`.
- [ ] SEC-2: Laboratorio dev-seo mantiene `noindex` en rutas de prueba no destinadas a índice.
- [ ] SEC-3: Sin `dangerouslySetInnerHTML` en componentes nuevos.

## Contrato de integración (Fase 2)

| Ticket | Uso en `generateMetadata` |
|--------|---------------------------|
| GTK-49, GTK-51, GTK-53, GTK-55 | `buildListingCanonical` + `resolveListingRobots` si listado con filtros |
| GTK-50, GTK-54 | `buildPaginatedCanonical`, `buildPaginationNavLinks`, `PaginationLinks`, `analyzeListingSearchParams` |
| GTK-52 | Entidad: seguir `buildMetadata()`; listados de cluster si aplica helpers de listado |
| GTK-63 | `THANK_YOU_PAGE_ROBOTS` + canonical autoreferenciado de la URL Thank You |
