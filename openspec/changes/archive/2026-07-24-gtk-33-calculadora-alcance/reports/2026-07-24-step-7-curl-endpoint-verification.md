# Informe N+2 — curl endpoint

- Fecha: 2026-07-24
- US: GTK-33
- Servidor: `npm run dev` → `http://localhost:3005` (3000 ocupado)

## 200 — edificación residencial

Request:

```json
{"tipoObra":"edificacion-residencial","plantas":6,"superficie":3200,"provincia":"madrid"}
```

Resultado: `success: true`, `data.boreholes: 9`, `prefill` presente, sin campos de precio.

## 422 — fuera de rango

Request: `superficie: 100` (bajo mínimo seed 500).

Resultado: HTTP 422, `error.code: NO_APPLICABLE_RULE`, `data.prefill` presente.

## 400 — validación

Request con clave extra → HTTP 400 `VALIDATION_ERROR` (cubierto en tests unitarios).

## Limpieza

Opcional: borrar filas `conversion_events` con `event_name = calculator_use` generadas durante la prueba 200.
