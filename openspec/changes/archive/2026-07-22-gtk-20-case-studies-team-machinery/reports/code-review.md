# Code Review — GTK-20 Casos de estudio, equipo técnico y maquinaria

**Fecha:** 2026-07-22  
**Change:** `gtk-20-case-studies-team-machinery`  
**Revisor:** agente (Harness DB)

## Alcance revisado

- `prisma/schema.prisma` — enum `EquipmentType`, modelos `CaseStudy`, `TeamMember`, `Machinery`, `CaseStudyTeamMember`, `MachineryService` y back-relations
- `prisma/migrations/20260722185202_case_studies_team_machinery/migration.sql`
- Artefactos OpenSpec del change

## Checklist schema

| Criterio | Estado |
|----------|--------|
| UUID en PKs | ✅ |
| Modelos alineados con `data-model.md` §4.5 | ✅ |
| Bloques SEO/EDITORIAL/AUDIT según entidad | ✅ |
| `workflow_status` default `borrador_ia` | ✅ |
| Slugs únicos en `case_studies`, `team_members`, `machinery` | ✅ |
| FKs restrict en `case_studies` | ✅ |
| Cascade en puentes M:N | ✅ |
| `user_id` unique + ON DELETE SET NULL | ✅ |
| `source_project_id` sin FK (DB-11) | ✅ |
| Índices declarados en ticket | ✅ |
| Sin seed en este ticket | ✅ |

## Seguridad

- `reports/security.md` sin hallazgos bloqueantes.
- PII de `team_members` documentada en threat model.

Veredicto: APTO
