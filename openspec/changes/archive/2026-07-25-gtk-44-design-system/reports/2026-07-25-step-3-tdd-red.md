# TDD-RED — gtk-44-design-system

- **Fecha:** 2026-07-25
- **Fase:** 3 (gate duro)

## Suites añadidas

- `tests/unit/components/cn.test.ts`
- `tests/unit/components/button.test.tsx` (SEC: `aria-busy` en loading)
- `tests/unit/components/field-error.test.tsx`
- `tests/unit/components/form-field.test.tsx`
- `tests/unit/app/dev-componentes-metadata.test.ts` (SEC-1)
- `tests/e2e/gtk44-design-system-a11y.spec.ts` (teclado + axe)

## Evidencia RED inicial

Tests de componentes fallaron con `document is not defined` hasta configurar `@vitest-environment jsdom` en ficheros `.tsx`. Tras implementación y tokens de contraste, **Vitest 333 tests OK** y **E2E GTK-44 5/5 OK** (con `CI=true` para servidor `next start` actualizado).

## Abuse cases (threat model)

- SEC-1: metadata noindex catálogo — test unitario.
- SEC-2: sin `dangerouslySetInnerHTML` en librería — revisión estática.
- SEC-3: deps Radix fijadas — SCA documentado en `security.md`.
