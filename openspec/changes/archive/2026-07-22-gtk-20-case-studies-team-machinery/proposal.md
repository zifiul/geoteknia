# Proposal — gtk-20-case-studies-team-machinery

> US: [GTK-20 — Casos de estudio, equipo técnico y maquinaria](https://linear.app/geoteknia/issue/GTK-20/casos-de-estudio-equipo-tecnico-y-maquinaria)
> Variante: **Harness DB** | Dependencias: GTK-6, GTK-7, GTK-9, GTK-10, GTK-16, GTK-18 | Desbloquea: GTK-13, GTK-15

## Why

Las entidades de prueba de solvencia (E-E-A-T) — `case_studies`, `team_members`, `machinery` y sus tablas puente — demuestran capacidad operativa, refuerzan la firma de informes y alimentan el linking interno hacia servicios y zonas. Materializa RF-03, RF-05, RF-07 y las tablas puente 22 y 24, entidades 6, 9 y 10 del modelo.

## What Changes

- Crear enum `EquipmentType`.
- Crear modelos `CaseStudy`, `TeamMember`, `Machinery` con bloques SEO/EDITORIAL/AUDIT según entidad.
- Crear tablas puente `CaseStudyTeamMember` y `MachineryService` (M:N, PK compuesta, cascade).
- Añadir back-relations en `Service`, `Province`, `WorkTypology` y `User`.
- Columna lógica `case_studies.source_project_id` (FK a `projects` se cierra en DB-11).
- Migración `case_studies_team_machinery` (DDL-only, sin data migration).

## Capabilities

### New Capabilities

- `case-studies-team-machinery`: casos publicables, fichas de equipo y parque de maquinaria con puentes M:N.

### Modified Capabilities

- `services-geo-zones-intersection`: back-relations `caseStudies` y `machineryServices` en `Service`.
- `master-provinces-work-typologies`: back-relations `caseStudies` en `Province` y `WorkTypology`.
- `rbac-identity-audit`: back-relation opcional `teamMember` en `User`.

## Impact

- **Código:** `prisma/schema.prisma`, migración SQL.
- **BD:** cinco tablas + enum en Neon EU.
- **API / UI:** ninguno (fases 2 y 4b omitidas).
- **RGPD:** PII en `team_members` (nombre, bio, colegiación); `client_name` condicionado a `client_is_public`.
- **Tickets desbloqueados:** GTK-13, GTK-15.

## Fuera de alcance

- FK `source_project_id` → `projects` (DB-11).
- Seed de fichas reales de equipo/maquinaria.
- Relaciones hacia `blog_posts`, `public_organism_experience` (tickets posteriores).
- Lógica de dominio en `/lib/`.
