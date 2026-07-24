# Design — gtk-33-calculadora-alcance

> Calculadora pública de alcance geotécnico: motor puro + Route Handler + telemetría `calculator_use`.

## Context

- `calculator_rules` + seed de 4 tipologías con fórmula `{ type: 'linear', base, perFloor?, per1000m2 }` ya en `main` (GTK-15/17).
- `recordConversionEvent` disponible (GTK-32); enum incluye `calculator_use`.
- Catálogos `work_typologies` / `provinces` (GTK-10).
- Envelope HTTP, rate limit (GTK-26) y patrón de Route Handler público (p. ej. `leads/presupuesto`) reutilizables.
- `lib/calculator/` no existe; `backend-standards.md` §5.1 aún documenta `/api/calculator/alcance` (a corregir → `/api/calculadora`).
- Label `Backend`: QA omite E2E Playwright (flujo UI en GTK-64).

## Goals / Non-Goals

**Goals:**

- `POST /api/calculadora` con contrato Zod + `api-spec.yml` congelados (200/400/422/429/500; sin precio).
- Motor puro `estimate` + selección determinista de reglas; repositorio que normaliza Decimal.
- Prefill CTA (`servicio: null` + tipología/provincia/plantas/superficie).
- `calculator_use` best-effort; rate limit; sin Turnstile.
- Fallback sin regla: **422 + prefill** (decisión de negocio por defecto).

**Non-Goals:**

- UI widget (GTK-64).
- Mapeo tipología→servicio en backend.
- Persistencia del cálculo; Turnstile; E2E Playwright en este ticket.
- Fórmulas distintas de `linear` (schema listo para OCP).

## Decisions

| Decisión | Alternativa | Motivo |
|---|---|---|
| Ruta `POST /api/calculadora` | `/api/calculator/alcance` | Coherente con APIs shipped en español (`/api/leads/*`, `/api/eventos`) |
| Separar `estimate.ts` (puro) y `rules-repository.ts` | Un solo servicio con Prisma | AC de pureza + TDD sin BD en el motor |
| Fórmula Zod discriminada `type: 'linear'` | `eval` / JSONPath libre | Seed ya fija la forma; sin RCE; extensible |
| `Math.ceil` + min 1 | `round` / `floor` | Criterio de seguridad geotécnica (nunca menos sondeos) |
| Desempate: área más estrecha → `createdAt` asc → `id` asc | Solo `createdAt` | Determinismo cuando hay solapes de rangos |
| Sin regla → **422 + prefill** | 404 / 200 vacío / solo mensaje | No perder conversión hacia GTK-28; decisión negocio default |
| `prefill.servicio = null` | Inventar mapeo tipología→servicio | Costura de frontend; evita datos incorrectos |
| Provincia no afecta cálculo | Multiplicadores por zona | Reglas actuales solo por tipología; documentar |
| Sin Turnstile | Igual que `/api/eventos` | Idempotente, sin PII ni alta de lead; defensa = RL + Zod |
| `serviceSlug: tipoObra` en evento | Dejar vacío | Atribución por tipología hasta existir mapeo a servicio |
| Envelope `apiSuccess`/`apiError` | Inline | Reutilizar `lib/http/api-envelope.ts` |

### Flujo HTTP

1. Rate limit `calculadora:{ip}` → 429 si no cabe.
2. Parse JSON → `calculatorInputSchema.safeParse` → 400.
3. Resolver tipología y provincia por slug (activos, no soft-deleted) → 400 si falta.
4. Cargar reglas activas de la tipología (`rules-repository`, Decimal→number).
5. `estimate(input, rules)`:
   - `noRule` → 422 `NO_APPLICABLE_RULE` + `prefill`.
   - fórmula inválida → 500.
   - OK → armar `data` (alcance + prefill).
6. Best-effort `recordConversionEvent('calculator_use', …)` solo en 200.
7. `apiSuccess(200, data)`.

### Prefill (costura frontend)

```ts
prefill: {
  servicio: null, // GTK-28 exige servicio; el CTA/UI mapea o pide el campo
  provincia: input.provincia,
  tipoObra: input.tipoObra,
  plantas: input.plantas,
  superficie: input.superficie,
}
```

## Threat model

### Superficie de ataque

