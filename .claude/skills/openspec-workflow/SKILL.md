---
name: openspec-workflow
description: Orquestación de las fases del harness de Geoteknia sobre el flujo OpenSpec/OPSX - mapa fase-comando, condiciones de los gates (humanos y duros), gestión del veredicto NO APTO y comprobación require-code-review previa al archive. Úsala al coordinar o retomar el harness de una US.
author: Geoteknia
version: 1.0.0
---

# Skill openspec-workflow

Define cómo se ejecuta el flujo de `docs/harness-geoteknia.md` sobre OpenSpec/OPSX: qué comando o agente dispara cada fase, qué condiciones abren cada gate y qué hacer cuando algo falla.

## Mapa fase → mecanismo

| Fase | Mecanismo | Condición de salida |
|---|---|---|
| 0. Selección de US | Orquestador + skill `geoteknia-context` | US elegida + plan `TodoWrite` |
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
- Implementar (fase 4) con tests aún sin escribir o sin evidencia de RED.
- Considerar "aprobado" un gate humano sin OK explícito.
- Marcar checkboxes de `tasks.md` sin la evidencia que exige `docs/technical/openspec-tasks-mandatory-steps.md`.
