# Design — gtk-69-admin-login-portal

## Enfoque

- **Ruta:** `app/(admin)/admin/login/page.tsx` → URL `/admin/login` (coherente con `middleware` y Auth.js `signIn`).
- **Contenedor RSC:** metadata `noindex`, `resolveLoginCallbackUrl(searchParams)`, pasa `callbackUrl` y mensaje derivado de `?error=` al formulario.
- **Shell Stitch:** `components/organisms/admin/AdminAuthShell.tsx` — split-panel desktop (panel marca + formulario), stack mobile; logo «Geoteknius»; pantallas Stitch `d1a0adba…` (vacío), `bca513c0…` (alerta error/rate limit).
- **Formulario:** `LoginForm` valida con `loginInputSchema` en cliente antes de `useActionState(loginAction)`; TOTP opcional con hint; estados `aria-busy`, `aria-invalid`, `autocomplete` (`email`, `current-password`, `one-time-code`).
- **Post-login:** `router.replace` a callback interno seguro (`/admin` por defecto).
- **Rate limit:** en `loginAction`, `headers()` → IP → `checkRateLimit('login:'+ip, loginPerMin, 60_000)` antes de Zod/signIn.

## Threat model

### Superficie de ataque

- Formulario de login público en URL conocida (`/admin/login`).
- Parámetros `callbackUrl` (open redirect), `error` (reflejo en UI).
- Brute force credenciales / TOTP.

### Actores

- Anónimo externo, bot de credential stuffing.

### Datos sensibles

- Contraseña y TOTP en tránsito (HTTPS); nunca en logs cliente ni `console.log`.

### Amenazas identificadas

| # | Amenaza | Mitigación |
|---|---------|------------|
| T1 | Enumeración de cuentas / 2FA | SEC-1: mensaje genérico `INVALID_CREDENTIALS`; Opción A sin paso 2 revelador |
| T2 | Open redirect tras login | `resolveLoginCallbackUrl` solo paths internos que empiecen por `/` y no `//` |
| T3 | Brute force | `RATE_LIMITED` en `loginAction` + infra GTK-26 |
| T4 | Fuga de contraseña en cliente | sin logging de valores; `type=password` |
| T5 | Indexación del login | `metadata.robots` + cabeceras middleware |

### Requisitos de seguridad (criterios de aceptación)

- [ ] SEC-1: UI no distingue fallo TOTP vs contraseña.
- [ ] SEC-2: `callbackUrl` validado como path interno.
- [ ] SEC-3: rate limit activo en `loginAction`.
- [ ] SEC-4: `/admin/login` accesible sin sesión (middleware).

## Decisiones

- Opción A para 2FA (documentada en Linear y PR).
- Sin Turnstile en login admin.
- Reutilizar átomos GTK-44 (`Input`, `Button`, `FormField`, `FieldError`).

## Integración

- GTK-23 `loginAction`, GTK-24 TOTP en authorize, GTK-26 rate limit env, GTK-44 design system.
