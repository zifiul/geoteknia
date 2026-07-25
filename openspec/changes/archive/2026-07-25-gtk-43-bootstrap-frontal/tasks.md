# Tasks — gtk-43-bootstrap-frontal

> US: GTK-43 — Bootstrap del frontal Next.js 15
> Label Linear: `Frontend` (E2E Playwright **sí**; no es label `Backend`).
> Contrato API: **omitido** — sin Route Handlers ni Server Actions nuevos.

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] 0.1 Revisar `openspec/config.yaml`, `docs/technical/frontend-standards.md` §3 y descripción Linear GTK-43.
- [x] 0.2 Crear rama `feature/frontend-gtk-43-bootstrap-frontal`.
- [x] 0.3 Verificar rama actual y `git status`.
- [x] 0.4 Confirmar que no se pisa trabajo no relacionado.

## 1. TDD-RED: tests primero (gate duro)

- [x] 1.1 Crear `tests/unit/seo/site-url.test.ts` (helpers `resolveMetadataBase`, `buildMediaRemotePatterns`, SEC-1/SEC-3).
- [x] 1.2 Crear/ampliar `tests/e2e/gtk43-front-bootstrap.spec.ts` (home 200 sin errores consola, `/admin`, robots).
- [x] 1.3 Ejecutar Vitest y Playwright; guardar evidencia RED en `reports/2026-07-25-step-3-tdd-red.md`.

## 2. Implementación frontal

- [x] 2.1 Instalar Tailwind v4 (`tailwindcss`, `@tailwindcss/postcss`, `postcss`) y `postcss.config.mjs`.
- [x] 2.2 Crear `app/globals.css` con `@import "tailwindcss"`, `@theme` breakpoints y `prefers-reduced-motion`.
- [x] 2.3 Implementar `lib/seo/site-url.ts`.
- [x] 2.4 Migrar home a `app/(public)/`, layouts `(public)` y `(admin)`, actualizar `app/layout.tsx`, eliminar `app/page.tsx`.
- [x] 2.5 Actualizar `next.config.ts` (images formats + remotePatterns).
- [x] 2.6 Añadir `lighthouserc.cjs` y script `lhci` (presupuesto base, no bloqueante).

## 3. Revisar y actualizar tests existentes (OBLIGATORIO)

- [x] 3.1 Confirmar que `tests/e2e/home.spec.ts` sigue en verde tras mover la home.
- [x] 3.2 Ajustar expectativas si el middleware altera `/admin` (200 vs redirect).

## 4. Ejecutar tests unitarios y verificar base de datos (OBLIGATORIO)

- [x] 4.1 `pnpm run test`, `typecheck`, `lint`, `build` en verde.
- [x] 4.2 BD: **NO APLICABLE** (sin escrituras Prisma).
- [x] 4.3 Informe `reports/2026-07-25-step-N+1-unit-test-and-db-verification.md`.

## 5. Pruebas manuales con curl (OBLIGATORIO)

- [x] 5.1 Smoke `GET /` y `GET /admin` (200 o redirect); comprobar robots en HTML cuando aplique.
- [x] 5.2 Informe `reports/2026-07-25-step-N+2-curl-endpoint-verification.md` (curl N/A para API nueva — solo páginas).

## 6. E2E Playwright (OBLIGATORIO — label Frontend)

- [x] 6.1 `pnpm run test:e2e` en verde.
- [x] 6.2 Informe `reports/2026-07-25-step-N+3-playwright-e2e-verification.md`.
- [x] 6.3 Documentar: *E2E ejecutado — issue label `Frontend`*.

## 7. Security scan (fase 5b)

- [x] 7.1 Ejecutar `pnpm run security:scan` o equivalentes; informe `reports/security.md`.

## 8. Actualizar documentación técnica (OBLIGATORIO)

- [x] 8.1 `frontend-standards.md`: sin cambio estructural (ya contempla `(public)/` y Tailwind); Tailwind v4 documentado en `design.md` del change.
- [x] 8.2 `api-spec.yml` / `data-model.md`: sin cambios.

## 9. Code review (OBLIGATORIO)

- [x] 9.1 `reports/code-review.md` con `Veredicto: APTO`.
- [x] 9.2 Verificación manual: `reports/code-review.md` contiene `Veredicto: APTO` (script bash no ejecutable en Windows/WSL por CRLF).

## 10. Archive (tras Gate 2 humano)

- [x] 10.1 Archivar change y sincronizar specs vivas (`openspec-archive-change`).
