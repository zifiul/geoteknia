# Gate 1 — gtk-42-sitemap-robots

**Fecha:** 2026-07-24  
**US:** [GTK-42](https://linear.app/geoteknia/issue/GTK-42/sitemap-xml-dinamico-sitemap-de-imagenes-y-robotstxt)  
**Rama:** `feature/backend-gtk-42-sitemap-robots`  
**Change:** `openspec/changes/gtk-42-sitemap-robots/`

## Artefactos entregados (fase 1 SDD)

| Artefacto | Ruta |
|-----------|------|
| Proposal | `proposal.md` |
| Design + threat model | `design.md` |
| Delta spec | `specs/dynamic-sitemap-robots/spec.md` |
| Tasks | `tasks.md` |

## Resumen

Sitemap dinámico de contenido `publicado`+indexable, sitemap de imágenes con join polimórfico, extensión de `robots.ts` con URL de sitemap. Patrones URL en `buildSiloUrl`. ISR 1h + tag `sitemap` para GTK-40. Contrato omitido; E2E omitido (Backend).

## Threat model — checklist revisión

- [x] T1–T5 revisadas en `design.md`
- [x] SEC-1–SEC-3 aceptados como criterios de test

## Validación OpenSpec

- [x] `openspec validate gtk-42-sitemap-robots --strict` en verde.

## Decisión Gate 1

| Campo | Valor |
|-------|--------|
| **Estado** | **APROBADO** |
| **Aprobado por** | Humano (chat) — 2026-07-24 |
| **Notas** | Fases 2–7 ya ejecutadas en rama; pendiente Gate 2 + archive |
