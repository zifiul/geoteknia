---
name: tdd-core
description: Disciplina TDD-RED para Geoteknia con Vitest - tests primero, verificación obligatoria de RED con salida del runner, convenciones AAA y conductuales, y contrato de implementación para la fase 4. Úsala en la fase 3 del harness, antes de escribir cualquier código de producción.
author: Geoteknia
version: 1.0.0
---

# Skill tdd-core

Regula la fase TDD-RED: se escriben primero los tests que describen el comportamiento de la US, se **ejecutan** y se verifica que fallan por el motivo correcto. Es un gate duro: sin RED verificado no existe fase de implementación.

## Entradas

- Delta specs y `design.md` del change (incluye el threat model — los abuse cases los cubre `security-test-cases`, que se usa junto a esta skill).
- Contrato congelado de la fase 2 (schemas Zod, `api-spec.yml`): los tests importan los schemas reales, nunca redefinen tipos.
- Convenciones de testing del proyecto: `backend-standards.md` §14 y `frontend-standards.md` §13.

## Qué testear (por capa)

| Capa | Tipo de test | Ejemplos |
|---|---|---|
| Validación (Zod) | Unit | Payload válido pasa; payload fuera de schema falla con el issue esperado; normalización (trim, lowercase) |
| Dominio | Unit puro | Invariantes de agregados, value objects, servicios de dominio (cálculo de alcance, transiciones editoriales) |
| Aplicación (casos de uso) | Unit con mocks | Camino feliz, errores tipados (`AppError`), transacciones, dependencias externas mockeadas (Prisma, Anthropic, Resend, Turnstile) |
| Presentación (Route Handlers) | Integración ligera | Status codes correctos (200/201/400/401/403/404/429), formato `success`/`error`, mapeo de errores |
| Componentes | Testing Library | Estados idle/submitting/success/error, validación cliente |
| Flujos E2E | Playwright | Solo se **especifican** en esta fase (escenarios); se ejecutan en la fase 5a |

## Reglas de la fase

1. **Tests conductuales**, patrón **Arrange-Act-Assert**: se testea comportamiento observable, no detalles de implementación. Nada de snapshots amplios.
2. **Un test por regla de la spec:** cada requisito de las delta specs (incluidos los SEC-N) debe poder rastrearse a al menos un test. Anota el ID del requisito en el nombre o comentario del test.
3. **Mocks solo en la frontera:** proveedores externos (Anthropic, Resend, Turnstile, Prisma cuando no haya BD de test). La lógica de dominio se testea sin mocks.
4. **Verificación de RED obligatoria:** ejecuta el runner (`npx vitest run <ficheros>` o el script del proyecto) y comprueba que:
   - Los tests nuevos **fallan** (no error de sintaxis/imports: fallo de aserción o módulo de producción inexistente de forma controlada).
   - Los tests preexistentes **siguen pasando**.
   Adjunta la salida del runner al resumen de fase.
5. **Prohibido tocar código de producción** en esta fase, salvo stubs mínimos (firma vacía que lanza `NotImplementedError`) cuando el test no pueda ni compilar sin ellos.

## Entregable: contrato de implementación

Documento breve (en el resumen de fase o `openspec/changes/<change-name>/reports/tdd-red.md`) con:

- Lista de suites/ficheros de test creados y qué requisito cubre cada uno.
- Salida del runner mostrando el RED (recuento de fallos esperados).
- Qué debe construir la fase 4 para ponerlos en verde (módulos, funciones, handlers).
- Escenarios E2E especificados para la fase 5a.

## Señales de alerta

- Marcar la fase como completada sin haber ejecutado el runner.
- Tests que pasan en RED (test tautológico o mal dirigido) — corrígelos antes de entregar.
- Tests acoplados a implementación (espían métodos internos, dependen de orden de llamadas sin motivo).
- Requisitos de la spec (funcionales o SEC-N) sin test asociado.
