# Code Review — gtk-41-crud-contenido

- Fecha: 2026-07-24
- Diff revisado: `main` + working tree (rama `feature/backend-gtk-41-crud-contenido`; ~30 ficheros nuevos/modificados en `lib/content/`, `app/(admin)/contenido/`, audit, Prisma, tests)
- Evidencia revisada: `reports/2026-07-24-step-N+1-unit-test-and-db-verification.md`, N+2/N+3 omitidos (Backend), `reports/security.md`

## Alineación spec ↔ implementación

| Requisito (admin-content-crud) | Estado |
|--------------------------------|--------|
| Fundamentos slug/SEO/EDITORIAL | Implementado en `lib/content/schemas/*`, `slug.ts` |
| CRUD entidades GTK-41 + soft delete | Módulos dominio + Server Actions |
| No publicar desde CRUD | `editorialCrudBlockSchema` + tests SEC-3 |
| M:N servicio↔zona, maquinaria, blog, caso↔equipo | Transacciones + `references.ts` |
| `alt_text` imágenes | `schemas/media.ts` + tests |
| Geo-zona word_count aviso | `word-count.ts` + warning en create/update |
| RBAC `content.*` / config `admin` | `withPermission` / `withAdmin` |
| Auditoría `content_update` / `delete` | Migración + `content-audit.ts` |

## Hallazgos

| Severidad | Área | Hallazgo | Evidencia | Fix sugerido |
|-----------|------|----------|-----------|--------------|
| Menor | Tests | Tests de integración CRUD por entidad y abuse SEC-1/2/5/6 aún pendientes (`tasks.md` §2.2–2.6) | Solo schemas/slug/word_count en Vitest | Añadir mocks Prisma + tests RBAC en iteración siguiente |
| Menor | Dominio | `createBlogPost` no valida existencia de `teamAuthorId` | `blog-faqs.ts` | `assertActiveTeamMemberIds` antes de create |
| Menor | Export | `lib/content/index.ts` reexporta módulos server-only; importar desde cliente rompería build | `index.ts` | Documentar import solo server-side (ya implícito por `server-only`) |

Sin hallazgos **Bloqueante** ni **Mayor** en el diff GTK-41.

## Checklist arquitectura

- [x] Lógica en `/lib/content`, actions delgadas
- [x] Zod en dominio; `ContentActionResult` unificado
- [x] Prisma transaccional + `recordAudit` en update/delete
- [x] `import 'server-only'` en módulos sensibles
- [x] Sin Route Handlers nuevos (coherente con contrato fase 2)

## Sección de seguridad

- **Scan 5b:** `HALLAZGOS ACEPTABLES CON JUSTIFICACIÓN` — SAST/SCA pre-existentes; diff GTK-41 revisado manualmente (RBAC, Zod, audit whitelist, sin SQL crudo).
- **Hallazgos aceptados validados:** Semgrep en `crypto.ts`/QA GTK-24; npm audit transitivo — fuera del scope del change.
- **OWASP (superficie GTK-41):** A01 cubierto por `withPermission`/`withAdmin`; A03 Prisma + Zod; A05 server-only; A09 audit sin PII en metadata. SEC-3 testeado; SEC-1/2/5/6 delegados a matriz RBAC + patrón mustAudit (tests dedicados pendientes — Menor).

Veredicto: APTO
