---
name: qa-mandatory-steps
description: Ejecución de los pasos QA obligatorios de Geoteknia en la fase 5a del harness - tests unitarios con verificación de BD, pruebas curl de endpoints y E2E con Playwright MCP, con sus informes de evidencia. El agente ejecuta, nunca delega. Úsala al verificar una implementación completada.
author: Geoteknia
version: 1.0.0
---

# Skill qa-mandatory-steps

Empaqueta como skill el estándar `docs/technical/openspec-tasks-mandatory-steps.md` (§5-§7), que es la **fuente de verdad**: ante cualquier duda de detalle (plantillas completas de informe, criterios de aplicabilidad), léelo. Esta skill ordena su ejecución dentro de la fase 5a.

## Principio

**El agente ejecuta, nunca delega.** Prohibido pedir al usuario que ejecute tests, `curl` o pruebas de navegador. Si algo no puede ejecutarse (dependencia, credenciales, servicio caído), el paso queda sin completar con el bloqueo documentado.

## Los tres pasos, en orden

Todos los informes se guardan en `openspec/changes/<change-name>/reports/`.

### Paso N+1 — Tests unitarios + verificación de BD (siempre)

1. Captura línea base de BD para las entidades impactadas (conteos, IDs clave) si el cambio toca persistencia — usa la skill `db-state-verify`.
2. Ejecuta tests dirigidos al módulo modificado; después la suite requerida por `openspec/config.yaml` (o la razonable del proyecto: `npm test` / `vitest`).
3. Verifica estado posterior de BD y restaura cualquier mutación.
4. Informe: `YYYY-MM-DD-step-N+1-unit-test-and-db-verification.md` (plantilla en el estándar §5): comandos exactos, recuentos passed/failed/skipped, línea base y validación de BD, estado PASS/FAIL.

### Paso N+2 — Endpoints con `curl` (si hay Route Handlers/webhooks)

1. Arranca o verifica el servidor Next.js y la conexión a BD.
2. Prueba cada endpoint del contrato: camino feliz (GET/POST/PUT/PATCH/DELETE) validando código HTTP, estructura y contenido; y errores esperados (validación Zod → 400, no autorizado → 401/403, inexistente → 404, rate limit/Turnstile si aplica → 429/403).
3. Verifica que los errores respetan el formato unificado `success`/`error`.
4. Limpia/restaura los registros creados por las pruebas.
5. Informe: `YYYY-MM-DD-step-N+2-curl-endpoint-verification.md` con comandos, respuestas relevantes y limpieza realizada.

### Paso N+3 — E2E con Playwright MCP (si hay flujo de usuario)

Aplica con formularios públicos, microconversiones, login/2FA/`/admin`, flujo editorial/ISR o cualquier integración UI visible.

1. Revisa las herramientas Playwright MCP disponibles; arranca o verifica frontend y backend.
2. Navega al flujo, captura snapshot inicial y ejecuta el recorrido completo con interacciones reales.
3. Valida estados de carga/éxito/error, validaciones de formulario y recuperación de errores.
4. Verifica persistencia si el flujo escribe datos; restaura datos y cierra sesiones.
5. Informe: `YYYY-MM-DD-step-N+3-playwright-e2e-verification.md` con escenarios y resultado.

## Cierre de la fase

- Marca los checkboxes correspondientes de `tasks.md` SOLO con la evidencia creada.
- Resumen de fase para el orquestador: estado PASS/FAIL de cada paso, rutas de los informes, BD restaurada sí/no y bloqueos.
- Un FAIL funcional bloqueante devuelve el flujo a la fase 4 (lo decide el orquestador con tu informe).

## Señales de alerta

- Marcar un paso completado sin informe en `reports/`.
- Saltarse `curl` o E2E "porque los unit tests pasan".
- Dejar datos de prueba persistidos sin documentar y restaurar.
- Informes sin los comandos exactos ejecutados (no reproducibles).
