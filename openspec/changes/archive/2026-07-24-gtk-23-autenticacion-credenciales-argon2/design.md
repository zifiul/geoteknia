# Design — gtk-23-autenticacion-credenciales-argon2

> Backend de autenticación del portal `/admin` con Auth.js v5 (FEAT-04). Sin UI ni TOTP completo.

## Context

- Modelo `User` / `Session` / `Role` / `AuditLog` ya existe (GTK-7).
- `recordAudit` + whitelist de metadata ya existen (GTK-22).
- `next-auth@5` y `argon2` ya están en dependencias (GTK-21).
- `lib/auth/` hoy solo tiene RBAC (`permissions.ts`); no hay config Auth.js.
- Consumidores posteriores: GTK-69 (UI login), GTK-24 (TOTP), GTK-26 (rate limit/middleware), GTK-25 (RBAC en handlers).

## Goals / Non-Goals

**Goals:**

- Login por credenciales con argon2id y mensajes de error no enumerables.
- Sesión JWT + espejo revocable en `sessions` con TTL configurable.
- Helpers de sesión tipados para el resto del portal.
- Server Action delgada `loginAction` + rutas `/api/auth/*`.
- Audit `login` / `login_failed` y actualización de `last_login_at`.
- Hook TOTP fail-closed si `twofa_enabled` sin verificador.

**Non-Goals:**

- UI de login / paso TOTP (GTK-69).
- Implementación real de TOTP (GTK-24).
- Rate limit / middleware / noindex (GTK-26).
- Migración Prisma.

## Decisions

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| JWT + espejo en `sessions` | Solo database sessions de Auth.js | RNF-ADMIN exige revocación real comprobada en BD; JWT corto mantiene el patrón Auth.js v5 Credentials |
| Lógica de authorize en módulo de dominio testeable | Todo dentro del callback Auth.js opaco | Permite TDD unitario del caso de uso sin montar NextAuth completo |
| Server Action `loginAction` delgada | Form POST solo a `/api/auth/callback/credentials` | GTK-69 necesita action tipada; alinea con `backend-standards.md` §3.2 |
| `verifyTotp` opcional inyectable / import dinámico | Stub que siempre pasa | Fail-closed: sin verificador = login failed |
| Mensaje genérico único en fallos | Distinguir 401 vs 403 al cliente | Evita enumeración de usuarios; el audit sí distingue `attemptReason` internamente |
| No tocar `permissions.ts` | Mezclar authn y authz en un solo módulo | Authn (este ticket) vs authz RBAC (GTK-25) separadas |

### Flujo de login (resumen)

1. `loginAction` valida Zod → `signIn('credentials')`.
2. `authorize()`: lookup user → verify password → `is_active` → TOTP si aplica → retorna claims mínimos.
3. Callback `jwt`: en primer sign-in crea fila `sessions` (hash del jti/sessionToken), guarda `sessionId`/`tokenHash` en el token; en requests posteriores valida espejo.
4. Callback `session`: proyecta `userId`, `roleId`, `roleName` al objeto session.
5. Side-effects de éxito: `last_login_at`, `recordAudit('login')`. Fallos: `recordAudit('login_failed')` best-effort.

### Schema Zod (contrato fase 2)

```ts
{ email: z.string().email(), password: z.string().min(8), totp?: z.string().length(6) }
```

### Argon2id

Parámetros documentados en `passwords.ts` (memoria/tiempo/paralelismo alineados a OWASP recomendado para argon2id). Solo server-side (`import 'server-only'`).

## Threat model

### Superficie de ataque

- Server Action `loginAction`.
- Rutas Auth.js `/api/auth/*` (csrf, callback/credentials, session, signout).
- Helpers de sesión usados por futuros handlers `/admin`.

### Actores

- Anónimo / bot intentando login o fuerza bruta.
- Usuario interno activo (cualquier rol).
- Usuario interno inactivo o con 2FA pendiente.
- Atacante con JWT robado o sesión revocada.

### Datos sensibles implicados

- Credenciales (password en tránsito solo HTTPS; hash argon2id en BD).
- JWT de sesión y `token_hash` en `sessions`.
- IP / user-agent en `sessions` y `audit_logs`.
- Email de usuario interno (actor); no PII de leads en este flujo.
- Futuro: secreto TOTP (GTK-24) — aquí solo el flag `twofa_enabled`.

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Enumeración de usuarios | Respuestas distintas por email/password/inactivo | Medio | Mensaje genérico único; audit interno con `attemptReason` |
| T2 | Fuerza bruta / credential stuffing | POST login masivo | Alto | Rate limit en GTK-26; documentar 429 esperado; no implementar aquí |
| T3 | Fuga de password/hash en logs o audit | metadata/logs | Alto | Nunca loguear plain/hash; whitelist audit; redacción sanitize |
| T4 | Bypass 2FA | `twofa_enabled` sin verificador | Alto | Fail-closed: sin `verifyTotp` → login failed |
| T5 | Uso de sesión revocada/expirada | JWT aún no caducado | Alto | Callbacks comprueban `revoked_at`/`expires_at` en BD |
| T6 | JWT en claro en BD | persistir token raw | Alto | Solo `token_hash` (hash del identificador de sesión) |
| T7 | Payload malicioso a loginAction | email/password/totp fuera de schema | Medio | Zod estricto → error de validación |
| T8 | Escalada vía claims JWT manipulados | Tampering del token | Alto | Firma `NEXTAUTH_SECRET`; claims de rol se revalidan contra espejo/BD en callbacks |

