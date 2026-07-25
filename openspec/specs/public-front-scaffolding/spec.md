# public-front-scaffolding Specification

## Purpose

Andamiaje del frontal público Next.js: route groups, Tailwind, tipografías, metadata base, imágenes remotas y layout semántico con header/footer (GTK-43, GTK-47).

## Requirements

### Requirement: Route group público (public) con home en /
La aplicación SHALL servir la home desde `app/(public)/page.tsx` dentro del grupo `(public)` con layout dedicado. No SHALL existir `app/page.tsx` en la raíz de `app/`. La URL `/` SHALL seguir respondiendo HTTP 200.

#### Scenario: Home en route group público
- **WHEN** se solicita `GET /`
- **THEN** la respuesta es HTTP 200 y el contenido proviene de la ruta bajo `app/(public)/`

### Requirement: Tailwind CSS operativo en build
El proyecto SHALL incluir Tailwind CSS configurado (v4 CSS-first o equivalente) de forma que las clases utilitarias en componentes del frontal se apliquen en desarrollo y producción.

#### Scenario: Clase utilitaria visible en home
- **WHEN** la home incluye una clase utilitaria de Tailwind documentada en el change
- **THEN** el HTML renderizado refleja el estilo asociado tras `pnpm run build`

### Requirement: Tipografía next/font sin FOUT evitable
El layout raíz SHALL cargar al menos una familia con `next/font` y exponerla como variable CSS consumida en estilos globales/Tailwind.

#### Scenario: Variable de fuente en documento
- **WHEN** se renderiza cualquier página pública
- **THEN** el elemento `html` o `body` incluye la clase o estilo que aplica la variable de fuente configurada

### Requirement: Metadata base y canonical por defecto
El layout raíz SHALL definir `metadataBase` desde `NEXT_PUBLIC_SITE_URL`, `title.template`, `robots` indexable por defecto en el sitio público y `alternates.canonical` base.

#### Scenario: metadataBase coherente
- **WHEN** se inspecciona el metadata generado para `/`
- **THEN** `metadataBase` resuelve al origen configurado en `NEXT_PUBLIC_SITE_URL`

### Requirement: next/image preparado para media CDN
`next.config.ts` SHALL declarar `images.formats` con AVIF y WebP y `images.remotePatterns` para el hostname de `MEDIA_STORAGE_BASE_URL`.

#### Scenario: Formatos de imagen configurados
- **WHEN** se lee la configuración exportada de Next.js
- **THEN** `images.formats` incluye `image/avif` e `image/webp`

### Requirement: Layout admin con noindex de grupo
`app/(admin)/layout.tsx` SHALL existir y SHALL exportar metadata con `robots.index = false` y `robots.follow = false` sin alterar la lógica de las subrutas existentes.

#### Scenario: Meta robots en HTML de admin accesible
- **WHEN** `GET /admin` responde 200 con HTML (sin redirección previa al documento)
- **THEN** el `<head>` contiene `noindex` y `nofollow` en meta robots

### Requirement: Layout del route group público
El layout `app/(public)/layout.tsx` SHALL envolver las páginas públicas con estructura semántica completa: skip-link, `header` con navegación sticky, `main` enfocable para el contenido de cada página, y `footer` con NAP leído de BD. Además SHALL montar GTM y el banner de consentimiento (GTK-46). La reconfiguración de cookies SHALL estar disponible desde el footer mediante `openConsentPreferences()`; no es obligatorio mantener un botón flotante fijo de cookies una vez desplegado el footer.

#### Scenario: Estructura semántica en cualquier página pública
- **WHEN** se solicita una página bajo `app/(public)/`
- **THEN** el HTML incluye `header`, `main` y `footer` producidos por el layout del grupo
