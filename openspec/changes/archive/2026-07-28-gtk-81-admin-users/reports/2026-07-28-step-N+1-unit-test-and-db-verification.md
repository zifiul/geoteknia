# Paso N+1 — gtk-81-admin-users

**Fecha:** 2026-07-28

## Unit

```text
pnpm exec vitest run tests/unit/admin/users-guardrails.test.ts tests/unit/admin/users-session-revoke.test.ts
```

Resultado: 7 tests passed.

## BD

Sin migraciones. Pruebas de mutación de usuarios: ejecutar manualmente en entorno con Neon solo si se valida flujo completo de alta/desactivación; tests unitarios mockean Prisma para revocación de sesiones.
