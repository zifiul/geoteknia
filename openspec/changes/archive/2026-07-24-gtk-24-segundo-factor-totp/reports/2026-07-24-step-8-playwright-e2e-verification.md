# Informe Step 8 — E2E Playwright (GTK-24)

- Fecha: 2026-07-24
- Cambio: gtk-24-segundo-factor-totp
- Servidor: instancia existente `http://127.0.0.1:3011` (`playwright.gtk24.config.ts`, sin `webServer` duplicado)

## Comandos

```bash
npx playwright install chromium
npx playwright test tests/e2e/gtk24-seguridad.spec.ts --config=playwright.gtk24.config.ts
```

## Escenarios

| # | Escenario | Resultado |
|---|---|---|
| 8.1 | `/perfil/seguridad` sin sesión no permanece en la ruta (redirección) | **PASS** |
| 8.2 | Activar 2FA vía UI + login con TOTP + desactivación | **BLOQUEADO** — no existe `app/(admin)/login` (GTK-69) |
| 8.3 | Login fallido TOTP / desactivación E2E | **BLOQUEADO** — mismo motivo |

## Cobertura sustituta

- Flujo completo enrolamiento → login → desactivación: `tests/qa/gtk24-totp-db.qa.test.ts` + `tests/qa/gtk24-http-login.qa.test.ts`.

## Resultado

- Estado del paso 8: **PASS parcial** (smoke E2E de protección de ruta; flujo UI completo documentado como bloqueado por GTK-69)
- Bloqueos: UI de login ausente
