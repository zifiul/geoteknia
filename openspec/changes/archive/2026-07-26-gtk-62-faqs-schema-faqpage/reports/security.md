# Security scan — gtk-62-faqs-schema-faqpage

- Fecha: 2026-07-26
- Alcance: diff GTK-62 (RSC `/faqs`, lecturas Prisma, `FaqAccordion` cliente)

## SAST

- Sin `dangerouslySetInnerHTML`; preguntas/respuestas escapadas por React.
- `blog-faqs.ts` mantiene `server-only`.
- Enlaces `internal_link_url` desde CMS (sin open redirect en código).

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
