# Proposal — gtk-43-bootstrap-frontal

> US: [GTK-43 — Bootstrap del frontal Next.js 15 (App Router, route groups, Tailwind, TS)](https://linear.app/geoteknia/issue/GTK-43/bootstrap-del-frontal-nextjs-15-app-router-route-groups-tailwind-ts)
> Dependencias: GTK-21 (Done). Desbloquea GTK-44, GTK-45, GTK-46, GTK-47, GTK-68.

## Why

GTK-21 dejó el monolito compilable con home en `app/page.tsx` y rutas admin sueltas bajo `app/(admin)/`, pero sin Tailwind, sin route group público `(public)`, sin metadata base/canonical, sin `next/image` remoto ni layout admin con `noindex` a nivel de grupo. Sin este andamiaje frontend no pueden avanzar el design system (GTK-44), SEO helpers (GTK-45) ni el layout público (GTK-47).

## What Changes

- Crear `app/(public)/` con layout y migrar la home desde `app/page.tsx`; eliminar `app/page.tsx` raíz.
- Crear `app/(admin)/layout.tsx` aditivo con `robots: noindex,nofollow` para todo el grupo admin.
- Instalar y configurar **Tailwind CSS v4** (CSS-first: `app/globals.css` + `@tailwindcss/postcss`).
- Cargar tipografía con `next/font/google`, variable CSS y consumo en Tailwind.
- Ampliar `app/layout.tsx` con `metadataBase`, `title.template`, `robots` y `alternates.canonical` base; importar `globals.css`.
- Configurar `next.config.ts` con `images.formats` AVIF/WebP y `remotePatterns` derivados de `MEDIA_STORAGE_BASE_URL`.
- Añadir helpers puros en `lib/seo/site-url.ts` (metadata base y remote patterns) con tests unitarios.
- Smoke E2E Playwright ampliado (`/` sin errores de consola, `/admin` 200 o redirect, robots en admin cuando renderiza HTML).
- Runner Lighthouse CI con presupuesto base (no bloqueante en pipeline).

## Capabilities

### New Capabilities

- `public-front-scaffolding`: route groups `(public)` y `(admin)` con layouts, Tailwind v4, fuentes `next/font`, metadata raíz y `next/image` configurado para media CDN.

### Modified Capabilities

- `project-scaffolding`: la home SHALL vivir en `app/(public)/page.tsx` (no en `app/page.tsx` raíz); el grupo `(admin)` SHALL tener layout propio con noindex por defecto.

## Impact

- **Código:** `app/`, `lib/seo/site-url.ts`, `next.config.ts`, `postcss.config.mjs`, `app/globals.css`, tests E2E/unit, `lighthouserc.cjs`.
- **Dependencias:** `tailwindcss`, `@tailwindcss/postcss`, `postcss`; dev `@lhci/cli` (runner).
- **API / contrato:** no hay Route Handlers ni Server Actions nuevos — fase 2 del harness omitida.
- **SEO:** `metadataBase` y canonical base; admin noindex a nivel de layout (complementa páginas admin existentes).
- **RGPD/PII:** no aplica captura de datos.
- **Seguridad /admin:** reforzo de noindex en layout de grupo; sin cambios RBAC (GTK-68).

## Fuera de alcance

- RBAC, navegación admin y 2FA (GTK-68).
- GTM, Consent Mode y banner RGPD (GTK-46).
- JSON-LD y canonical por plantilla (GTK-45).
- Design system y componentes Atomic Design (GTK-44).
- Header, footer y NAP público (GTK-47).
- Gate estricto Lighthouse en CI (GTK-77).
- Modificar lógica de `app/(admin)/contenido/` u otras subrutas admin en desarrollo.
