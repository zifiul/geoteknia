# Informe Step N+2 — Verificación HTTP (middleware / robots)

- Fecha: 2026-07-24
- Cambio: gtk-26-aislamiento-admin-rate-limiting
- Servidor: `npm run dev` → `http://localhost:3001` (puerto 3000 ocupado)
- Nota: no hay Route Handlers nuevos; las pruebas cubren **middleware** y `robots.txt` (requisito GTK-26 / SEC-1–SEC-3).

## Comandos ejecutados

### SEC-1 — Página admin sin sesión → redirect login

```bash
curl.exe -s -D - -o NUL http://localhost:3001/admin
```

**Respuesta relevante:**

```http
HTTP/1.1 307 Temporary Redirect
location: /admin/login?callbackUrl=%2Fadmin
x-robots-tag: noindex, nofollow
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
```

### SEC-2 — API admin sin sesión → 401 JSON

```bash
curl.exe -s -w "\nHTTP_CODE:%{http_code}\n" http://localhost:3001/api/admin/health
```

**Cuerpo:**

```json
{"success":false,"error":{"code":"UNAUTHORIZED","message":"Sesión no válida"}}
```

**HTTP:** 401 — sin direcciones de email en el JSON.

**Cabeceras (SEC-3):**

```http
x-robots-tag: noindex, nofollow
x-content-type-options: nosniff
```

### robots.txt

```bash
curl.exe -s http://localhost:3001/robots.txt
```

```
User-Agent: *
Disallow: /admin
Disallow: /admin/
```

### DAST ligero manual (middleware)

```bash
curl.exe -s -o NUL -w "%{http_code}" -X POST http://localhost:3001/api/admin/health -H "Content-Type: application/json" -d "{\"x\":\"<script>alert(1)</script>\"}"
```

**HTTP:** 401 (no 5xx) — rechazo por falta de sesión antes de llegar a handler de negocio.

## Limpieza

- Sin registros creados en BD.

## Resultado

- Estado del paso N+2: **PASS**
- Bloqueos: ninguno
