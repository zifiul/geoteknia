# Tasks — gtk-27-transactional-email-service

> US: GTK-27 — Servicio de email transaccional (Resend + React Email)
> Fases omitidas: contrato API (2 — servicio interno), frontend (4b), curl/E2E (sin endpoint ni UI).

## 0. Setup

- [x] 0.1 Revisar Linear GTK-27 y dependencias (Resend, React Email ya en package.json).
- [x] 0.2 Crear change OpenSpec `gtk-27-transactional-email-service`.

## 1. Servicio lib/email

- [x] 1.1 Añadir `EMAIL_FROM` y `EMAIL_REPLY_TO` a `lib/env.ts` y `.env.example`.
- [x] 1.2 Crear `lib/email/client.ts` (wrapper Resend con retorno tipado).
- [x] 1.3 Crear `lib/email/templates/lead-confirmation-email.tsx` (plantilla React Email).
- [x] 1.4 Crear `lib/email/idempotency.ts` (registro por referenceNumber).
- [x] 1.5 Crear `lib/email/send-lead-confirmation.ts` con Zod + degradación elegante.
- [x] 1.6 Actualizar `lib/email/index.ts` (barrel export).

## 2. Tests (Vitest)

- [x] 2.1 Tests: composición asunto/props, éxito, error sin throw, idempotencia, fallback técnico.

## 3. Verificación local

- [x] 3.1 Ejecutar `npm run test`, `npm run typecheck`, `npm run lint`.

## 4a. Backend (Harness)

- [x] 4a.1 Implementación `lib/email/**` en VERDE (33 tests).

## 5a. QA

- [x] 5a.1 Report `reports/2026-07-23-step-3-unit-test-and-db-verification.md` (PASS).
- [x] 5a.2 curl omitido (sin Route Handlers).
- [x] 5a.3 E2E omitido (GTK-28).

## 5b. Security Scan

- [x] 5b.1 Report `reports/security.md` (LIMPIO; SCA preexistente aceptada).

## 6. Code Review

- [x] 6.1 Report `reports/code-review.md` con `Veredicto: APTO`.

## 7. Docs

- [x] 7.1 `docs/technical/backend-standards.md` — sección email actualizada.
- [x] 7.2 `docs/technical/development_guide.md` — variables `EMAIL_FROM` / `EMAIL_REPLY_TO`.
- [x] 7.3 Spec viva `openspec/specs/transactional-email-service/spec.md`.

## 8. Archive

- [x] 8.1 Archivar change tras `require-code-review` OK → `archive/2026-07-23-gtk-27-transactional-email-service/`.
