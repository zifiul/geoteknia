# Design — gtk-20-case-studies-team-machinery

> Variante Harness DB — `case_studies`, `team_members`, `machinery`, `case_study_team_members`, `machinery_services` en `prisma/schema.prisma`.

## Enfoque técnico

1. **`CaseStudy`:** contenido publicable RF-03 con FKs restrict a `services`, `provinces`, `work_typologies`; bloques SEO/EDITORIAL/AUDIT completos; `source_project_id` UUID nullable sin FK (DB-11).
2. **`TeamMember`:** ficha E-E-A-T RF-05; slug único; bloque SEO reducido (solo slug); enlace opcional 1:1 con `users` (`user_id` unique).
3. **`Machinery`:** parque RF-07; enum `EquipmentType`; bloque SEO reducido (solo slug); `in_situ_tests` JSON para ensayos compatibles.
4. **`CaseStudyTeamMember`:** puente M:N con `role` opcional; cascade en FKs.
5. **`MachineryService`:** puente M:N maquinaria↔servicio; cascade en FKs.
6. **Back-relations:** `caseStudies` en Service/Province/WorkTypology; `machineryServices` en Service; `teamMember` en User.

## Decisiones

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| `onDelete: Restrict` en FKs de `case_studies` | Cascade | Proteger catálogos maestros y servicios |
| `onDelete: Cascade` en puentes | Restrict | Limpiar relaciones al borrar caso/miembro/máquina |
| `onDelete: SetNull` en `team_members.user_id` | Cascade | Desvincular ficha sin borrar usuario |
| `source_project_id` sin FK Prisma | FK dura ahora | Tabla `projects` llega en DB-11 |
| SEO parcial en team/machinery | Bloque SEO completo | Spec Linear: solo slug en team_members y machinery |
| Sin seed | Seed inline | Datos reales pendientes del cliente |

## Migración

- Nombre: `case_studies_team_machinery`
- DDL: enum `EquipmentType`, 5 tablas, 3 unique slug, unique `team_members.user_id`, PKs compuestas en puentes
- Índices: FKs de case_studies, `project_year`, `workflow_status`, `college_registration_no`, `equipment_type`
- Sin data migration (greenfield)

## Threat model (datos)

| Aspecto | Evaluación |
|---|---|
| PII | Sí — `team_members.full_name`, `bio`, `college_registration_no`; base legal consentimiento/relación laboral |
| `client_name` | Solo visible si `client_is_public=true` |
| Región EU | Neon EU vía `DATABASE_URL` / `DIRECT_URL` |
| Soft delete | `deleted_at` en bloque AUDIT |
| IA / prompts | Datos técnicos del caso sí; nunca `client_name` ni PII del equipo (RNF-IA) |
| Enlace usuario | `user_id` opcional 1:1; no exponer credenciales en ficha pública |

## Verificación

- `npx prisma validate`
- `npx prisma migrate dev` aplicado en Neon EU
- `npm run test`, `typecheck`, `lint` en verde
