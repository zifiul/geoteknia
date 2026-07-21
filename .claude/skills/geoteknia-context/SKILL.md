---
name: geoteknia-context
description: Contexto operativo del harness de Geoteknia para el orquestador - cómo leer el backlog de Linear vía MCP, seleccionar la siguiente US, ubicar el estado en disco y transferir contexto mínimo a los subagentes. Úsala al iniciar el harness ("Implementa la siguiente US") o cuando haya que decidir qué US toca.
author: Geoteknia
version: 1.0.0
---

# Skill geoteknia-context

Da al orquestador del harness el contexto mínimo del proyecto y las reglas de selección de trabajo. No implementa nada: solo localiza, selecciona y delega.

## Contexto del proyecto

- **Producto:** web B2B de ingeniería geotécnica (Geoteknia). Monolito modular Next.js 15 + React 19 + TypeScript estricto + Prisma/Neon (EU) + Zod + Auth.js v5. Single-org: aislamiento por RBAC (`admin`, `gestor`, `editor`, `tecnico`), no multi-tenant.
- **Flujo maestro:** `docs/harness-geoteknia.md` (fases 0-8, gates y paralelismos). Léelo si no lo tienes en contexto.
- **Estándares:** `docs/technical/base-standards.md` (transversal), `backend-standards.md`, `frontend-standards.md`, `data-model.md`.
- **SDD:** OpenSpec/OPSX. Los cambios viven en `openspec/changes/<change-name>/` y se archivan en `openspec/changes/archive/`.

## Fuente de verdad del backlog: Linear (vía MCP)

El backlog vive en Linear, accesible por MCP (servidor `linear`, ya configurado). No existe `_backlog.json` local ni debe crearse.

Para seleccionar la siguiente US:

1. Lista las issues del equipo/proyecto activo ordenadas por prioridad (`list_issues` con filtro de estado).
2. Descarta las completadas, canceladas o ya en progreso por otro change activo.
3. Comprueba dependencias: una US es elegible solo si todas sus issues bloqueantes (relaciones "blocked by") están completadas.
4. Entre las elegibles, elige por este orden: criticidad/prioridad de Linear → orden de dependencias (desbloquea más trabajo) → antigüedad.
5. Verifica que no exista ya un change OpenSpec activo para esa US (busca por identificador en `openspec/changes/`).

Si ninguna US es elegible, informa al humano con la lista de bloqueos y detente.

## Estado en disco

| Qué | Dónde |
|---|---|
| Change activo | `openspec/changes/<change-name>/` (`proposal.md`, `design.md`, `tasks.md`, `specs/`, `reports/`) |
| Evidencias QA | `openspec/changes/<change-name>/reports/YYYY-MM-DD-step-*.md` |
| Informe de seguridad | `openspec/changes/<change-name>/reports/security.md` |
| Informe code-review | `openspec/changes/<change-name>/reports/code-review.md` (línea `Veredicto: APTO`) |
| Contrato API | `docs/technical/api-spec.yml` + schemas Zod en `lib/` |

## Transferencia de contexto mínimo

Al delegar una fase en un subagente, pásale SOLO:

1. Identificador y título de la US (con enlace Linear).
2. Ruta del change: `openspec/changes/<change-name>/`.
3. La fase concreta a ejecutar y su entregable esperado (según `docs/harness-geoteknia.md`).
4. Resúmenes relevantes de fases anteriores (máximo 10 líneas por fase).

Nunca pegues artefactos completos en el prompt del subagente: el subagente los lee de disco. Al terminar cada fase, exige un resumen de máximo 10 líneas con: entregables creados (rutas), decisiones tomadas y bloqueos.

## Señales de alerta

- Elegir una US con dependencias sin completar.
- Crear ficheros de backlog locales duplicando Linear.
- Delegar una fase pasando todo el historial de la conversación.
- Avanzar de fase sin el entregable de la anterior.
