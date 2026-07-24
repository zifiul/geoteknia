# Code Review — gtk-32-eventos-conversion

- Fecha: 2026-07-24
- Diff revisado: `feature/backend-gtk-32-eventos-conversion` vs `origin/main` (módulo analytics, route eventos, cableado leads, rate-limit cost, docs/tests)
- Evidencia revisada: `reports/2026-07-24-step-2-tdd-red.md`, `step-6-unit-test-and-db-verification.md`, `step-7-curl-endpoint-verification.md`, `security.md`; E2E N+3 omitido (label Backend)

## Alineación spec ↔ implementación

- `POST /api/eventos` → 202, Zod `ingestSchema`, beacon text/plain, lote ≤ 50: OK.
- Rate limit `eventos:{ip}` con `cost=N`: OK.
- Helper append-only best-effort + degradación `leadId` + saneo `pageUrl`: OK.
- Cableado `generate_lead` en `createBudgetLead` post-commit: OK.
- Sin Turnstile (contrato): OK.
- SEC-1…SEC-6 cubiertos por tests unitarios + curl.

## Hallazgos

| Severidad | Área | Hallazgo | Evidencia | Fix sugerido |
|-----------|------|----------|-----------|--------------|
| — | — | Sin hallazgos bloqueantes/mayores | QA PASS + scan | — |

## Sección de seguridad

- Resultado del scan (5b): SAST/secretos/DAST limpios; SCA crítico/alto **preexistente** (next-auth/@auth/core, next, postcss, sharp) — **ACEPTADO** (sin deps nuevas en GTK-32).
- Checklist OWASP: endpoint público con validación strict, sin SQL raw, `server-only` en record-event, sin PII en logs/respuesta, anti-enumeración lead_id, rate limit por eventos.
- Handler delgado; lógica en `/lib/analytics`.

Veredicto: APTO
