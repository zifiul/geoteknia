# Contrato congelado — fase 2 (GTK-41)

**Fecha:** 2026-07-24  
**Alcance:** Server Actions en `app/(admin)/contenido/actions.ts`; schemas Zod en `lib/content/**`.

## Schemas Zod (frontera compartida)

| Módulo | Schemas exportados |
|--------|-------------------|
| `lib/content/schemas/seo.ts` | `seoBlockSchema`, `blogCategorySeoSchema`, `faqGroupSeoSchema`, … |
| `lib/content/schemas/editorial.ts` | `editorialCrudBlockSchema` (sin `publicado`/`aprobado`) |
| Por entidad | `create*Schema` / `update*Schema` en cada módulo de dominio |

## Seguridad declarada

- **RBAC:** `content.create` / `content.update` / `content.delete` / `content.read` vía `withPermission`.
- **Config:** `calculator_rules`, `organization_profile`, `contact_channels` → `withAdmin` (rol `admin`).
- **Auditoría:** `content_update` y `delete` en transacción (mustAudit).
- **Sin** Route Handlers HTTP nuevos → `api-spec.yml` sin endpoints adicionales.

## Estado

Contrato **congelado** para implementación y tests TDD.