- `POST /api/calculadora` público (flooding, scraping de reglas/CTE, payloads malformados).
- Abuso de CPU vía requests repetidos (cálculo ligero pero amplificable).
- Intento de inyectar precio o claves extra en respuesta vía manipulación de BD/admin (fuera de este endpoint, pero el contrato debe filtrar).

### Actores

- Anónimo / bot (scraping, DoS de rate).
- Visitante legítimo de la web pública.
- Atacante que intenta forzar `eval` o fórmulas arbitrarias (mitigado: no se evalúa input de fórmula del cliente; solo JSON de BD validado).

### Datos sensibles implicados

- **Sin PII:** tipología, plantas, superficie, provincia (slug geográfico, no dato personal).
- No Claude, no audit_log, no lead.
- Persistencia colateral: `conversion_events` append-only (slugs + `value=boreholes`).
- Datos EU (Neon).

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Flood / scraping | POST masivo | Medio | Rate limit por IP (`calculadora:{ip}`) |
| T2 | Payload malicioso / claves extra | JSON libre | Medio | Zod `.strict()` → 400 |
| T3 | RCE vía fórmula | `eval`/`Function` | Crítico | Schema discriminado + aritmética pura; nunca evaluar strings |
| T4 | NaN / 500 opaco por regla corrupta | JSON BD inválido | Medio | Parse Zod de fórmula → 500 controlado + log/Sentry |
| T5 | Fuga de precio / datos internos | Campos accidentales en respuesta | Alto (producto) | Contrato cerrado; tests “nunca precio” |
| T6 | Telemetría rompe UX | Excepción en `recordConversionEvent` | Medio | Best-effort; no altera 200 |
| T7 | Enumeración de tipologías/provincias | Slugs | Bajo | 400 genérico; catálogos no secretos |

### Amenazas descartadas

- **Turnstile:** endpoint sin PII ni alta de lead; coste UX injustificado (confirmar negocio; default no).
- **RBAC / audit_log:** API pública de estimación, no acción de portal.
- **IDOR:** no hay recursos por ID de usuario; solo catálogos públicos.
- **Prompt injection / IA:** no hay Claude en este flujo.

### Requisitos de seguridad (criterios de aceptación verificables)

- [ ] SEC-1: Claves desconocidas o tipos inválidos → `400 VALIDATION_ERROR`, sin lectura de reglas ni evento.
- [ ] SEC-2: Superar `publicPerMin` → `429 RATE_LIMITED` + `Retry-After`.
- [ ] SEC-3: Respuesta 200/422 nunca incluye campos de precio.
- [ ] SEC-4: El motor no usa `eval`/`Function`/`new Function` (verificable en código y tests de fórmula).
- [ ] SEC-5: `boreholes_formula` inválido en BD → `500 INTERNAL_ERROR` sin filtrar stack al cliente.
- [ ] SEC-6: Fallo de `recordConversionEvent` no cambia el `200` de estimación.
- [ ] SEC-7: Logs del handler sin PII (solo tipología/provincia/boreholes/códigos).

## Risks / Trade-offs

- Rate limit in-memory por isolate (limitación GTK-26) → Mitigación: documentar; Upstash futuro.
- Sin Turnstile → scraping posible → Mitigación: RL + sin datos sensibles en respuesta.
- `prefill.servicio = null` obliga trabajo en GTK-64 / formulario → Mitigación: documentado en Gate 1.
- 422 + prefill es decisión de negocio provisional → Mitigación: marcada abajo; reversible sin romper 200.
- E2E omitido (label Backend) → Mitigación: curl + unit + GTK-64.

## Migration Plan

- Sin migración Prisma. Despliegue: merge de Route Handler + `lib/calculator`.
- Rollback: eliminar ruta; seed/reglas intactas.
- Docs: alinear `backend-standards.md` §5.1 en fase 7.

## Open Questions

1. **Fallback sin regla (Hallazgo 4):** ¿confirmar **422 + prefill** como definitivo? → **Propuesta default: sí** (no bloquea Gate 1; cambiar a otro código/cuerpo requiere re-OK si se aprueba Gate 1 con este default).
2. **Turnstile opcional:** ¿negocio lo exige contra scraping? → **Default: no**.
3. **Mapeo tipología→servicio:** fuera de alcance backend; ¿quién lo define (GTK-64 / catálogo)? → Señalado para frontend; no bloquea este ticket.
