# Tasks — gtk-17-master-seed

> US: GTK-17 — Seed de catálogos maestros | Variante: **Harness DB (SEED)**
> Fases omitidas: contrato API (2), frontend (4b), curl/E2E (sin endpoints).

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] 0.1 Revisar `docs/technical/data-model.md` §9 y descripción Linear GTK-17.
- [x] 0.2 Crear rama `feature/db-gtk-17-master-seed`.
- [x] 0.3 Verificar rama actual y `git status`.

## 1. Datos canónicos y seed

- [x] 1.1 Crear `lib/auth/permissions.ts` con matriz RBAC.
- [x] 1.2 Crear `lib/content/prompt-templates.seed.ts`.
- [x] 1.3 Crear `prisma/seed.ts` idempotente.
- [x] 1.4 Configurar `prisma.seed` en `package.json`.

## 2. Tests (TDD mínimo — lógica en /lib/)

- [x] 2.1 Tests unitarios de matriz RBAC.
- [x] 2.2 Tests unitarios de cobertura de plantillas.

## 3. Revisar y ejecutar tests (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 3.1 Ejecutar `npm run test`, `npm run typecheck` y `npm run lint`.
- [x] 3.2 Ejecutar `npx prisma db seed` dos veces; verificar conteos estables.
- [x] 3.3 Crear informe `openspec/changes/gtk-17-master-seed/reports/2026-07-23-step-3-unit-test-and-db-verification.md`.

## 4. Security scan (Harness DB — ligero)

- [x] 4.1 Revisar diff por secretos; confirmar placeholders sin credenciales reales.
- [x] 4.2 Crear `openspec/changes/gtk-17-master-seed/reports/security.md`.

## 5. Documentación (OBLIGATORIO)

- [x] 5.1 Confirmar alineación con `docs/technical/data-model.md` §9.
- [x] 5.2 Delta spec `master-seed` creada en el change.

## 6. Code review (pre-archive)

- [x] 6.1 Crear `openspec/changes/gtk-17-master-seed/reports/code-review.md` con `Veredicto: APTO`.
