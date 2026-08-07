# Security scan — gtk-57-maquinaria-detalle

- Fecha: 2026-08-07
- Alcance: diff ficha `/maquinaria/[slug]`, lecturas Prisma, componentes machinery

## SAST

- Sin `dangerouslySetInnerHTML`; contenido CMS escapado por React.
- `getPublishedMachineryBySlug` aplica `PUBLISHED_EDITORIAL_WHERE` (SEC-1).
- Join de servicios filtra solo publicados (SEC-3).
- `machinery.ts` mantiene `server-only`.

## SCA

- Sin dependencias nuevas.

## Secretos

- Sin credenciales en archivos añadidos.

## DAST

- Omitido — sin Route Handlers nuevos.

## Hallazgos

| Severidad | Hallazgo | Estado |
|-----------|----------|--------|
| — | Ninguno bloqueante | Limpio |
