# Security Scan Report (GTK-30)

- Fecha: 2026-07-25
- Cambio: `gtk-30-post-apirecursosslug-descarga-de-lead-magnet-gated`
- Agente: `security-verifier`

## Resumen Ejecutiva de Seguridad

Se han completado los 4 chequeos automáticos de la fase 5b (Security Scan) sobre los cambios del endpoint de descarga de recursos técnicos gated `POST /api/recursos/[slug]`.

---

## 1. SAST (Static Application Security Testing)
- **Ámbito:** `app/api/recursos/[slug]/route.ts`, `lib/leads/create-resource-lead.ts`, `lib/leads/schema.ts`, `lib/content/lead-magnets.ts`.
- **Hallazgos:** 0 vulnerabilidades.
  - **Zod Strict Validation:** `resourceLeadSchema` aplica `.strict()`, impidiendo la inyección de propiedades no declaradas (mass assignment).
  - **Prisma Parameterization:** Consultas relacionales parametrizadas por ORM; 0 concatenaciones SQL crudas.
  - **Server-Only Isolation:** `import 'server-only'` en servicios críticos de backend.

---

## 2. DAST Ligero (Dynamic Application Security Testing)
- **Rate Limiting:** Protección anti-DDoS / scraping de leads configurada mediante `checkRateLimit` con clave `recursos:${ip}` y retorno de HTTP 429 con header `Retry-After`.
- **Anti-Bot / Cloudflare Turnstile:** `verifyTurnstileToken` requerido server-side antes de procesar la transacción; retorno 403 `TURNSTILE_INVALID`.
- **Protección de Almacenamiento Interno:** La respuesta HTTP 201 no expone el `file_url` interno ni rutas del bucket de `media_assets`. En su lugar, entrega una `downloadUrl` estilizada con token.

---

## 3. SCA (Software Component Analysis)
- **Dependencias:** No se han añadido dependencias npm nuevas.

---

## 4. Detección de Secretos y PII
- **Gitleaks Check:** Pasado limpiamente. No hay llaves ni credenciales expuestas en código o artefactos.
- **Protección RGPD / PII:**
  - `gdprConsent: z.literal(true)` es obligatorio en la entrada Zod.
  - Los datos de contacto (`contacts`/`leads`) se persisten exclusivamente en PostgreSQL Neon (Región EU).
  - Sin fuga de PII en logs de consola (solo se registra `referenceNumber` y `slug`).
  - No se envía PII a Claude ni a servicios externos no autorizados.

---

## Veredicto de Seguridad

- **Estado:** **LIMPIO / APTO**
- **Bloqueantes:** 0
