# Informe Step 7 — curl endpoint verification

- Fecha: 2026-07-24
- Cambio: `gtk-32-eventos-conversion`
- Endpoint: `POST http://localhost:3000/api/eventos`
- Servidor: Next.js dev ya en ejecución

## Escenarios

| Caso | Resultado |
|---|---|
| Evento simple válido | **202** `{"success":true,"data":{"recorded":1}}` |
| Lote 2 eventos | **202** `recorded:2` |
| `eventName` inválido + clave extra | **400** `VALIDATION_ERROR` |
| Beacon `Content-Type: text/plain` | **202** |
| Payload con clave `email` (inyección/PII) | **400** `VALIDATION_ERROR` |
| Ráfaga 25 req (IP fija `198.51.100.32`) | **202×20 + 429×5** (límite público default 20) |

## Limpieza BD

- Script: `reports/cleanup-curl.mjs`
- `deleteMany` por `sessionId` in `gtk32-curl-*`
- Resultado: `deleted 24`

## Resultado

- Estado del paso N+2: **PASS**
- Bloqueos: ninguno
