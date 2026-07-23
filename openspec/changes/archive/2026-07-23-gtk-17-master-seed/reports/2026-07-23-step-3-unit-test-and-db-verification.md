# Informe — GTK-17 — tests unitarios y verificación BD

**Fecha:** 2026-07-23  
**Change:** `gtk-17-master-seed`  
**Variante:** Harness DB (SEED)

## Tests unitarios

| Comando | Resultado |
|---------|-----------|
| `npm run test` | ✅ 13/13 tests |
| `npm run typecheck` | ✅ |
| `npm run lint` | ✅ |

## Seed idempotente

| Comando | Resultado |
|---------|-----------|
| `npx prisma db seed` (1ª ejecución) | ✅ |
| `npx tsx scripts/seed-counts.ts` | ✅ conteos capturados |
| `npx prisma db seed` (2ª ejecución) | ✅ |
| `npx tsx scripts/seed-counts.ts` | ✅ conteos idénticos |

### Conteos estables (antes = después)

| Entidad | Conteo |
|---------|--------|
| `project_states` | 7 |
| `roles` | 4 |
| `permissions` | 17 |
| `role_permissions` | 29 |
| `provinces` operativas | 5 |
| `work_typologies` | 4 |
| `prompt_templates` | 7 |
| `organization_profile` | 1 |
| `contact_channels` | 3 |
| `calculator_rules` | 4 |
| `ai_budget_config` global | 1 |
| `project_states` con `is_initial` | 1 |

## Criterios de aceptación GTK-17

| Criterio | Estado |
|----------|--------|
| Seed idempotente (conteos estables ×2) | ✅ |
| 7 `project_states` con flags correctos | ✅ |
| Único estado `is_initial` (`lead-nuevo`) | ✅ |
| Matriz RBAC según reglas por rol | ✅ |
| Singleton `organization_profile` | ✅ |
| ≥1 `contact_channel` por departamento (3) | ✅ |
| Plantillas IA por `PromptPageType` (7) | ✅ |
| Reglas calculadora por tipología (4) | ✅ |
| Config global `ai_budget_config` | ✅ |

## Verificación BD (`db-state-verify`)

Seed DML idempotente sobre catálogos de configuración. Conteos estables tras segunda ejecución; no requiere restauración (datos maestros legítimos).

## Restauración

No aplica — el seed inserta datos maestros de producción esperados.
