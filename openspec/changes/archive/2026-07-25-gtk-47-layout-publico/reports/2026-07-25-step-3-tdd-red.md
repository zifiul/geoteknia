# TDD-RED — gtk-47-layout-publico

- **Fecha:** 2026-07-25
- **Tests añadidos:** `organization.test.ts`, `phone-link.test.tsx`, `gtk47-layout-publico.spec.ts`
- **Evidencia RED:** suites nuevas fallaban antes de implementación (módulos/layout inexistentes). Tras implementación: Vitest 378 tests OK; E2E GTK-47 5/5 OK (tras `pnpm run build`).
