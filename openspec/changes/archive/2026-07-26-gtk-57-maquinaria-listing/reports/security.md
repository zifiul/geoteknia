# Security scan — gtk-57-maquinaria-listing

- Fecha: 2026-07-26
- Alcance: diff GTK-57 (RSC `/maquinaria`, lecturas Prisma, componentes machinery)

## SAST

- Revisión manual del diff: sin `dangerouslySetInnerHTML`, sin SQL crudo, `machinery.ts` con `server-only`.
- Salida de contenido CMS vía escape React en tarjetas y tabla.

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