### Amenazas descartadas (con justificación)

- **Turnstile en login:** no aplica a portal interno en este ticket; abuso cubierto por rate limit GTK-26.
- **IDOR sobre recursos de leads:** fuera de alcance; no hay endpoints de dominio aquí.
- **Prompt injection IA:** no toca Claude.

### Requisitos de seguridad (criterios de aceptación verificables)

- [ ] SEC-1: Login con usuario inexistente, inactivo o password incorrecta produce el mismo error genérico al cliente.
- [ ] SEC-2: Ningún log ni `audit_logs.metadata` contiene password, hash completo, totp ni token.
- [ ] SEC-3: Con `twofa_enabled=true` y sin verificador TOTP, el login falla y se audita `login_failed`.
- [ ] SEC-4: Sesión con `revoked_at` no nulo o `expires_at` pasado no pasa `requireSession` ni callbacks.
- [ ] SEC-5: `sessions.token_hash` nunca almacena el JWT en claro.
- [ ] SEC-6: `loginAction` rechaza payloads fuera de schema Zod sin llamar a Auth.js.
- [ ] SEC-7: Tras login OK existe `audit_logs.action = login` con IP/UA; tras fallo, `login_failed`.

## Risks / Trade-offs

- [Risk] Sin rate limit hasta GTK-26 → Mitigación: documentar dependencia; tests de abuso dejan el 429 como expectativa futura.
- [Risk] Callbacks JWT consultan BD en cada request → Mitigación: consulta acotada por `token_hash` indexado; TTL corto.
- [Risk] E2E UI bloqueado por GTK-69 → Mitigación: QA con curl + invocación programática de `loginAction`/`signIn`; informe E2E documenta bloqueo.
- [Risk] Auth.js v5 beta API puede cambiar → Mitigación: fijar versión ya instalada; encapsular en `lib/auth/config.ts`.

## Migration Plan

1. Añadir `SESSION_TTL_MINUTES` a `.env` / `.env.example` y desplegar env en Vercel/Neon apps.
2. Desplegar código (sin migración SQL).
3. Rollback: revertir deploy; filas `sessions`/`audit_logs` de prueba se limpian en QA; no hay schema que revertir.

## Open Questions

Ninguna bloqueante para Gate 1. El punto de extensión TOTP se concreta en GTK-24 (firma de `verifyTotp(userId, code)`).

## Contrato congelado (fase 2)

**Estado:** congelado en disco (schemas Zod + `docs/technical/api-spec.yml`). Commit de contrato: pendiente de solicitud del humano.

### Schemas Zod

| Schema | Ubicación | Uso |
|---|---|---|
| `loginInputSchema` | `lib/auth/login-schemas.ts` | Server Action `loginAction`, validación de dominio |
| `credentialsCallbackBodySchema` | idem | `POST /api/auth/callback/credentials` |
| `loginActionResultSchema` | idem | Respuesta tipada de `loginAction` (GTK-69) |

Límites: email max 254 (trim + lowercase), password 8–128, `totp` 6 dígitos opcional, objetos `.strict()`.

### Seguridad por endpoint / acción

| Superficie | Authz | Rate limit | Turnstile | Payload | SEC-N |
|---|---|---|---|---|---|
| `GET /api/auth/csrf` | Público | GTK-26 (flujo login) | No | — | — |
| `POST /api/auth/callback/credentials` | Público | GTK-26 → 429 | No | form-urlencoded; schema Zod | SEC-1, SEC-2, SEC-3, SEC-5 |
| `GET /api/auth/session` | Cookie sesión | Estándar | No | — | SEC-4 |
| `POST /api/auth/signout` | Cookie sesión | Estándar | No | — | — |
| Server Action `loginAction` | Público | GTK-26 → `RATE_LIMITED` | No | `loginInputSchema` | SEC-1, SEC-2, SEC-6, SEC-7 |

PII: email de usuario interno en tránsito (HTTPS); password solo en memoria para verify; audit vía GTK-22 sin secretos en metadata.
