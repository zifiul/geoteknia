# Proposal — gtk-10-master-provinces-work-typologies

> US: [GTK-10 — Maestros y taxonomías: provincias y tipologías de obra](https://linear.app/geoteknia/issue/GTK-10/maestros-y-taxonomias-provincias-y-tipologias-de-obra)
> Variante: **Harness DB** | Dependencias: GTK-6, GTK-7, GTK-9 | Desbloquea: geo-landings, casos, leads, proyectos, calculadora, service×zona

## Why

Los catálogos `provinces` y `work_typologies` son referenciados transversalmente por geo-landings, casos, leads, proyectos, la calculadora y las páginas servicio×zona. Deben existir antes que esas entidades. Materializa la sección A (entidades 1 y 2) del modelo y los requisitos RF-03, RF-04 y RF-Q1.

## What Changes

- Crear modelo `Province` con bloque AUDIT, slug único, `is_operational` default `false` e índice en `is_operational`.
- Crear modelo `WorkTypology` con bloque AUDIT y slug único.
- Migración `master_provinces_work_typologies` (DDL-only, sin data migration).
- Sin seed en este ticket (catálogos operativos en DB-14).

## Capabilities

### New Capabilities

- `master-provinces-work-typologies`: catálogos maestros de provincias/CCAA y tipologías de obra.

### Modified Capabilities

- Ninguna.

## Impact

- **Código:** `prisma/schema.prisma`, migración SQL.
- **BD:** dos tablas en Neon EU.
- **API / UI:** ninguno (fases 2 y 4b omitidas).
- **RGPD:** sin PII; datos técnicos (`name`, `default_geology_notes`) pueden usarse en prompts de contexto geotécnico (no PII).
- **Tickets desbloqueados:** entidades hijas que referencian provincias y tipologías.

## Fuera de alcance

- Relaciones 1:N hacia entidades hijas (`geo_zones`, `case_studies`, `leads`, etc.) — se declaran en tickets DB de cada entidad hija.
- Seed de provincias operativas y tipologías (DB-14).
- Lógica de dominio en `/lib/`.
