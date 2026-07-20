---
name: openspec-workflow
description: Orquestación de las fases del harness de Geoteknia sobre el flujo OpenSpec/OPSX - mapa fase-comando, condiciones de los gates (humanos y duros), gestión del veredicto NO APTO y comprobación require-code-review previa al archive. Úsala al coordinar o retomar el harness de una US.
author: Geoteknia
version: 1.0.0
---

# Skill openspec-workflow

Define cómo se ejecuta el flujo de `docs/harness-geoteknia.md` sobre OpenSpec/OPSX: qué comando o agente dispara cada fase, qué condiciones abren cada gate y qué hacer cuando algo falla.

Para issues con label `DB` (schema/migración/seed/índices sin API/UI), usa la **Variante: Harness DB** de `docs/harness-geoteknia.md` y el mapa reducido de abajo.

## Mapa fase → mecanismo

| Fase | Mecanismo | Condición de salida |
|---|---|---|
| 0. Selección de US | Orquestador + skill `geoteknia-context` | US elegida + plan `TodoWrite` (incl. variante si aplica) |
| 1. SDD | `spec-author` con `/opsx:propose` (o skill `openspec-propose`) | Artefactos validados con `openspec validate --strict` |
| GATE 1 | **Humano** | OK explícito sobre proposal + specs + design (incl. threat model) |
| 2. Contrato | `contract-engineer` | Schemas Zod + `api-spec.yml` commiteados (contrato congelado). Se omite si la US no toca API/mutaciones |
| 3. TDD-RED | `tdd-engineer` | Suites en RED con salida del runner adjunta |
| 4a ∥ 4b. Implementación | `backend-developer` ∥ `frontend-developer` (modo implementador) | Todos los tests de la fase 3 en VERDE |
| 5a ∥ 5b. QA + Scan | `qa-verifier` ∥ `security-verifier` | Reports N+1/N+2/N+3 + `reports/security.md` |
| 6. Code Review | `code-reviewer` | Informe con `Veredicto: APTO` |
| 7. Docs | `docs-keeper` (paralelo con 6) | Docs sincronizados |
| GATE 2 | **Humano** | OK explícito para archive/PR |
| 8. Archive + PR | `spec-author` con `/opsx:archive` + skill `commit` | Change archivado, specs promovidas, PR abierto |

## Mapa fase → mecanismo (Harness DB)

| Fase | Mecanismo | Condición de salida |
|---|---|---|
| 0. Selección | Orquestador + `geoteknia-context` (filtro label `DB`) | Issue DB + plan con `variante = Harness DB` |
| 1. SDD (ligero) | `spec-author` | Artefactos OK; threat model de datos (PII/EU/soft-delete) |
| GATE 1 | **Humano** | OK sobre schema/migración/RGPD antes de tocar Neon |
| 2. Contrato | — | **Omitida** (anotar en resumen) |
| 3. TDD-RED | `tdd-engineer` solo si hay lógica en `/lib` o seed con reglas | RED verificado **o** fase omitida documentada |
| 4a. Prisma | `backend-developer` (modo implementador) | Schema + migrate (+ seed) según `tasks.md` |
| 4b. Frontend | — | **Omitida** |
| 5a. QA | `qa-verifier` + `db-state-verify` | `prisma validate`/`migrate` + report BD; sin curl/E2E |
| 5b. Security Scan | `security-verifier` | `reports/security.md` sin DAST HTTP |
| 6. Code Review | `code-reviewer` | `Veredicto: APTO` (checklist schema) |
| 7. Docs | `docs-keeper` | `data-model.md` actualizado |
| GATE 2 | **Humano** | OK para archive/PR |
| 8. Archive + PR | `spec-author` + `commit` | Igual que harness completo |

## Reglas de los gates

### Gates humanos (paradas obligatorias)

- En GATE 1 y GATE 2 el flujo **SE DETIENE** y se espera OK explícito del humano. No interpretes silencio ni mensajes ambiguos como aprobación.
- Presenta al humano: rutas de artefactos, resumen de 10 líneas y (en Gate 1) el threat model; (en Gate 2) el veredicto del code-review y los reports.

### Gates duros secuenciales

- **Sin GATE 1 aprobado no hay fase 2.**
- **Sin contrato congelado no hay fase 3** (cuando la fase 2 aplica).
- **Sin RED verificado no hay fase 4.** RED verificado = el runner se ejecutó y la salida muestra los tests nuevos fallando.
- **Sin VERDE completo no hay fase 5.**
- **Sin `Veredicto: APTO` no hay archive** (ver comprobación require-code-review).

### Gates en Harness DB

- **Sin GATE 1 no hay fase 4a** (no se migra Neon sin OK del schema).
- Fases 2 y 4b siempre omitidas; la 3 solo si hay lógica testeable (si se omite, documentar en el resumen y pasar a 4a tras Gate 1).
- **Sin `Veredicto: APTO` no hay archive** (igual que el harness completo).
- En 5a, no exigir reports curl/E2E; sí exigir evidencia de validate/migrate y `db-state-verify` cuando hubo escritura.

### Comprobación require-code-review (pre-archive)

Antes de ejecutar `/opsx:archive`, el agente DEBE ejecutar:

```bash
bash ai-specs/scripts/require-code-review.sh <change-name>
```

El script falla (exit != 0) si no existe un informe de code-review en `openspec/changes/<change-name>/reports/` con la línea `Veredicto: APTO`. Si falla, NO se archiva: se informa al orquestador y se vuelve a la fase que corresponda.

## Gestión de NO APTO y fallos

- **Veredicto NO APTO (fase 6):** el orquestador reabre la fase 4 (4a, 4b o ambas según los hallazgos) pasando al implementador SOLO la lista de bloqueantes del informe. Tras corregir, se repiten 5a/5b sobre lo afectado y se vuelve a la fase 6.
- **Hallazgo de seguridad bloqueante (5b):** mismo circuito que NO APTO; el hallazgo se corrige o se justifica por escrito en `reports/security.md` y lo acepta el reviewer en fase 6.
- **Tests que no pueden ejecutarse** (dependencia, credenciales, servicio externo): el paso queda sin completar, se documenta el bloqueo y se escala al humano. Nunca se marca como completado sin evidencia.
- **La implementación revela un defecto de spec/diseño:** se actualiza el artefacto dentro del mismo change (OPSX es iterativo) y se anota en el resumen de fase. Si el cambio altera el alcance aprobado en Gate 1, se vuelve a pedir OK humano.

## Señales de alerta

- Archivar sin ejecutar la comprobación require-code-review.
- Implementar (fase 4) con tests aún sin escribir o sin evidencia de RED (excepto Harness DB con fase 3 omitida y documentada).
- Considerar "aprobado" un gate humano sin OK explícito.
- Marcar checkboxes de `tasks.md` sin la evidencia que exige `docs/technical/openspec-tasks-mandatory-steps.md`.
- En Harness DB: migrar antes de Gate 1; exigir contrato/frontend/E2E en un ticket solo SCHEMA; omitir actualización de `data-model.md`.
