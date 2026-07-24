# Tasks — gtk-26-aislamiento-admin-rate-limiting

> US: [GTK-26](https://linear.app/geoteknia/issue/GTK-26/aislamiento-y-endurecimiento-de-admin-noindex-robots-rate-limiting)
> Rama: `feature/backend-gtk-26-aislamiento-admin-rate-limiting`
> Label `Backend`: fase 5a **omite E2E Playwright** (N+3).

## 0. Setup (OBLIGATORIO — primero)

- [x] 0.1 Crear rama `feature/backend-gtk-26-aislamiento-admin-rate-limiting` desde `main`.
- [x] 0.2 Verificar rama activa y `git status` (no pisar trabajo no relacionado).
- [x] 0.3 Abrir change OpenSpec `gtk-26-aislamiento-admin-rate-limiting` con proposal/design/specs/tasks (fase 1 SDD).
- [x] 0.4 **Gate 1 humano:** aprobar proposal + specs + design (+ threat model) antes de TDD.

## 1. Contrato (fase 2)

- [x] 1.1 **Omitida** — sin nuevos Route Handlers ni Server Actions con payloads Zod; registrar en `reports/2026-07-24-phase-2-contract-skip.md`.

## 2. TDD-RED (fase 3)

- [x] 2.1 Tests `lib/security/rate-limit.ts`: N permitidas, N+1 bloqueada, expiración de ventana.
- [x] 2.2 Tests `lib/security/headers.ts`: `SECURITY_HEADERS` y `withNoIndexHeaders`.
- [x] 2.3 Tests `middleware.ts`: sesión válida/ausente × página vs API (mock `auth`); abuse SEC-1/SEC-2/SEC-3.
- [x] 2.4 Tests `app/robots.ts` (snapshot o assert de reglas Disallow).
- [x] 2.5 Tests delta `env-validation` (rate limit defaults y Upstash opcional).
- [x] 2.6 Ejecutar Vitest y adjuntar evidencia RED en `reports/2026-07-24-step-2-tdd-red.md`.

## 3. Implementación backend / infra (fase 4a)

- [x] 3.1 Crear `lib/security/headers.ts` y `lib/security/rate-limit.ts`.
- [x] 3.2 Crear `lib/auth/auth-edge.ts` (config Auth.js Edge-safe) y export usado por middleware.
- [x] 3.3 Crear `middleware.ts` (matcher, auth, headers, redirect vs 401).
- [x] 3.4 Crear `app/robots.ts`.
- [x] 3.5 Ampliar `lib/env.ts`, `.env.example` y helper Edge para leer límites sin `server-only`.
- [x] 3.6 Verificar tests fase 2 en VERDE.

## 4. Implementación frontend (fase 4b)

- [x] 4.1 **Omitida** — sin UI nueva; cabeceras HTTP cubren noindex (label Backend).

## 5. Revisar tests existentes (OBLIGATORIO)

- [x] 5.1 Actualizar `tests/unit/env.test.ts` con variables de rate limit.
- [x] 5.2 Revisar que ningún test asume acceso anónimo a `/admin`.

## 6. Tests unitarios + verificación BD (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 6.1 Sin mutaciones BD esperadas; documentar N/A en informe.
- [x] 6.2 Ejecutar suite Vitest dirigida y completa.
- [x] 6.3 Crear informe `reports/2026-07-24-step-6-unit-test-and-db-verification.md`.

## 7. Pruebas manuales con curl (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 7.1 Arrancar dev server si hace falta.
- [x] 7.2 `curl -I` a `/admin` sin cookie → esperar redirect login.
- [x] 7.3 `curl` a ruta bajo `/api/admin/` sin cookie → 401 JSON.
- [x] 7.4 Verificar `X-Robots-Tag` en respuesta admin.
- [x] 7.5 Informe `reports/2026-07-24-step-7-curl-endpoint-verification.md`.

## 8. E2E Playwright (N+3)

- [x] 8.1 **Omitido — issue label `Backend`**. Flujo visual de login/admin: GTK-69 u otra US frontend.

## 9. Security scan (fase 5b)

- [x] 9.1 Ejecutar skill security-scan; informe `reports/security.md`.

## 10. Code review (fase 6)

- [x] 10.1 Informe `reports/code-review.md` con `Veredicto: APTO` o NO APTO.

## 11. Docs (fase 7)

- [x] 11.1 Actualizar `docs/technical/backend-standards.md` (Edge/Node, doble capa, rate limit MVP).
- [x] 11.2 Informe `reports/2026-07-24-phase-7-docs.md`.

## 12. Archive (fase 8 — tras Gate 2 humano)

- [x] 12.1 Gate `require-code-review` (veredicto APTO en `reports/code-review.md`).
- [x] 12.2 Archive + sync specs vivas (`admin-security-hardening`, `env-validation`).
- [ ] 12.3 Commit y PR: **manual (humano)**.
