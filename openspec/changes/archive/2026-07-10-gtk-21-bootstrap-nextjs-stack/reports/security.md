# Security Scan — gtk-21-bootstrap-nextjs-stack

- Fecha: 2026-07-10
- Diff analizado: feature/chore-gtk-21-bootstrap-nextjs-stack (andamiaje greenfield)
- Herramientas: revisión estática manual (Semgrep no instalado), `npm audit --omit=dev`, búsqueda dirigida de secretos (fallback gitleaks), curl DAST ligero (páginas estáticas)

## Resumen

| Chequeo | Resultado | Crítico | Alto | Medio | Bajo |
|---------|-----------|---------|------|-------|------|
| SAST | LIMPIO | 0 | 0 | 0 | 0 |
| SCA | HALLAZGOS ACEPTABLES | 0 | 0 | 2 | 0 |
| Secretos | LIMPIO | 0 | 0 | 0 | 0 |
| DAST | NO APLICABLE | — | — | — | — |

## Hallazgos

### [SEV-MEDIA] PostCSS transitivo en Next.js (GHSA-qx2v-qp2m-jg93)

- Ubicación: `node_modules/next/node_modules/postcss` (dependencia transitiva de `next@15.5.20`)
- Descripción: `npm audit --omit=dev` reporta 2 vulnerabilidades **moderate** en PostCSS. El fix sugerido (`npm audit fix --force`) degradaría Next a 9.3.3 (breaking).
- Recomendación: monitorizar advisories de Next.js; no aplicar fix forzado en bootstrap. Reevaluar en upgrades de Next.
- Estado: **ACEPTADO** — severidad moderate, sin vector explotable en esta US (sin renderizado CSS dinámico de usuario ni endpoints). No bloquea GTK-21.

### SEC-1 — server-only en lib/env.ts

- Evidencia: build con sonda temporal `app/sec1-probe/page.tsx` (`'use client'` + `import '@/lib/env'`) falló con:
  `You're importing a component that needs "server-only"... Import trace: ./lib/env.ts → ./app/sec1-probe/page.tsx`
- Sonda eliminada; build posterior en verde.
- Estado: **CORREGIDO / VERIFICADO**

### SEC-2 — .env.example sin secretos reales

- `.gitignore` excluye `.env` y `.env.*` (salvo `.env.example`).
- `.env.example` usa placeholders (`usuario:password`, `sk-ant-...`, `re_...`).
- Tests usan valores fake explícitos en `env.test.ts` (no secretos de producción).
- Estado: **VERIFICADO**

### SEC-4 — error de env sin volcar valores

- Cubierto por test unitario `SEC-4: el mensaje de error no contiene valores de otras variables`.
- Estado: **VERIFICADO**

### SEC-5 — noindex en /admin

- `curl` a `/admin` devuelve `<meta name="robots" content="noindex, nofollow"/>`.
- Estado: **VERIFICADO**

## SAST (revisión manual del diff)

Patrones prohibidos revisados en ficheros nuevos:

- Sin `$queryRawUnsafe`, `dangerouslySetInnerHTML` en código de aplicación, `eval`, secretos hardcodeados.
- `lib/env.ts` y `lib/db.ts` con `import 'server-only'`.
- Sin Route Handlers ni Server Actions.

## DAST

- Sin endpoints API. Smoke curl en `/` y `/admin` únicamente.

## Veredicto del scan

**HALLAZGOS ACEPTABLES CON JUSTIFICACIÓN** — 0 critical/high; 2 moderate transitivos en PostCSS aceptados para bootstrap; requisitos SEC-1 a SEC-5 verificados.
