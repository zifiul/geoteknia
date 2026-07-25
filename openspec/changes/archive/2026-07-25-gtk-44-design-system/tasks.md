# Tasks — gtk-44-design-system

> US: GTK-44 — Design system y componentes base accesibles
> Label Linear: `Frontend` (E2E Playwright **sí**; no es label `Backend`).
> Contrato API: **omitido** — sin Route Handlers ni Server Actions nuevos.

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] 0.1 Revisar `openspec/config.yaml`, `docs/technical/frontend-standards.md` §8 y descripción Linear GTK-44.
- [x] 0.2 Crear rama `feature/frontend-gtk-44-design-system`.
- [x] 0.3 Verificar rama actual y `git status`.
- [x] 0.4 Confirmar que no se pisa trabajo no relacionado.

## 1. TDD-RED: tests primero (gate duro)

- [x] 1.1 Añadir devDeps: `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@axe-core/playwright`.
- [x] 1.2 Crear `tests/unit/components/` (Button loading/aria-busy, FieldError, FormField, cn).
- [x] 1.3 Crear `tests/e2e/gtk44-design-system-a11y.spec.ts` (teclado Dialog/Accordion/Tabs, axe en catálogo).
- [x] 1.4 Ejecutar Vitest y Playwright; guardar evidencia RED en `reports/2026-07-25-step-3-tdd-red.md`.

## 2. Implementación design system

- [x] 2.1 Instalar `clsx`, `tailwind-merge`, Radix dialog/accordion/tabs.
- [x] 2.2 `lib/shared/cn.ts` y tokens en `app/globals.css`.
- [x] 2.3 Átomos, moléculas, `StickyCtaBar`, barriles `index.ts`.
- [x] 2.4 `app/(admin)/dev-componentes/page.tsx` (catálogo de estados).

## 3. Revisar y actualizar tests existentes (OBLIGATORIO)

- [x] 3.1 Confirmar suites GTK-43 / home E2E en verde.
- [x] 3.2 Ajustar solo si el catálogo o estilos globales afectan smoke existente.

## 4. Ejecutar tests unitarios y verificar base de datos (OBLIGATORIO)

- [x] 4.1 `pnpm run test`, `typecheck`, `lint`, `build` en verde.
- [x] 4.2 BD: **NO APLICABLE** (sin escrituras Prisma).
- [x] 4.3 Informe `reports/2026-07-25-step-N+1-unit-test-and-db-verification.md`.

## 5. Pruebas manuales con curl (OBLIGATORIO)

- [x] 5.1 Smoke `GET /dev-componentes` (200 o redirect de guard); robots noindex cuando HTML.
- [x] 5.2 Informe `reports/2026-07-25-step-N+2-curl-endpoint-verification.md` (sin API nueva).

## 6. E2E Playwright (OBLIGATORIO — label Frontend)

- [x] 6.1 `pnpm run test:e2e` en verde.
- [x] 6.2 Informe `reports/2026-07-25-step-N+3-playwright-e2e-verification.md`.
- [x] 6.3 Documentar: *E2E ejecutado — issue label `Frontend`*.

## 7. Security scan (fase 5b)

- [x] 7.1 `pnpm run security:scan`; informe `reports/security.md`.

## 8. Actualizar documentación técnica (OBLIGATORIO)

- [x] 8.1 `frontend-standards.md` §8.4 si añade `StickyCtaBar` al catálogo documentado.
- [x] 8.2 `api-spec.yml` / `data-model.md`: sin cambios.

## 9. Code review (OBLIGATORIO)

- [x] 9.1 `reports/code-review.md` con `Veredicto: APTO`.

## 10. Archive (tras Gate 2 humano)

- [x] 10.1 Archivar change y sincronizar specs vivas.
