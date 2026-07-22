# Informe — GTK-20 — tests unitarios y verificación BD

**Fecha:** 2026-07-22  
**Change:** `gtk-20-case-studies-team-machinery`  
**Variante:** Harness DB

## Tests unitarios

| Comando | Resultado |
|---------|-----------|
| `npm run test` | ✅ 6/6 tests (env + db) |
| `npm run typecheck` | ✅ |
| `npm run lint` | ✅ |

## Prisma

| Comando | Resultado |
|---------|-----------|
| `npx prisma validate` | ✅ Schema válido |
| `npx prisma migrate dev --name case_studies_team_machinery` | ✅ Migración creada y aplicada |
| `npx prisma generate` | ✅ Cliente generado con `CaseStudy`, `TeamMember`, `Machinery`, `CaseStudyTeamMember`, `MachineryService` |

## Criterios de aceptación GTK-20

| Criterio | Estado |
|----------|--------|
| Enum `EquipmentType` con 6 valores | ✅ |
| `case_studies.slug` único | ✅ |
| `team_members.slug` único | ✅ |
| `machinery.slug` único | ✅ |
| `team_members.user_id` único opcional | ✅ |
| FK `team_members.user_id` ON DELETE SET NULL | ✅ |
| PK compuesta `case_study_team_members` con cascade | ✅ |
| PK compuesta `machinery_services` con cascade | ✅ |
| `source_project_id` UUID nullable sin FK Prisma | ✅ |
| Índices FKs, `project_year`, `workflow_status`, `college_registration_no`, `equipment_type` | ✅ |
| Back-relations en Service, Province, WorkTypology, User | ✅ |
| Sin seed (datos pendientes del cliente) | ✅ |

## Verificación BD (`db-state-verify`)

Migración DDL-only (CREATE); sin seed ni datos de prueba insertados. No requiere restauración de línea base.

## Restauración

Sin operaciones de datos de prueba; no requiere restauración.
