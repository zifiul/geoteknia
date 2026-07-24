# Tasks — gtk-32-eventos-conversion

> US: [GTK-32](https://linear.app/geoteknia/issue/GTK-32/post-apieventos-ingesta-de-eventos-de-conversion-espejo-de-ga4)
> Rama: `feature/backend-gtk-32-eventos-conversion`
> Label `Backend`: fase 5a **omite E2E Playwright** (N+3). E2E del flujo GTM/beacon: US frontend (p. ej. GTK-46).

## 0. Setup (OBLIGATORIO — primero)

- [x] 0.1 Crear rama `feature/backend-gtk-32-eventos-conversion` desde `main`.
- [x] 0.2 Verificar rama activa y `git status` (no pisar trabajo no relacionado).
- [x] 0.3 Abrir change OpenSpec `gtk-32-eventos-conversion` con proposal/design/specs/tasks (fase 1 SDD).
- [x] 0.4 **Gate 1 humano:** aprobado 2026-07-24 (proposal + specs + design + threat model).

## 1. Contrato (fase 2)

- [x] 1.1 Añadir `POST /api/eventos` y schemas de evento/lote/respuesta en `docs/technical/api-spec.yml` (reutilizar `ApiErrorEnvelope`; documentar beacon + lote ≤ 50; seguridad: pública, sin Turnstile, rate limit por eventos).
- [x] 1.2 Congelar `lib/analytics/schema.ts` (`conversionEventSchema`, `ingestSchema`, tipos exportados).
- [x] 1.3 Registrar congelación en `reports/2026-07-24-phase-2-contract.md`.

## 2. TDD-RED (fase 3)

- [x] 2.1 `tests/unit/analytics/sanitize.test.ts` — `page_url` sin query/fragment; URLs inválidas.
- [x] 2.2 `tests/unit/analytics/schema.test.ts` — enum 8 valores, `.strict()`, coerce `value`/`formStep`, lote > 50, overflow.
- [x] 2.3 `tests/unit/analytics/record-event.test.ts` — insert válido; `leadId` inexistente → null; best-effort; lote N; sin `occurredAt` cliente.
- [x] 2.4 `tests/unit/api/eventos.test.ts` — 202 simple/lote, 400, beacon `text/plain`, 429 (mock rate limit). Abuse: SEC-1..SEC-5.
- [x] 2.5 Ampliar `tests/unit/leads/create-lead.test.ts` — llama `generate_lead`; fallo telemetría no rompe alta (SEC-6).
- [x] 2.6 Ejecutar Vitest y evidencia RED en `reports/2026-07-24-step-2-tdd-red.md`.

## 3. Implementación backend (fase 4a)

- [x] 3.1 `lib/analytics/sanitize.ts`, `schema.ts`, `record-event.ts`, `index.ts`.
- [x] 3.2 `app/api/eventos/route.ts` (parseo tolerante, rate limit por eventos, 202).
- [x] 3.3 Cablear `recordConversionEvent('generate_lead')` en `lib/leads/create-lead.ts` post-commit.
- [x] 3.4 Tests fase 3 en VERDE.

## 4. Implementación frontend (fase 4b)

- [x] 4.1 **Omitida** — sin UI; consumo vía API/curl/beacon (label Backend).

## 5. Revisar tests existentes (OBLIGATORIO)

- [x] 5.1 Revisar suites de leads/rate-limit tras integración; `checkRateLimit` con `cost` opcional; cleanup GTK-28 QA de conversion_events.

## 6. Tests unitarios + verificación BD (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 6.1 Baseline/diff `conversion_events` (`db-state-verify`); restaurar filas de prueba.
- [x] 6.2 Ejecutar Vitest dirigido + suite unitaria razonable.
- [x] 6.3 Informe `reports/2026-07-24-step-6-unit-test-and-db-verification.md`.

## 7. Pruebas manuales con curl (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 7.1 Feliz 202 (simple + lote); 400 inválido; beacon `text/plain`; 429 rate limit; limpiar filas.
- [x] 7.2 Informe `reports/2026-07-24-step-7-curl-endpoint-verification.md`.

## 8. E2E Playwright (N+3)

- [x] 8.1 **Omitido — issue label `Backend`**. E2E GTM/beacon: US frontend (GTK-46 u otra acordada).

## 9. Security scan (fase 5b)

- [x] 9.1 Skill `security-scan`; informe `reports/security.md` (SAST/SCA/secrets + DAST ligero al endpoint).

## 10. Code review (fase 6)

- [x] 10.1 Informe `reports/code-review.md` con línea `Veredicto: APTO` o `NO APTO`.

## 11. Docs (fase 7)

- [x] 11.1 Coherencia `api-spec.yml` / referencias a `data-model.md` § conversion_events si aplica.
- [x] 11.2 Informe `reports/2026-07-24-phase-7-docs.md`.

## 12. Archive (fase 8 — tras Gate 2 humano)

- [x] 12.1 Gate `require-code-review` (APTO en `reports/code-review.md`).
- [x] 12.2 Archive + sync specs vivas (`public-eventos-api`, delta `public-lead-presupuesto-api`). Gate 2: `reports/2026-07-24-gate-2.md`.
- [ ] 12.3 Commit y PR: **manual (humano)**.
