# Alineación Stitch — GTK-46

**Fecha:** 2026-07-25  
**Proyecto Stitch:** [Geoteknia Web pública B2B](https://stitch.withgoogle.com/projects/9787207935189076711)  
**Comentario Linear:** diseños del 2026-07-19 (screen IDs abajo).

## Pantallas de referencia

| Pantalla | Screen ID | Implementación |
|----------|-----------|----------------|
| Banner + modal preferencias (desktop) | `be8456e5dc894a3cb31c738403c05cac` | `consent-banner.tsx` + `consent-preferences-panel.tsx` (modal `max-w-2xl`) |
| Banner consentimiento (móvil) | `f00b35326d7b4858acf8d66f31726125` | Barra inferior, copy corto, botones apilados, dimmer |
| Preferencias (móvil) | `dccc7630e4424d1491db2c5b3499c066` | Bottom sheet (`DialogContent` anclado abajo) + toggles |

## Decisiones respecto a Stitch

- **Categorías:** Necesarias / Analíticas / Marketing (como móvil y backend). La fila «Personalización» del mock desktop **no** se implementa: no existe en el modelo de consentimiento ni en el mock móvil.
- **Política de cookies:** enlace a `/politica-cookies` (ruta legal prevista; GTK-47/footer puede consolidar el enlace NAP).
- **Tokens:** clases `brand-*` del design system en código (equivalente a Ochre Drill / Basalt Ink de `DESIGN.md`).
- **Componentes:** `Dialog` + `Button` (GTK-44); toggles en `consent-toggle.tsx`.

## Verificación

- E2E `gtk46-consent-datalayer` actualizado a copy y nombres de botón Stitch.
- HTML exportado de Stitch usado como referencia de copy y jerarquía (no se copió markup Tailwind de Stitch al repo).
