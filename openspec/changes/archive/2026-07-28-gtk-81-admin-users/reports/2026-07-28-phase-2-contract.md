# Fase 2 — Contrato gtk-81-admin-users

**Fecha:** 2026-07-28

Schemas Zod congelados (Server Actions, sin Route Handlers públicos):

| Artefacto | Ruta |
|-----------|------|
| Filtros listado | `lib/admin/user-filters-schema.ts` |
| Formulario alta/edición | `lib/admin/user-form-schemas.ts` |

`docs/technical/api-spec.yml` sin cambios (mutaciones vía Server Actions autenticadas).
