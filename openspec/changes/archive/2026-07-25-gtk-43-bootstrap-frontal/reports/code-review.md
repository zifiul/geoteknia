# Code review — gtk-43-bootstrap-frontal

- **Fecha:** 2026-07-25
- **US:** GTK-43
- **Revisor:** code-reviewer (harness fase 6)

## Alcance revisado

- Route groups `(public)` / `(admin)`, Tailwind v4, `next/font`, metadata raíz, `next.config` imágenes, helpers `lib/seo/site-url.ts`, tests, `lighthouserc.cjs`.
- Ajuste colateral: `import type {} from '@auth/core/jwt'` para augmentación TS 7 en `lib/auth/config.ts` (desbloquea `build`).
- E2E: `gtk24-seguridad` adaptado a `maxRedirects: 0`.

## Checklist

- [x] Alineado con `frontend-standards.md` §3 (route groups, globals en `app/`).
- [x] Sin lógica de negocio en layouts de andamiaje.
- [x] `(admin)/layout` aditivo; no se tocó `contenido/actions`.
- [x] `remotePatterns` acotado al host de `MEDIA_STORAGE_BASE_URL` (SEC-1).
- [x] Tests unitarios + E2E en verde; `build` OK.
- [x] `reports/security.md` revisado — sin hallazgos nuevos críticos en el diff funcional.

## Seguridad

- Threat model de `design.md` cubierto (SEC-1..3).
- Scan global con deuda preexistente documentada en `security.md`.

## Observaciones menores

- Bucle de redirect en `/admin/login` sin página es deuda previa (GTK-23/69); E2E evita seguir redirects.
- Lighthouse CI instalado; gate estricto pendiente GTK-77.

**Veredicto: APTO**
