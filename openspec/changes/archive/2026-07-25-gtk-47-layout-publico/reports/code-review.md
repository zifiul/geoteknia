# Code review — gtk-47-layout-publico

- **Fecha:** 2026-07-25
- **Alcance:** layout público, lectura NAP, organismos Stitch, tests.

## Checklist

- [x] Atomic Design: `components/organisms/layout/`, `PhoneLink` en molecules.
- [x] Reutiliza `StickyCtaBar`, `Breadcrumbs`, `buildSiloBreadcrumb*`, `openConsentPreferences`.
- [x] Sin Route Handlers nuevos; `server-only` en organization.
- [x] A11y: skip-link, `aria-current`, menú móvil Dialog + Escape.
- [x] `reports/security.md` revisado — sin hallazgos nuevos críticos en diff.
- [x] Vitest + E2E GTK-47 en verde.

## Seguridad

DTO público sin campos de auditoría; tracking sujeto a consentimiento; sin `dangerouslySetInnerHTML` en NAP.

## Veredicto: APTO
