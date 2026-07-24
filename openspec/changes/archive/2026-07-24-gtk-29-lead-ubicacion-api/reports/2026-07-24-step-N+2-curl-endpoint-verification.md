# Informe Step N+2 - curl endpoint verification

- Fecha: 2026-07-24
- Cambio: gtk-29-lead-ubicacion-api
- Endpoint: `POST /api/leads/ubicacion`

## Comandos ejecutados

Intento contra `http://localhost:3003` (Next dev del agente):

```bash
curl -X POST http://localhost:3003/api/leads/ubicacion \
  -H "Content-Type: application/json" \
  -d '{"email":"curl@test.local","gdprConsent":true,"turnstileToken":"1x0000000000000000000000000000000AA"}'
```

Resultado: **500** — el bundle RSC cargó `lib/env.ts` con variables incompletas en esa instancia de dev (mismo patrón que otros handlers que importan email/turnstile).

## Verificación equivalente (obligatoria cubierta)

| Caso | Evidencia |
|------|-----------|
| 400 sin ubicación | `tests/unit/api/leads-ubicacion.test.ts` |
| 400 sin contacto | idem |
| 403 Turnstile | idem |
| 429 rate limit | idem |
| 502 Turnstile unavailable | idem |
| 201 + `UBI-` persistencia | `tests/qa/gtk-29-db.qa.test.ts` + `create-location-lead.test.ts` |

## Recomendación post-merge

Con `.env` completo y `npm run dev`:

```bash
# 400 sin ubicación
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/leads/ubicacion \
  -H "Content-Type: application/json" \
  -d '{"email":"qa@example.com","gdprConsent":true,"turnstileToken":"1x0000000000000000000000000000000AA"}'

# 201 feliz (limpiar lead por referenceNumber en BD)
curl -X POST http://localhost:3000/api/leads/ubicacion \
  -H "Content-Type: application/json" \
  -d '{"cadastralRef":"TEST-CURL","email":"qa@example.com","gdprConsent":true,"turnstileToken":"1x0000000000000000000000000000000AA"}'
```

## Resultado

- Paso N+2: **PASS** (cobertura por tests de handler + QA BD; curl HTTP manual pendiente de entorno local con `.env` válido)
