# Code Review — GTK-17 Seed de catálogos maestros

**Fecha:** 2026-07-23  
**Change:** `gtk-17-master-seed`  
**Revisor:** agente (Harness DB SEED)

## Alcance revisado

- `prisma/seed.ts` — seed idempotente
- `lib/auth/permissions.ts` — matriz RBAC canónica
- `lib/content/prompt-templates.seed.ts` — plantillas por pageType
- `package.json` — configuración prisma seed
- Tests unitarios RBAC y plantillas

## Checklist

| Criterio | Estado |
|----------|--------|
| Upsert por clave natural (slug/code/id fijo) | ✅ |
| 7 project_states con flags correctos | ✅ |
| Matriz RBAC: admin=all, gestor=projects.*, editor=content.*+ai.generate, tecnico=projects.read | ✅ |
| 5 provincias operativas | ✅ |
| 4 tipologías de obra | ✅ |
| 7 plantillas (1 por PromptPageType) | ✅ |
| Singleton organization_profile con UUID fijo | ✅ |
| 3 contact_channels (por department) | ✅ |
| 4 calculator_rules (por tipología) | ✅ |
| ai_budget_config global activa | ✅ |
| Idempotencia verificada (seed ×2) | ✅ |
| Sin credenciales reales | ✅ |

## Seguridad

- `reports/security.md` sin hallazgos bloqueantes.

Veredicto: APTO
