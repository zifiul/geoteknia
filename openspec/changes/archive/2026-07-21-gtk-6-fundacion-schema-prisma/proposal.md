# Proposal — gtk-6-fundacion-schema-prisma

> US: [GTK-6 — Fundación del esquema Prisma](https://linear.app/geoteknia/issue/GTK-6/fundacion-del-esquema-prisma-datasource-enums-compartidos-y-convencion)
> Variante: **Harness DB** | Dependencias: GTK-21 (bootstrap, archivado) | Desbloquea: GTK-7 y resto de tickets DB

## Why

Tras el bootstrap (GTK-21), `prisma/schema.prisma` solo define `datasource` y `generator` sin enums ni modelos. Los tickets DB posteriores referencian enums transversales (`WorkflowStatus`, `SchemaType`, `AiModel`) y la convención de bloques AUDIT/SEO/EDITORIAL descrita en `docs/technical/data-model.md`. Sin esta fundación, ninguna entidad puede migrarse ni generarse el cliente Prisma tipado.

## What Changes

- Ampliar `datasource db` con `directUrl = env("DIRECT_URL")` para migraciones Neon (pooler + conexión directa).
- Añadir enums Prisma: `WorkflowStatus`, `SchemaType`, `AiModel` (valores y `@map` según ticket Linear).
- Documentar en comentarios del schema la convención de bloques AUDIT, SEO y EDITORIAL (referencia para tickets DB siguientes).
- Crear migración inicial `init_enums_and_datasource` (solo tipos ENUM en PostgreSQL, sin tablas).
- Añadir `DIRECT_URL` a `lib/env.ts`, `.env.example` y delta spec `env-validation`.
- Sin tablas, seeds ni lógica en `/lib`.

## Capabilities

### New Capabilities

- `prisma-schema-foundation`: enums transversales, datasource con `directUrl` y convenciones de bloques documentadas en `schema.prisma`.

### Modified Capabilities

- `env-validation`: incluir `DIRECT_URL` como variable requerida para migraciones Prisma sobre Neon.

## Impact

- **Código:** `prisma/schema.prisma`, `lib/env.ts`, `.env.example`, tests unitarios de env.
- **BD:** primera migración con tres tipos ENUM nativos en PostgreSQL (Neon EU).
- **API / UI:** ninguno (fases 2 y 4b del harness omitidas).
- **RGPD:** sin PII; refuerzo de región EU vía Neon y documentación de datasource.
- **Tickets desbloqueados:** GTK-7 (RBAC), GTK-9–20 (entidades de dominio).

## Fuera de alcance

- Modelos/tables Prisma (llegan en tickets DB siguientes).
- Seed de datos maestros (GTK-17).
- Índices avanzados BRIN/GIN (GTK-19).
- Relaciones Prisma hacia `users` desde campos AUDIT (`created_by_id`, `updated_by_id` permanecen escalares).
- Cambios en `api-spec.yml` o Route Handlers.
