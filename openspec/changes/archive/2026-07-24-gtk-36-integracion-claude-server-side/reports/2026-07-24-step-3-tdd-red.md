# TDD-RED — gtk-36 (fase 3)

Fecha: 2026-07-24

## Suites añadidas

- `tests/unit/ia/generate.test.ts`
- `tests/unit/ia/token-usage.test.ts`
- `tests/unit/ia/anthropic-key-scope.test.ts` (SEC-1)

## Evidencia RED

Ejecutado antes de implementación (`runGeneration`, `token-usage` inexistentes): fallos por módulos ausentes / expectativas no satisfechas.

## Estado actual

Tras fase 4a: `npx vitest run tests/unit/ia/` → **17 passed**.
