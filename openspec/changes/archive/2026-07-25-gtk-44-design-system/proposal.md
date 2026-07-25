# Proposal — gtk-44-design-system

> US: [GTK-44 — Design system y componentes base accesibles](https://linear.app/geoteknia/issue/GTK-44/design-system-y-componentes-base-accesibles)
> Dependencias: GTK-43 (Done). Desbloquea GTK-47, GTK-65, GTK-66, GTK-68–72, GTK-76.

## Why

GTK-43 dejó Tailwind v4, route groups y metadata base, pero no hay librería de componentes reutilizables ni tokens de diseño completos. Sin átomos/moléculas accesibles (WCAG 2.1 AA), cada plantilla futura reinventaría controles, rompería consistencia visual y retrasaría el gate de accesibilidad (GTK-76).

## What Changes

- Extender `@theme` en `app/globals.css` con tokens de color, tipografía, radios y sombras alineados con `docs/design/DESIGN.md`.
- Añadir `lib/shared/cn.ts` (`clsx` + `tailwind-merge`) y dependencias `clsx`, `tailwind-merge`.
- Implementar catálogo Atomic Design: átomos (`Button`, `LinkButton`, inputs, layout `Container`/`Section`/`Grid`, etc.), moléculas (`FormField`, `FieldError`, `Dialog`, `Accordion`, `Tabs`, …) y organismo `StickyCtaBar`.
- **Opción A (recomendada en Linear):** Radix Primitives sin estilos para `Dialog`, `Accordion`, `Tabs`.
- Página interna de catálogo `app/(admin)/dev-componentes/page.tsx` (hereda `noindex` del layout admin).
- Tests Vitest por componente (estados vacío/carga/error) y E2E Playwright + axe en la página de catálogo.
- Barriles `components/atoms|molecules|organisms/index.ts`. **No** crear `components/ui/` plano.

## Capabilities

### New Capabilities

- `design-system-components`: tokens CSS, utilidad `cn`, componentes base accesibles (Atomic Design), página de catálogo admin y criterios de a11y verificables.

### Modified Capabilities

- _(ninguna — `public-front-scaffolding` no cambia requisitos de comportamiento; solo consume los nuevos componentes en US futuras)_

## Impact

- **Código:** `components/atoms|molecules|organisms/`, `lib/shared/cn.ts`, `app/globals.css`, `app/(admin)/dev-componentes/page.tsx`, tests en `tests/unit/components/` y `tests/e2e/gtk44-*.spec.ts`.
- **Dependencias:** `clsx`, `tailwind-merge`; opcionalmente `@radix-ui/react-dialog`, `@radix-ui/react-accordion`, `@radix-ui/react-tabs`.
- **API / contrato:** sin Route Handlers ni Server Actions — **fase 2 del harness omitida**.
- **SEO:** catálogo admin `noindex`; sin JSON-LD.
- **RGPD/PII:** no captura datos; catálogo sin RBAC hasta GTK-68 (riesgo documentado en threat model).
- **Accesibilidad:** base para RNF-A11Y y tickets bloqueados (formularios, layout, auditoría GTK-76).

## Fuera de alcance

- RBAC/2FA del catálogo interno (GTK-68/69).
- Formularios de negocio (GTK-65/66), header/footer público (GTK-47).
- Auditoría WCAG formal de plantillas (GTK-76).
- `StepIndicator` (mencionado en frontend-standards §8.4) — ticket futuro si no se incluye en este alcance.
