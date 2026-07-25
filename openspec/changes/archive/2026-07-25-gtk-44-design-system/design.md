# Design — gtk-44-design-system

## Context

GTK-43 entregó Tailwind v4 (`app/globals.css` con `@theme` mínimo), route groups y `noindex` en admin. No hay carpeta `components/` ni utilidad `cn`. GTK-44 materializa el catálogo de `frontend-standards.md` §8.3–8.4 y `docs/design/DESIGN.md`.

## Goals / Non-Goals

**Goals:**

- Tokens de marca en `@theme` (colores DESIGN.md, radios, sombras, escala tipográfica utilitaria).
- Librería Atomic Design accesible (WCAG 2.1 AA en controles interactivos).
- Radix Primitives (Opción A) para `Dialog`, `Accordion`, `Tabs`.
- Catálogo `app/(admin)/dev-componentes` para revisión visual y E2E/axe.
- Tests Vitest (RTL + jsdom) y Playwright (teclado + axe).

**Non-Goals:**

- RBAC del catálogo (GTK-68), tipografía Sora/IBM Plex completa (se mantiene Inter de GTK-43 hasta ticket de layout), `StepIndicator`, formularios de negocio.

## Decisions

### Radix vs manual

**Decisión:** Opción A — `@radix-ui/react-dialog`, `@radix-ui/react-accordion`, `@radix-ui/react-tabs` sin estilos; estilos con tokens Tailwind y `cn()`.

**Alternativa descartada:** implementación manual de focus trap/ARIA (mayor riesgo en GTK-76).

### Server vs Client

- **RSC:** `Badge`, `Card`, `Container`, `Section`, `Grid`, `Skeleton`, `Breadcrumbs`, `FieldError`, `LinkButton` (Next `Link`).
- **Client:** `Button` (loading), inputs controlados opcionales, `Dialog`, `Accordion`, `Tabs`, `ProgressBar` animado, `StickyCtaBar` (scroll/intersection).

### Testing

- Vitest: archivos `tests/unit/components/**/*.test.tsx` con `@vitest-environment jsdom`.
- Añadir `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.
- E2E: `tests/e2e/gtk44-design-system-a11y.spec.ts` con `@axe-core/playwright` en `/dev-componentes`.

### Tokens

Mapear hex de DESIGN.md a variables `--color-brand-*` en `@theme` para uso con utilidades Tailwind v4. Tipografía: reutilizar `--font-sans` (Inter) en esta US; tokens `--text-*` para tamaños de cuerpo/título.

## Risks / Trade-offs

- **[Catálogo admin sin auth]** → Mitigación: `noindex`; documentar dependencia GTK-68; no exponer datos sensibles en la página demo.
- **[Bundle Radix]** → Mitigación: solo tres primitivos; tree-shaking; sin importar el paquete completo de shadcn.
- **[Contraste en estados focus]** → Mitigación: ring visible con color de marca; verificación axe en E2E.

## Migration Plan

Despliegue incremental: nuevos módulos sin romper rutas existentes. Las plantillas futuras migran imports a `@/components/atoms` cuando se implementen.

## Open Questions

- Ninguna bloqueante: Opción Radix confirmada en diseño.

## Threat model

### Superficie de ataque

- Ruta pública futura: `/dev-componentes` bajo `(admin)` — hoy accesible sin RBAC (solo noindex).
- Componentes cliente sin datos de usuario en esta US; sin `dangerouslySetInnerHTML` en la librería base.
- Sin endpoints HTTP ni Server Actions nuevos.

### Actores

- Anónimo que descubre URL del catálogo, crawler, desarrollador interno.

### Datos sensibles implicados

- Ningún PII en componentes demo. Sin analytics en la librería.

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Enumeración de rutas admin | GET `/dev-componentes` sin login | Bajo (UI de demo) | `noindex`; GTK-68 añadirá RBAC |
| T2 | XSS vía props `children` en Alert/Dialog | Contenido no confiable en usos futuros | Medio en consumidores | Documentar que consumidores deben escapar/sanitizar HTML rico; sin `dangerouslySetInnerHTML` en base |
| T3 | Clickjacking en overlays | iframe de terceros | Bajo | Headers globales futuros; Dialog modal con backdrop |

**Descartadas:** escalada RBAC (sin auth API), abuse de formularios (sin POST), PII en logs, inyección SQL (sin BD).

### Requisitos de seguridad (criterios de aceptación verificables)

- [ ] SEC-1: La página `app/(admin)/dev-componentes/page.tsx` no exporta metadata que permita `index: true` (hereda layout admin — test metadata o E2E robots).
- [ ] SEC-2: Ningún componente base usa `dangerouslySetInnerHTML` (revisión estática / SAST en diff).
- [ ] SEC-3: Dependencias Radix fijadas en `package.json` sin scripts postinstall arbitrarios (SCA en fase 5b).
