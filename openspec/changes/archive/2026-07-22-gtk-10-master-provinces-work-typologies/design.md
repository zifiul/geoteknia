# Design — gtk-10-master-provinces-work-typologies

> Variante Harness DB — `provinces` + `work_typologies` en `prisma/schema.prisma`.

## Enfoque técnico

1. **`Province`:** catálogo de provincias/CCAA con bloque AUDIT; `is_operational` default `false` e índice btree para geo-landings operativas.
2. **`WorkTypology`:** catálogo de tipologías de obra con bloque AUDIT; campo `order` opcional para orden de presentación.
3. **Slugs únicos:** resolución de rutas SEO `/[provincia]/` y filtros por tipología.
4. **Sin FKs salientes:** las back-relations hacia entidades hijas se añaden en tickets DB posteriores.

## Decisiones

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| `is_operational` default `false` | default `true` | Solo provincias explícitamente operativas aparecen en geo-landings (RF-04) |
| Índice en `is_operational` | Sin índice | Filtro frecuente en listados operativos; baja cardinalidad aceptable |
| Sin seed en GTK-10 | Seed inline | Separación en DB-14 según ticket Linear |
| `created_by_id`/`updated_by_id` sin FK a `users` | FK dura | Patrón AUDIT del proyecto (GTK-6/7); FKs opcionales en fase posterior |

## Migración

- Nombre: `master_provinces_work_typologies`
- DDL: 2 tablas, 2 unique indexes (slug), 1 index (`is_operational`)
- Sin data migration (greenfield)

## Threat model (datos)

| Aspecto | Evaluación |
|---|---|
| PII | No — catálogos geográficos y técnicos |
| Región EU | Neon EU vía `DATABASE_URL` / `DIRECT_URL` |
| Soft delete | `deleted_at` en bloque AUDIT para baja lógica |
| IA / prompts | `name`/`default_geology_notes`/`description` pueden usarse como contexto técnico (RNF-IA: no PII) |

## Verificación

- `npx prisma validate`
- `npx prisma migrate dev` aplicado en Neon EU
- `npm run test`, `typecheck`, `lint` en verde
