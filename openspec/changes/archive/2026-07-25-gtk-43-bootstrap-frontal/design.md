# Design — gtk-43-bootstrap-frontal

## Enfoque técnico

### Route groups

- `(public)`: layout mínimo (wrapper sin lógica) y `page.tsx` migrado desde la home actual.
- `(admin)`: layout Server Component que solo exporta `metadata.robots` y renderiza `{children}` para no interferir con `contenido/`, `admin/`, `ia/`, `perfil/`.

### Tailwind CSS v4

Decisión: **Tailwind v4** (alineado con Next 15+ y ticket GTK-43). Sin `tailwind.config.ts` obligatorio; breakpoints mobile-first en bloque `@theme` dentro de `app/globals.css`. PostCSS con `@tailwindcss/postcss`.

### Fuentes

`next/font/google` — familia **Inter** con `subsets: ['latin']`, `display: 'swap'`, variable `--font-sans` en `html` vía `className`.

### Metadata y next.config

Helpers puros en `lib/seo/site-url.ts`:

- `resolveMetadataBase(siteUrl: string): URL`
- `buildMediaRemotePatterns(mediaBaseUrl: string): NonNullable<NextConfig['images']>['remotePatterns']`

`next.config.ts` lee `process.env.MEDIA_STORAGE_BASE_URL` en build (fallback al placeholder de `.env.example`). El layout raíz usa `resolveMetadataBase` con `NEXT_PUBLIC_SITE_URL`.

### Lighthouse CI

`lighthouserc.cjs` con presupuesto base (performance ≥ 90, a11y ≥ 95, SEO ≥ 95) sobre `/`; script `pnpm lhci` no bloqueante en CI hasta GTK-77.

## Threat model

### Superficie de ataque

- Sin endpoints HTTP nuevos ni Server Actions.
- Configuración pública: `NEXT_PUBLIC_SITE_URL`, clases CSS y metadata en HTML.
- `images.remotePatterns`: restringir al host del CDN documentado (evitar open proxy de imágenes arbitrarias).

### Actores

- Anónimo (indexadores, bots), desarrollador con acceso al repo.

### Datos sensibles implicados

- Ningún PII nuevo. Variables de entorno ya validadas en `lib/env.ts` (server-only); solo `NEXT_PUBLIC_SITE_URL` es pública por diseño.

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Indexación accidental de `/admin` | Crawlers | Medio (fuga de URLs internas) | Layout `(admin)` con `noindex,nofollow`; ya existía en páginas sueltas |
| T2 | Open redirect / canonical incorrecto | `metadataBase` mal configurado | Bajo (SEO) | URL validada con Zod en `env`; helper `resolveMetadataBase` con test unitario |
| T3 | Hotlinking / SSRF vía `remotePatterns` demasiado amplio | `next/image` | Medio | Patterns derivados solo del hostname de `MEDIA_STORAGE_BASE_URL`, sin wildcard `**` |
| T4 | XSS vía CSS injection | Contenido futuro en className | Bajo en este ticket | Sin `dangerouslySetInnerHTML`; Tailwind en clases estáticas |

**Descartadas:** escalada RBAC (sin auth en este ticket), abuse de formularios (sin formularios), PII en logs (sin datos).

### Requisitos de seguridad (criterios de aceptación verificables)

- [ ] SEC-1: `images.remotePatterns` solo incluye el hostname parseado de `MEDIA_STORAGE_BASE_URL` (test unitario en `buildMediaRemotePatterns`).
- [ ] SEC-2: `app/(admin)/layout.tsx` exporta `robots: { index: false, follow: false }` (E2E o inspección HTML en `/admin` cuando responde 200).
- [ ] SEC-3: Helpers de URL en `lib/seo/site-url.ts` rechazan strings no URL en tests (evitar metadataBase inválido).
