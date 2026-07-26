# Code review — gtk-60-pagina-contacto

**Fecha:** 2026-07-26

## Checklist

- [x] Reutiliza `getOrganizationProfile` / `getContactChannelByDepartment` sin duplicar NAP.
- [x] JSON-LD contacto con `url` a `/contacto` (no Home wrapper).
- [x] Tracking canónico en enlaces de contacto.
- [x] Mapa Opción A documentada; lazy load + alternativa textual.
- [x] UI alineada con Stitch (hero, departamentos, horario, CTAs, mapa).
- [x] Tests unitarios + E2E.
- [x] `reports/security.md` sin bloqueantes.

## Seguridad

Sin handlers nuevos; superficie estática + iframe externo revisada.

## Veredicto: APTO
