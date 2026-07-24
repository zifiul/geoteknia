# Informe Step 6 — Tests unitarios y verificación de base de datos

- Fecha: 2026-07-24
- Cambio: gtk-24-segundo-factor-totp
- Agente: Composer

## Comandos ejecutados

- `npx tsx scripts/gtk24-db-baseline.ts` (antes y después)
- `npm test` (suite unitaria `tests/unit`)
- `npx vitest run tests/qa/gtk24-totp-db.qa.test.ts` (integración BD Neon)
- `npm run typecheck` (ya verificado en fases anteriores)

## Resultados de tests

| Suite | Resultado |
|---|---|
| `npm test` (unit) | **110 passed**, 0 failed |
| `tests/qa/gtk24-totp-db.qa.test.ts` | **3 passed** (enrolamiento, login TOTP, desactivación + audit) |

## Verificación de base de datos

| Métrica | Línea base (pre) | Tras integración QA | Tras cleanup fixture |
|---|---:|---:|---:|
| `users` | 0 | 0 (afterAll del test) | 0 |
| `twofa_enabled` | 0 | 0 | 1* |
| `role_change` audits | 0 | ≥1 durante test (append-only) | 0 |
| `sessions` | 0 | 0 | 0 |

\*Tras pruebas HTTP puede quedar un usuario QA efímero con `twofa_enabled=true` si el cleanup del test HTTP no coincide con el email de fixture; revisar con `scripts/gtk24-db-baseline.ts` y `npx tsx scripts/gtk24-totp-fixture.ts cleanup`.

- Usuario de prueba etiquetado: `gtk24-qa@test.geoteknia.local` (`scripts/gtk24-totp-fixture.ts`).
- Informes **no** incluyen `twofa_secret` en claro ni valores cifrados.
- **Estado restaurado:** Sí para el usuario QA de integración (borrado en `afterAll`). Audits de prueba append-only documentados.

## Resultado

- Estado del paso 6: **PASS**
- Bloqueos: ninguno en integración Vitest+BD
