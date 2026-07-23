# Proposal — gtk-13-blog-categories-posts-services

> US: [GTK-13 — Blog técnico: categorías, artículos y links a servicios](https://linear.app/geoteknia/issue/GTK-13/blog-tecnico-categorias-articulos-y-links-a-servicios)
> Variante: **Harness DB** | Dependencias: GTK-6, GTK-7, GTK-9, GTK-10, GTK-16, GTK-18, GTK-20 | Desbloquea: GTK-14

## Why

El blog alimenta la captación orgánica de cola larga y refuerza E-E-A-T mediante autoría real vinculada a fichas de equipo. Materializa RF-06 (blog) y §8.2 (linking interno), entidades 7, 8 y la tabla puente 23 del modelo.

## What Changes

- Crear modelos `BlogCategory`, `BlogPost` y `BlogPostService` (M:N artículo↔servicio).
- Añadir back-relations `blogPosts` en `TeamMember` y `blogPostServices` en `Service`.
- Migración `blog_categories_posts_services` (DDL-only, sin data migration).
- Seed de categorías base: fuera de alcance (GTK-17 / DB-14).

## Capabilities

### New Capabilities

- `blog-categories-posts-services`: categorías editoriales, artículos con autoría E-E-A-T y puente de linking interno hacia servicios pillar.

### Modified Capabilities

- `case-studies-team-machinery`: back-relation `blogPosts` en `TeamMember`.
- `services-geo-zones-intersection`: back-relation `blogPostServices` en `Service`.

## Impact

- **Código:** `prisma/schema.prisma`, migración SQL.
- **BD:** tres tablas en Neon EU.
- **API / UI:** ninguno (fases 2 y 4b omitidas).
- **RGPD:** sin PII directa; autoría apunta a `team_members` (PII gestionada allí).
- **Tickets desbloqueados:** GTK-14.

## Fuera de alcance

- Seed de categorías base del blog (GTK-17 / DB-14).
- Índice parcial en `workflow_status` (GTK-19).
- Lógica de dominio en `/lib/`.
