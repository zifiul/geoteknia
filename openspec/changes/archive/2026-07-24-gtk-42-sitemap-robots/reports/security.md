# Security scan — gtk-42-sitemap-robots

- Fecha: 2026-07-24
- Alcance: `lib/seo/**`, `app/sitemap.ts`, `app/sitemap-imagenes/route.ts`, `app/robots.ts`, `lib/env.ts`

## SAST / SCA / Secretos

- `npm run security:scan`: SAST/SCA **fallo de herramienta** en entorno local (exit 1); secretos **OK** (gitleaks).
- Revisión manual del diff: sin SQL crudo; sin PII en logs; escape XML en captions; filtros `publicado`/`noindex`; endpoints GET públicos sin input.

## DAST

- **Omitido** — sin mutaciones; endpoints de solo lectura; DAST script no detectó handlers en diff base.

## Hallazgos

| ID | Severidad | Hallazgo | Estado |
|----|-----------|----------|--------|
| — | — | Sin hallazgos bloqueantes en revisión manual | Aceptado |

## Resultado

- **Limpio** para fase 6 (revisión manual + secretos OK; re-ejecutar scan en CI).
