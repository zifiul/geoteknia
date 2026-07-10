# Informe Step 6 — Verificación manual con curl

- Fecha: 2026-07-10
- Cambio: gtk-21-bootstrap-nextjs-stack
- Agente: qa-verifier (harness fase 5a)

## Servidor

- Comando: `npm run start -- -p 3010`
- Base URL: `http://localhost:3010`

## Comandos ejecutados

```bash
curl.exe -s -o NUL -w "HOME:%{http_code}\n" http://localhost:3010/
curl.exe -s -o NUL -w "ADMIN:%{http_code}\n" http://localhost:3010/admin
curl.exe -s http://localhost:3010/admin
```

## Resultados

| Ruta | HTTP | Observación |
|------|------|-------------|
| `GET /` | **200** | Home mínima operativa |
| `GET /admin` | **200** | Placeholder del portal admin |

### SEC-5 — noindex en admin

El HTML de `/admin` contiene:

```html
<meta name="robots" content="noindex, nofollow"/>
```

**SEC-5: PASS**

## DAST

- **NO APLICABLE** para endpoints de API (la US no expone Route Handlers). Solo páginas estáticas SSG.

## Verificación de base de datos

- No aplica (sin escrituras).

## Resultado

- Estado del paso 6: **PASS**
- Bloqueos: ninguno
