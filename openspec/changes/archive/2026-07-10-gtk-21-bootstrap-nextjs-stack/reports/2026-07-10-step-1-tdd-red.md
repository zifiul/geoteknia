# Informe Step 1 — TDD-RED (contrato de implementación)

- Fecha: 2026-07-10
- Cambio: gtk-21-bootstrap-nextjs-stack
- Agente: tdd-engineer (harness fase 3)
- Fase 2 (contrato): **omitida** — la US no toca Route Handlers ni Server Actions.

## Suites creadas y trazabilidad

| Fichero | Requisito cubierto |
|---|---|
| `tests/unit/env.test.ts` | env-validation: "Validación Zod de variables de entorno" (entorno completo parsea; variable ausente lanza error con nombre; enumeración de múltiples ausentes) + **SEC-4** (el mensaje no contiene valores de otras variables) |
| `tests/unit/db.test.ts` | db-client: "Singleton de PrismaClient" (misma instancia entre imports en dev; sin registro en `globalThis` en producción) |
| `tests/e2e/home.spec.ts` | project-scaffolding: "Home responde 200" — **especificado** aquí, se ejecuta en fase 5a (QA) |

## Verificación de RED (salida del runner)

Comando: `npx vitest run tests/unit`

```text
❯ tests/unit/db.test.ts (2 tests | 2 failed)
❯ tests/unit/env.test.ts (4 tests | 4 failed)
Test Files  2 failed (2)
     Tests  6 failed (6)
```

Motivo de fallo: `Cannot find package '@/lib/env'` / `'@/lib/db'` — fallo controlado por módulo de producción inexistente (no error de sintaxis). No hay tests preexistentes en el repo (greenfield).

## Cobertura de los SEC-N del threat model

- **SEC-1** (server-only): no testeable en Vitest node (se mockea `server-only`); se verifica en fase 5b compilando un Client Component que importe `lib/env.ts`. Hueco documentado.
- **SEC-2** (.env sin secretos): verificación por scan (gitleaks/revisión de diff) en 5b.
- **SEC-3** (npm audit): fase 5b.
- **SEC-4**: cubierto por test unitario en `env.test.ts`.
- **SEC-5** (noindex admin): verificación por curl en step 6 (QA).

Categorías del catálogo de abuse cases descartadas: RBAC/2FA, inputs maliciosos, formularios públicos, PII, IA y auditoría — la US es andamiaje sin endpoints, usuarios ni datos (justificado en el threat model).

## Qué debe construir la fase 4

1. `lib/env.ts`: `import 'server-only'`, schema Zod de 8 variables, export `env` tipado, fail-fast enumerando solo nombres de ausentes.
2. `lib/db.ts`: singleton `PrismaClient` sobre `globalThis` solo fuera de producción.
3. Andamiaje completo (Next.js 15, tsconfig estricto, app/, `(admin)` con noindex, prisma mínimo, ESLint frontera, `.env.example`, Playwright config) para el resto de requisitos de `project-scaffolding`.

## Infraestructura creada en esta fase (permitida: no es código de producción)

`package.json` mínimo con script `test`, `vitest.config.ts` y dependencias dev (`vitest`, `typescript`, `@types/node`). La fase 4 lo expandirá al stack completo.
