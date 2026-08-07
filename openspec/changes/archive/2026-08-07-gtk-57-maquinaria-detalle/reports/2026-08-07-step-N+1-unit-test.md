# QA — gtk-57-maquinaria-detalle (2026-08-07)

## N+1 Unit tests

```text
pnpm exec vitest run \
  tests/unit/content/machinery-detail-reads.test.ts \
  tests/unit/machinery/ \
  tests/unit/content/gtk-57-published-machinery.test.ts \
  tests/unit/seo/jsonld.test.ts
```

**Resultado:** 5 files, 30 tests passed.

## N+2 Typecheck

```text
pnpm run typecheck
```

**Resultado:** OK (`tsc --noEmit`).

## N+3 E2E Playwright

```text
pnpm exec playwright test tests/e2e/maquinaria-detalle.spec.ts
```

**Resultado:** 1 passed (404 slug inexistente), 1 skipped (sin maquinaria publicada en BD).

## Lint

`pnpm run lint` reporta errores preexistentes en otros módulos (admin, tiptap, hooks). El diff de este change no introduce errores nuevos; un warning de import no usado en `machinery.ts` corregido.

## Verificación manual

- Ruta `/maquinaria/[slug]` implementada; requiere equipo publicado en BD para smoke visual con `pnpm dev`.
