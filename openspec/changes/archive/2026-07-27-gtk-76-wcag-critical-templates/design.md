# Design — gtk-76-wcag-critical-templates

## Enfoque

1. **Auditoría guiada por tests:** reutilizar el patrón de `tests/e2e/gtk44-design-system-a11y.spec.ts` vía helper `assertNoCriticalAxeViolations(page)` en `tests/e2e/helpers/axe-wcag.ts`.
2. **Rutas y seed:** slugs fijos en `prisma/seed-lighthouse-public.ts` para geo (`/zonas/madrid`) y caso (`/proyectos/caso-lhci-seed`) además de las rutas estáticas (`/presupuesto`, `/contacto`, `/admin/login`).
3. **Correcciones:** mínimo diff en componentes compartidos (header, cookie banner, inputs, botones ghost/outline con contraste insuficiente) sin convertir RSC en Client Components.
4. **CI:** workflow `e2e-a11y.yml` espejo de servicios Postgres/env de `lighthouse.yml`, ejecutando specs GTK-48…69 con axe.
5. **Stitch:** validación visual no es objetivo del ticket; las correcciones de color/foco deben respetar tokens `brand-*` del DS público (`3480174961756698237`) y admin login (GTK-69).

## Rutas bajo auditoría

| Plantilla | Ruta CI/E2E |
| --- | --- |
| Home | `/` |
| Servicio | `/servicios/sondeos` |
| Geo-landing | `/zonas/madrid` |
| Caso | `/proyectos/caso-lhci-seed` |
| Blog artículo | `/blog/normativa/novedades-db-sec-2024` |
| Presupuesto | `/presupuesto` |
| Calculadora | `/calculadora` |
| Contacto | `/contacto` |
| Login | `/admin/login` |

## Threat model

### Superficie de ataque

- Sin endpoints nuevos. Tests E2E y LHCI contra URLs públicas y `/admin/login` (formulario existente).
- Posible exposición de mensajes de error de validación en UI (ya existente en presupuesto/contacto/login).

### Actores

- Anónimo (auditoría automatizada y usuarios con AT).

### Datos sensibles implicados

- Ninguno nuevo. Los tests no deben loguear credenciales ni PII en artefactos CI.

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
| --- | --- | --- | --- | --- |
| T1 | Fuga de datos en traces Playwright | Screenshots/traces en CI | Bajo | No commitear traces; variables CI sin secretos reales |
| T2 | Bypass de auth en `/admin` por cambio accidental en middleware | Regresión en fix a11y | Medio | No tocar `middleware` salvo skip-link; E2E login solo en `/admin/login` |

### Requisitos de seguridad (criterios de aceptación verificables)

- [ ] SEC-1: Los cambios de marcado en `LoginForm` no eliminan `autocomplete` ni asociación label/input.
- [ ] SEC-2: El workflow E2E no imprime contraseñas ni tokens en logs del job.

## Decisiones

- **Geo/caso en LHCI:** fixtures dedicados en `seed-lighthouse-public.ts` en lugar de slugs hardcodeados de producción.
- **Cookie banner:** en tests axe, clic en «Rechazar no esenciales» cuando el banner esté visible (mismo patrón que specs GTK-48/51).
