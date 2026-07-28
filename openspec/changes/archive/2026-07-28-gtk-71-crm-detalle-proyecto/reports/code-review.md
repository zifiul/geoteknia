# Code review — gtk-71-crm-detalle-proyecto

## Alcance revisado

- RSC `app/(admin)/(portal)/admin/proyectos/[id]/page.tsx` + `loading.tsx`
- Organismos CRM detalle + `lib/projects/state-transition-targets.ts`
- Tests unitarios y E2E GTK-71
- `docs/technical/frontend-standards.md`

## Seguridad

Alineado con `reports/security.md`. UI oculta `projects.assign` / `projects.delete` para técnico.

## Observaciones menores

- `completeMilestoneAction` no llama `revalidatePath` (GTK-35); `router.refresh()` mitiga en cliente.

**Veredicto: APTO**
