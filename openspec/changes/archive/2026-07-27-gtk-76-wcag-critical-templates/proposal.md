# Proposal — gtk-76-wcag-critical-templates

> US: [GTK-76 — Auditoría y cumplimiento WCAG 2.1 AA en plantillas críticas](https://linear.app/geoteknia/issue/GTK-76/auditoria-y-cumplimiento-wcag-21-aa-en-plantillas-criticas)
> Diseño Stitch (comentario Linear 2026-07-19): proyecto [Geoteknia Web pública B2B](https://stitch.withgoogle.com/projects/9787207935189076711), DS `3480174961756698237`. Referencia cruzada a pantallas de plantilla: GTK-48 (home), GTK-49 (servicio), GTK-51 (geo-landing), GTK-53 (caso), GTK-54/55 (blog), GTK-60 (contacto), GTK-64 (calculadora), GTK-66 (presupuesto), GTK-69 (login admin — proyecto admin `14512274866174259595`).

## Why

RNF-A11Y exige WCAG 2.1 AA en las plantillas que soportan conversión y SEO. Hoy axe solo cubre `/dev-componentes` (GTK-44); las nueve rutas críticas no tienen gate automatizado ni Lighthouse Fase 2 completa.

## What Changes

- Helper E2E compartido (`AxeBuilder` + tags WCAG 2.1 AA) y tests axe en las specs `gtk-*` existentes (sin carpeta `tests/a11y/**` duplicada).
- Correcciones puntuales en átomos/moléculas/organismos según violaciones reales (contraste, foco, ARIA, skip-link, formularios, overlays).
- Ampliación de `LIGHTHOUSE_PHASE1_RELATIVE_PATHS` (Fase 2 GTK-77) y fixtures de seed LHCI para geo-landing y caso publicados.
- Workflow CI que ejecute Playwright E2E (subconjunto a11y) como gate de PR.
- Actualización de `docs/technical/frontend-standards.md` §10.3 y §13.3.

## Capabilities

### New Capabilities

- `wcag-critical-templates`: criterios de aceptación y verificación axe/Lighthouse en las nueve plantillas críticas.

### Modified Capabilities

- (ninguna spec viva de dominio; solo estándares y perf)

## Impact

- **Contrato:** no aplica (sin Route Handlers ni Server Actions nuevos).
- **API:** sin cambios.
- **QA:** E2E Playwright obligatorio (label `Frontend`).

## Fuera de alcance

- Cambios de modelo Prisma, RBAC, auth o tracking GA4.
- Nuevas plantillas o rediseño Stitch (solo ajustes de accesibilidad sobre UI existente).
