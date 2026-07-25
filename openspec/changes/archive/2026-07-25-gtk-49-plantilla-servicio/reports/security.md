# Security scan — GTK-49 (2026-07-25)

## SAST (diff)

- Sin `dangerouslySetInnerHTML` en plantilla servicio; JSON-LD vía componente existente.
- Lecturas Prisma parametrizadas; filtro `PUBLISHED_EDITORIAL_WHERE` en todas las queries públicas nuevas.
- CTA presupuesto: slug en query; engagement dataLayer sin PII.

## SCA

- Sin dependencias nuevas.

## Secretos

- Sin secretos en diff.

## DAST ligero

- Omitido: sin endpoints HTTP nuevos.

## Hallazgos

| Severidad | Hallazgo | Estado |
|-----------|----------|--------|
| — | Ninguno bloqueante en diff GTK-49 | Limpio |
