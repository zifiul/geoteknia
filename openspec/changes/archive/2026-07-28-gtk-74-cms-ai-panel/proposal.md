# GTK-74 — Panel de generación IA en el editor CMS

**Linear:** [GTK-74](https://linear.app/geoteknia/issue/GTK-74)

## Why

Los editores necesitan generar y regenerar contenido SEO asistido por Claude dentro del mismo flujo del editor GTK-73, consumiendo `POST /api/admin/ia/generar` (GTK-38) sin duplicar persistencia (GTK-41).

## What

- Pestaña «Generar con IA» en `ContentEditor` (solo con permiso `ai.generate`).
- Componentes `AiGenerateForm`, `AiOutputPreview`, `SectionRegenerateMenu`, `AiBudgetNotice`, orquestados por `AiGeneratePanel`.
- Fusión de salida / regeneración por sección hacia el estado del formulario del editor.
- UI alineada con pantallas Stitch Oleada A5 (comentario Linear 2026-07-20).

## Impact

- Frontend admin (`components/organisms/admin/cms/**`, `lib/cms/ia/**`).
- Sin cambios de API, Prisma ni `api-spec.yml`.
