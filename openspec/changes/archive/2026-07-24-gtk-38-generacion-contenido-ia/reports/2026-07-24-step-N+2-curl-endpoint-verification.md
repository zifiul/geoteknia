# Informe Step N+2 — curl `POST /api/admin/ia/generar`

- Fecha: 2026-07-24
- Cambio: gtk-38-generacion-contenido-ia

## Estado

**PENDIENTE de ejecución en entorno con sesión admin** — la invocación HTTP directa al endpoint admin fue bloqueada por política de seguridad del agente (mutación en ruta autenticada). Comandos preparados para ejecución humana o CI con cookie de sesión.

## Servidor

- `npm run dev` → `http://localhost:3006` (puerto 3000 ocupado)

## Comandos recomendados

### 401 sin sesión

```bash
curl.exe -i -X POST http://localhost:3000/api/admin/ia/generar \
  -H "Content-Type: application/json" \
  -d "{}"
```

Esperado: `401`, `success: false`, `invalid_session`.

### 400 validación

```bash
curl.exe -i -X POST http://localhost:3000/api/admin/ia/generar \
  -H "Content-Type: application/json" \
  -H "Cookie: <authjs.session-token>" \
  -d "{\"pageType\":\"service\",\"inputs\":{}}"
```

Esperado: `400` `VALIDATION_ERROR` (inputs incompletos).

### 403 rol gestor

Sesión de usuario `gestor` → `403` `forbidden`.

### 429 presupuesto

Con `ai_budget_config` activo y gasto ≥ tope → `429` `BUDGET_EXCEEDED` sin fila nueva.

### 201 éxito (editor + plantilla seed + mock/stub Anthropic en dev)

Body válido según plantilla `service` en seed.

## Limpieza

Tras 201, borrar filas de prueba en `ai_generations` / `ai_token_usage` o usar IDs de QA dedicados.

## Resultado

- Estado N+2: **PENDIENTE** — requiere ejecución con credenciales de portal
