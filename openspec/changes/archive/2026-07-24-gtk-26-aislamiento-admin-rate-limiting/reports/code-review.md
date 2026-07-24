# Code Review — gtk-26-aislamiento-admin-rate-limiting

- Fecha: 2026-07-24
- Diff revisado: `main` + working tree (middleware, `lib/security/*`, `auth-edge`, `robots`, `env`, tests; sin commits en `main..HEAD`)
- Evidencia revisada: `2026-07-24-step-6-unit-test-and-db-verification.md`, `2026-07-24-step-7-curl-endpoint-verification.md`, E2E omitido (Backend), `security.md`, `design.md` (SEC-1…SEC-5), `tasks.md`

## Alineación spec ↔ implementación

| Requisito (delta spec / design) | Implementación | Evidencia |
|--------------------------------|----------------|-----------|
| Middleware JWT sin BD en `/admin` y `/api/admin/*` | `middleware.ts` + `auth-edge.ts` | Unit middleware + curl SEC-1/2 |
| Redirect login vs 401 JSON API | `isApiAdminPath` + `LOGIN_PATH` | curl step 7 |
| `X-Robots-Tag` + security headers | `lib/security/headers.ts` | Unit headers + curl |
| `checkRateLimit` Edge-compatible | `lib/security/rate-limit.ts` | Unit rate-limit SEC-4 |
| `robots.txt` Disallow admin | `app/robots.ts` | Unit robots + curl |
| Env `RATE_LIMIT_*` + Upstash opcional | `lib/env.ts`, `.env.example` | Unit env GTK-26 |
| Doble capa documentada (SEC-5) | `backend-standards.md` §8.4 | Fase 7 docs |
| Rate limit en login/leads | Fuera de alcance | design non-goals |

## Checklist arquitectura

- [x] Infraestructura en `/lib/security` y `middleware.ts`; sin lógica de negocio en routes nuevas.
- [x] Sin contrato Zod HTTP nuevo (fase 2 omitida); errores 401 alineados con formato `success`/`error`.
- [x] `auth-edge` separado de `config.ts` (Edge vs Node).
- [x] Tests SEC-1…SEC-4 + funcionales; `npm test` 128/128 PASS.
- [x] QA curl PASS; E2E omitido según label Backend.

## Hallazgos

| Severidad | Área | Hallazgo | Evidencia | Fix sugerido |
|-----------|------|----------|-----------|--------------|
| Menor | Auth Edge | `auth()` en middleware sin pasar `request` explícito; patrón Auth.js v5 puede evolucionar a wrapper `auth((req)=>…)` | `middleware.ts` | Monitorizar en GTK-69 si hay edge cases de cookie |
| Menor | Ops | Rate limit in-memory no compartido entre isolates (documentado) | design + §8.4 | Upstash fase 2 |
| Menor | SCA/SAST | Deuda stack preexistente | `security.md` | Fuera de alcance GTK-26 |

Sin hallazgos **Bloqueante** ni **Mayor** pendientes.

## Sección de seguridad

- **Resultado scan (5b):** HALLAZGOS ACEPTABLES CON JUSTIFICACIÓN — sin hallazgos en diff GTK-26; SCA/SAST transversales aceptados en `security.md`.
- **Hallazgos aceptados validados:** GCM Semgrep (GTK-24), HTTP QA tests, npm audit stack.
- **Checklist OWASP (GTK-26):**
  - A01: middleware authn only; authz RBAC sigue en handlers (GTK-25) — OK por diseño.
  - A02: sin secretos en código nuevo — OK.
  - A03: sin SQL/HTML en middleware — OK.
  - A04: SEC-1…SEC-4 testeados; SEC-5 documentado — OK.
  - A05: noindex/robots/headers; errores genéricos 401 — OK.
  - A07: primitiva rate limit lista; cableado HTTP en GTK-28+ — aceptado en Gate 1.
  - A08: sin deps nuevas — OK.
  - A09: log sin PII (ipHint) — OK.

## SEC-N (threat model)

| ID | Estado |
|----|--------|
| SEC-1 | Cubierto (middleware test + curl 307) |
| SEC-2 | Cubierto (middleware test + curl 401 JSON) |
| SEC-3 | Cubierto (headers test + curl) |
| SEC-4 | Cubierto (`rate-limit.test.ts`) |
| SEC-5 | Cubierto (`backend-standards.md` §8.4) |

Veredicto: APTO
