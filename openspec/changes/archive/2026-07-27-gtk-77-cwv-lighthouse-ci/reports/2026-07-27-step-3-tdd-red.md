# TDD-RED — gtk-77-cwv-lighthouse-ci

**Fecha:** 2026-07-27

- Añadidos `tests/unit/perf/gtk-77-lighthouse-config.test.ts` y `tests/e2e/gtk-77-cwv-lighthouse.spec.ts`.
- RED verificado antes de implementación (config sin `error`, sin workflow, sin budget).
- Tras implementación: unit 5/5 OK; E2E 6 passed, 1 skipped (home hero dependiente de caché ISR local).
