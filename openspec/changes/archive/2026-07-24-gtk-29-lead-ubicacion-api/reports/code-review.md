# Code Review — gtk-29-lead-ubicacion-api

- Fecha: 2026-07-24
- Diff revisado: `feature/backend-gtk-29-lead-ubicacion` (ubicación API, refactor DRY leads/projects, tests, api-spec)
- Evidencia: `reports/2026-07-24-step-2-tdd-red.md`, `step-N+1`, `step-N+2`, `security.md`; E2E omitido (label Backend)

## Alineación spec ↔ implementación

- `POST /api/leads/ubicacion`: Turnstile, rate limit `leads-ubicacion:{ip}`, envelope, 201 `referenceNumber` `UBI-`: OK.
- `locationLeadSchema` + superRefine ubicación/contacto/coords: OK.
- Refactor `generateUniqueReferenceNumber`, `upsertContact`, título proyecto parametrizable; GTK-28 tests en verde: OK.
- Email condicional; `send_location` best-effort: OK.
- SEC-1…SEC-7: tests handler + schema.

## Hallazgos

| Severidad | Área | Hallazgo | Evidencia | Fix sugerido |
|-----------|------|----------|-----------|--------------|
| — | — | Sin hallazgos bloqueantes | Vitest + QA BD PASS | — |

## Sección de seguridad

- Scan 5b: sin hallazgos nuevos; SCA/SAST preexistentes aceptados (`security.md`).
- OWASP: input validation strict, anti-spam, rate limit, sin PII en logs, Prisma parametrizado, handler delgado.

Veredicto: APTO
