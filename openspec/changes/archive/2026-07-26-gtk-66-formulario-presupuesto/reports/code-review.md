# Code review — gtk-66-formulario-presupuesto

**Fecha:** 2026-07-26

## Alcance

Wizard `/presupuesto`, `StepIndicator`, helpers `lib/forms/*`, refactor ligero `TenderForm.tsx`.

## Checklist

- [x] Patrón envío alineado con `TenderForm` + `interpretLeadSubmitResponse`.
- [x] Validación `budgetLeadSchema`; endpoint correcto `/api/leads/presupuesto`.
- [x] Accesibilidad: labels, `aria-current`, `aria-live`, `role="alert"`.
- [x] Tracking `form_start` / `form_step` / `generate_lead` con slugs.
- [x] UI coherente con tokens Stitch (hero, tarjeta, barra progreso ochre).
- [x] Tests unitarios y E2E críticos en verde.
- [x] `reports/security.md` sin bloqueantes.

## Seguridad

Threat model design.md cubierto; sin PII en datalayer.

## Observaciones menores

- Paso 3 duplica botón enviar (desktop + `StickyCtaBar` móvil) — patrón existente en CTAs; E2E usa `.first()`.

**Veredicto: APTO**
