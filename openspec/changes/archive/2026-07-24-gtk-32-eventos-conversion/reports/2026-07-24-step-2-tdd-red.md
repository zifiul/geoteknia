# Informe Step 2 — TDD-RED (GTK-32)

- Fecha: 2026-07-24
- Cambio: `gtk-32-eventos-conversion`
- Agente: tdd-engineer / harness

## Suites

| Fichero | Requisitos | Estado RED |
|---|---|---|
| `tests/unit/analytics/schema.test.ts` | Contrato Zod, SEC-1 enum/strict | **GREEN** (contrato fase 2) |
| `tests/unit/analytics/sanitize.test.ts` | SEC-3 page_url | RED — módulo inexistente |
| `tests/unit/analytics/record-event.test.ts` | append-only, SEC-3/4, best-effort, lote | RED — módulo inexistente |
| `tests/unit/api/eventos.test.ts` | 202/400/429, beacon, SEC-1/2/5 | RED — route inexistente |
| `tests/unit/leads/create-lead.test.ts` | generate_lead + SEC-6 | RED — 1 fallo (sin llamada) |

## Salida del runner

```text
npx vitest run tests/unit/analytics tests/unit/api/eventos.test.ts tests/unit/leads/create-lead.test.ts

Test Files  4 failed | 1 passed (5)
     Tests  6 failed | 12 passed (18)
```

Fallos esperados: `Cannot find package` (sanitize, record-event, route) + aserción `recordConversionEvent` no llamado.

## Contrato de implementación (fase 4a)

1. `lib/analytics/sanitize.ts` — `sanitizePageUrl(url) → string | null`
2. `lib/analytics/record-event.ts` — `recordConversionEvent` / `recordConversionEvents` best-effort, `tx?`, degradar leadId, sanear pageUrl
3. `app/api/eventos/route.ts` — parseo text/JSON, Zod, rate limit por eventos, 202
4. Cablear `generate_lead` en `lib/leads/create-lead.ts` post-commit
5. Actualizar barril `lib/analytics/index.ts`
6. E2E: **omitido** (label Backend)

## Abuse cases SEC cubiertos en tests

- SEC-1 → schema + eventos 400
- SEC-2 → 429 + coste lote ≥ N
- SEC-3 → sanitize + record-event pageUrl
- SEC-4 → leadId → null
- SEC-5 → respuesta solo `recorded`
- SEC-6 → create-lead tolera null de telemetría
