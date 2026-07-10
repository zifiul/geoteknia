# Delta spec — db-client

> Origen: GTK-21 — CHORE-01 — Bootstrap del proyecto Next.js 15 y stack base

## ADDED Requirements

### Requirement: Singleton de PrismaClient en lib/db.ts
El módulo `lib/db.ts` SHALL exportar una única instancia de `PrismaClient` reutilizada entre hot-reloads en desarrollo mediante el patrón singleton sobre `globalThis`, evitando la proliferación de conexiones en entornos serverless (Neon).

#### Scenario: Misma instancia entre imports repetidos
- **WHEN** el módulo `lib/db.ts` se importa dos veces (simulando hot-reload con reset del registro de módulos)
- **THEN** ambas importaciones devuelven la misma instancia de `PrismaClient`

#### Scenario: En producción no se contamina globalThis
- **WHEN** `NODE_ENV` es `production` y se importa `lib/db.ts`
- **THEN** la instancia se crea sin registrarse en `globalThis` (el cacheo global aplica solo fuera de producción)
