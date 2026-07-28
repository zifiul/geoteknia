# GTK-75 — Flujo editorial CMS (revisión, publicación, ISR)

**Linear:** [GTK-75](https://linear.app/geoteknia/issue/GTK-75)

## Why

Los editores y aprobadores necesitan transiciones de workflow, historial de versiones y publicación (inmediata o programada) en el editor GTK-73, con rigor YMYL y sin desplegar código.

## What

- UI Stitch Oleada A5 (comentario Linear 2026-07-20): barra workflow, stepper, modales aprobar/rechazar/publicar/programar/despublicar, historial de versiones (lista sin diff visual).
- `listContentRevisions()` en `lib/content/revisions.ts`.
- Server Actions `scheduleContentPublication` / `cancelScheduledPublication` (escritura de `scheduledPublishAt`).
- Componentes `WorkflowActions`, `VerificationNotice`, `RevisionHistory`, `PublishDialog`, `SchedulePublishDialog` integrados en `ContentEditor`.
- Consumo de las 6 Server Actions de transición ya existentes (sin modificar su lógica).

## Impact

- `lib/content/**`, `lib/cms/editor/**`, `components/organisms/admin/cms/**`, tests unitarios y E2E.
- Sin Route Handlers nuevos ni `api-spec.yml`.
- `data-model.md`: documentar escritura activa de `scheduledPublishAt`.
