# Tasks — gtk-28-lead-presupuesto-api

> US: [GTK-28](https://linear.app/geoteknia/issue/GTK-28/post-apileads-formulario-de-presupuesto-zod-turnstile-ficha-email)
> Rama: `feature/backend-gtk-28-lead-presupuesto`
> Label `Backend`: fase 5a **omite E2E Playwright** (N+3).

## 0. Setup (OBLIGATORIO — primero)

- [x] 0.1 Crear rama `feature/backend-gtk-28-lead-presupuesto` desde rama base (incluye GTK-26 rate limit si aún no está en `main`).
- [x] 0.2 Verificar rama activa y `git status` (no pisar trabajo no relacionado).
- [x] 0.3 Abrir change OpenSpec `gtk-28-lead-presupuesto-api` con proposal/design/specs/tasks (fase 1 SDD).
- [x] 0.4 **Gate 1 humano:** aprobado 2026-07-24 (proposal + specs + design + threat model).

## 1. Contrato (fase 2)

- [x] 1.1 Añadir `POST /api/leads/presupuesto` y schemas `BudgetLeadInput` / `LeadCreatedResponse` en `docs/technical/api-spec.yml` (reutilizar `ApiErrorEnvelope`).
- [x] 1.2 Congelar `lib/leads/schema.ts` (`budgetLeadSchema`, `contactBaseSchema`, tipos exportados).
- [x] 1.3 Registrar congelación en `reports/2026-07-24-phase-2-contract.md`.

## 2. TDD-RED (fase 3)

- [x] 2.1 `tests/unit/leads/attribution.test.ts` — matriz UTM → `source`.
- [x] 2.2 `tests/unit/leads/reference.test.ts` — formato y charset.
- [x] 2.3 `tests/unit/security/turnstile.test.ts` — válido/inválido/red caída (mock `fetch`).
- [x] 2.4 `tests/unit/leads/create-lead.test.ts` — feliz, dedupe, rollback, colisión ref, gdpr, slug, email no bloquea.
- [x] 2.5 `tests/unit/api/leads-presupuesto.test.ts` — 201/400/403/429/502 (mocks).
- [x] 2.6 Ejecutar Vitest y evidencia RED en `reports/2026-07-24-step-2-tdd-red.md`.

## 3. Implementación backend (fase 4a)

- [x] 3.1 `lib/security/turnstile.ts`, `lib/leads/attribution.ts`, `lib/leads/reference.ts`.
- [x] 3.2 `lib/projects/create-project-from-lead.ts`, `lib/leads/create-lead.ts`, barriles `index.ts`.
- [x] 3.3 `lib/http/api-envelope.ts` (opcional mínimo) y `app/api/leads/presupuesto/route.ts`.
- [x] 3.4 Tests fase 2 en VERDE.

## 4. Implementación frontend (fase 4b)

- [x] 4.1 **Omitida** — sin UI; consumo vía API/curl (label Backend).

## 5. Revisar tests existentes (OBLIGATORIO)

- [x] 5.1 Revisar suites de `env`, `security/rate-limit` tras integración (sin cambios requeridos).

## 6. Tests unitarios + verificación BD (OBLIGATORIO)

- [x] 6.1 Baseline y diff `contacts`/`leads`/`projects` — `tests/qa/gtk-28-db.qa.test.ts` + informe step-6.
- [x] 6.2 Ejecutar Vitest completo o dirigido (`tests/unit` OK).
- [x] 6.3 Informe `reports/2026-07-24-step-6-unit-test-and-db-verification.md`.

## 7. Pruebas manuales con curl (OBLIGATORIO)

- [x] 7.1 Validación → 400; rate limit → 429; 201 feliz documentado en step-7 (403 Turnstile: ver nota secret de prueba).
- [x] 7.2 Informe `reports/2026-07-24-step-7-curl-endpoint-verification.md` (comandos documentados).

## 8. E2E Playwright (N+3)

- [x] 8.1 **Omitido — issue label `Backend`**. E2E del formulario: US frontend futura.

## 9. Security scan (fase 5b)

- [x] 9.1 Skill `security-scan`; informe `reports/security.md` (incl. DAST ligero al endpoint).

## 10. Code review (fase 6)

- [x] 10.1 Informe `reports/code-review.md` con `Veredicto: APTO` o NO APTO.

## 11. Docs (fase 7)

- [x] 11.1 Coherencia `api-spec.yml` / `backend-standards.md` si aplica.
- [x] 11.2 Informe `reports/2026-07-24-phase-7-docs.md`.

## 12. Archive (fase 8 — tras Gate 2 humano)

- [x] 12.1 Gate `require-code-review` (APTO en `reports/code-review.md`).
- [x] 12.2 Archive + sync specs vivas (`public-lead-presupuesto-api`, deltas CRM y email). Gate 2: `reports/2026-07-24-gate-2.md`.
- [ ] 12.3 Commit y PR: **manual (humano)**.
