# Design — gtk-47-layout-publico

## Context

GTK-43–46 y GTK-41 dejaron route group `(public)`, design system, SEO helpers, consent/GTM y CRUD de `organization_profile` sin lectura pública. `StickyCtaBar`, `Breadcrumbs`, `lib/seo/breadcrumbs.ts` y `ConsentPreferencesTrigger`/`openConsentPreferences` existen y deben reutilizarse. Stitch (2026-07-19) define shell desktop, drawer móvil y 404.

## Goals / Non-Goals

**Goals:**

- Shell público mobile-first alineado con tokens `docs/design/DESIGN.md` y pantallas Stitch.
- NAP y canales desde Prisma con cache ISR (`unstable_cache` + tag `organization-profile`).
- Navegación de silos + menú móvil accesible (Radix Dialog como drawer).
- Skip-link, `aria-current`, breadcrumbs patrón para plantillas futuras.
- E2E y unit tests según ticket.

**Non-Goals:**

- Segmentación de contacto GTK-67, schema Organization en home, contenido legal.

## Decisions

### Lectura pública de organización

**Decisión:** `lib/content/organization.ts` con `import 'server-only'`, `getOrganizationProfile()` devuelve DTO acotado (`displayName`, `legalName`, `napAddress`, `napPhone`, `napEmail`, `socialProfiles` opcional). Cache con tag `organization-profile`. Tras `updateOrganizationProfile` en `config.ts`, `revalidateTag('organization-profile')`.

**Alternativa descartada:** duplicar NAP en env — rompe GBP/CRUD único.

### Canales de contacto

**Decisión:** `getGeneralContactChannel()` devuelve el primer `contact_channel` activo con WhatsApp o teléfono; si no hay, header/CTAs usan NAP del perfil.

### Composición de layout

**Decisión:** `app/(public)/layout.tsx` (RSC) hace `Promise.all` de perfil + canal, pasa props a `SiteHeader`/`SiteFooter`/`SiteStickyContactBar` (cliente). `main` con `id="main-content"` y `tabIndex={-1}`; `pb` inferior en móvil para no tapar contenido con `StickyCtaBar`.

### Menú móvil

**Decisión:** `SiteNav` (client) usa `Dialog` de GTK-44 para el drawer lateral (Stitch `d283aa98…`), navegación horizontal `lg+`. `aria-label` en `nav`.

### Cookies

**Decisión:** eliminar `ConsentPreferencesTrigger` flotante del layout; `FooterCookiePreferences` (client) llama `openConsentPreferences()`.

### Header scroll

**Decisión:** `SiteHeaderBar` (client) aplica clase compacta (`py-2` vs `py-4`) tras `scrollY > 8` con `transition-[padding]` y altura mínima fija del contenedor logo para limitar CLS.

### 404

**Decisión:** `app/(public)/not-found.tsx` con hero, enlace a inicio y contacto, siguiendo Stitch 404; hereda layout público.

### Tracking

**Decisión:** `ContactLink` client helper envuelve `tel:`, `mailto:`, `wa.me` con `onClick` → `trackConversionEvent({ eventName: 'click_tel' | ... })` sin bloquear navegación.

### Breadcrumbs E2E

**Decisión:** ampliar `dev-seo` con UI `Breadcrumbs` + segmentos visibles y `data-testid` para aserciones E2E.

## Stitch reference

| Pantalla | Screen ID | Uso en código |
|----------|-----------|---------------|
| Shell header/footer | `b81fcc99b3aa4e629c600eac65f5a2a4` | `SiteHeader`, `SiteFooter`, skip-link |
| Drawer móvil | `d283aa985b844c75a52098f7d4b5ef2f` | `SiteNav` + Dialog |
| 404 desktop | `e1e6e20da79c4eef80393fd8f85b6ad9` | `not-found.tsx` ≥ md |
| 404 mobile | `d0bad75d1b71421e859a573235a04194` | `not-found.tsx` < md |

## Threat model

### Superficie de ataque

- Páginas públicas HTML (header/footer), enlaces `tel:`/`mailto:`/`wa.me`, lectura Prisma sin auth, menú cliente manipulable en DevTools.

### Actores

- Visitante anónimo, scraper, atacante XSS (contenido futuro en silos; layout solo muestra NAP de BD controlada por admin).

### Datos sensibles

- NAP corporativo (público por diseño). No exponer `updatedById`, IDs internos ni datos de auditoría en DTO público. RGPD: enlace cookies y consent existente.

### Amenazas

| # | Amenaza | Mitigación |
|---|---------|------------|
| T1 | Enumeración de datos internos vía API pública | Sin Route Handler nuevo; DTO mínimo en RSC |
| T2 | XSS en NAP si admin comprometido | React escapa texto; sin `dangerouslySetInnerHTML` en NAP |
| T3 | Open redirect en nav | Solo rutas estáticas en config de navegación |
| T4 | Spam tracking sin consent | `trackConversionEvent` respeta consent GTK-46 |

**Requisitos de seguridad (criterios):** lectura server-only; validación de existencia de perfil con fallback seguro (mensaje genérico si falta seed); nav sin URLs externas no listadas.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| CLS header sticky | altura mínima + transición solo padding |
| Doble barra cookies | quitar trigger flotante |
| BD vacía en dev | tests mock; UI tolera perfil null con copy mínimo |
