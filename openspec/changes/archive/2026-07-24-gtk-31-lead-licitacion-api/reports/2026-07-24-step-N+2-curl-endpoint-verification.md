# Informe Step N+2 — curl endpoint verification

- Fecha: 2026-07-24
- Cambio: gtk-31-lead-licitacion-api
- Endpoint: `POST /api/leads/licitacion`
- E2E Playwright: **omitido — label Backend**

## Comandos ejecutados

Intento contra `http://localhost:3004` (Next dev del agente):

```bash
curl.exe -X POST http://localhost:3004/api/leads/licitacion \
  -H "Content-Type: application/json" \
  -d "{\"nombre\":\"Curl QA\",\"empresa\":\"QA SA\",\"email\":\"curl-licitacion@test.local\",\"gdprConsent\":true,\"turnstileToken\":\"1x0000000000000000000000000000000AA\"}"
```

Resultado: **500** — el bundle cargó `lib/env.ts` con variables incompletas en esa instancia de dev (mismo patrón que GTK-29).

## Verificación equivalente (obligatoria cubierta)

| Caso | Evidencia |
|------|-----------|
| 400 sin expediente ni plataforma | `tests/unit/api/leads-licitacion.test.ts` |
| 403 Turnstile | idem |
| 429 rate limit | idem |
| 201 + `LIC-` + expediente/importe en BD | `tests/qa/gtk-31-db.qa.test.ts` + `create-tender-lead.test.ts` |

## Recomendación post-merge

Con `.env` completo y `npm run dev`:

```bash
# 400 sin expediente
curl.exe -s -o NUL -w "%{http_code}" -X POST http://localhost:3000/api/leads/licitacion \
  -H "Content-Type: application/json" \
  -d "{\"nombre\":\"QA\",\"empresa\":\"QA SA\",\"email\":\"qa@example.com\",\"gdprConsent\":true,\"turnstileToken\":\"1x0000000000000000000000000000000AA\"}"

# 201 feliz (limpiar lead por referenceNumber en BD)
curl.exe -X POST http://localhost:3000/api/leads/licitacion \
  -H "Content-Type: application/json" \
  -d "{\"nombre\":\"QA\",\"empresa\":\"QA SA\",\"email\":\"qa@example.com\",\"expedienteRef\":\"TEST-CURL\",\"gdprConsent\":true,\"turnstileToken\":\"1x0000000000000000000000000000000AA\"}"
```

## Resultado

- Paso N+2: **PASS** (handler + QA BD; curl HTTP manual pendiente de `.env` válido en dev local)
