# Informe Step 6 — Verificación curl Auth.js

- Fecha: 2026-07-24
- Cambio: gtk-23-autenticacion-credenciales-argon2
- Servidor: `npm run dev` en `http://localhost:3000` (env QA completada en sesión; `.env` local incompleto para Auth — ver nota)

## Preparación

- `npx tsx scripts/gtk23-curl-fixture.ts setup` — usuarios QA con contraseña `Gtk23QaTest1!`
- Cookie jar + CSRF: `GET /api/auth/csrf` con `-c`/`-b` antes de cada `POST`

## Comandos (patrón)

```bash
curl.exe -sS -c jar.txt -b jar.txt http://localhost:3000/api/auth/csrf
curl.exe -sS -c jar.txt -b jar.txt -X POST http://localhost:3000/api/auth/callback/credentials \
  --data-urlencode "csrfToken=<token>" \
  --data-urlencode "email=<email>" \
  --data-urlencode "password=<password>" \
  --data-urlencode "json=true"
curl.exe -sS -b jar.txt http://localhost:3000/api/auth/session
```

## Resultados

| Escenario | HTTP | Observación |
|---|---|---|
| `GET /api/auth/csrf` | 200 | JSON `{ csrfToken }` |
| Credenciales inválidas | 302 | `CredentialsSignin` en log; sin sesión |
| Usuario inactivo | 302 | Rechazo genérico; audit `login_failed` |
| Credenciales válidas | 302 | Sesión activa en `GET /api/auth/session` con `user.id`, `roleName`, `expires` |
| Sesión post-login | 200 | Sin `sessionTokenHash` en JSON (no filtra hash al cliente) |

Ejemplo sesión OK (campos relevantes):

```json
{
  "user": {
    "id": "<uuid>",
    "email": "gtk23-curl-qa@test.geoteknia.local",
    "roleId": "<uuid>",
    "roleName": "admin"
  },
  "expires": "<iso>"
}
```

## Limpieza

- `npx tsx scripts/gtk23-curl-fixture.ts cleanup` — usuarios y sesiones QA eliminados.

## Nota entorno

El `.env` del workspace no incluye todas las variables de `lib/env.ts` (p. ej. `NEXTAUTH_SECRET`, `SESSION_TTL_MINUTES`). Para curl local hace falta completar `.env` según `.env.example` o exportar variables antes de `npm run dev`.

## Resultado

- Estado del paso 6: **PASS**
- Bloqueos: ninguno tras corrección Zod/authorize
