# Paso N+1 — unit + BD — gtk-58-licitaciones (2026-07-26)

## Vitest

```
pnpm exec vitest run tests/unit/content/gtk-58-tenders-readers.test.ts
```

- 4 tests OK (lectores + tenderLeadSchema expediente/plataforma).

## Base de datos

- Sin escritura en tests unitarios (mocks Prisma).
- Seed ampliado: `seedTendersMasters` — ejecutar `npx prisma db seed` en local/Neon dev para poblar masters; no ejecutado contra Neon en esta sesión (lectores devuelven vacío hasta seed).

## Regresión

- `pnpm run typecheck` OK.
- `eslint` OK en ficheros del change (TenderForm corregido).
