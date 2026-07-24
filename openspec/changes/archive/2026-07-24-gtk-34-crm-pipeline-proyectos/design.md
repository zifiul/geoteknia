# Design — gtk-34-crm-pipeline-proyectos

> Lectura CRM en `/admin`: queries en `lib/projects/`, UI en Server Components, primer consumidor de GTK-25 sobre PII.

## Enfoque técnico

1. **Capa de datos:** funciones async en `lib/projects/queries.ts` y `lib/projects/metrics.ts` con `import 'server-only'`. Sin Server Actions para lecturas (Hallazgo 3 — `frontend-standards.md` §5.1 prioriza RSC + search params).
2. **Autorización:** `requirePermission('projects.read')` al inicio de cada función pública. Errores: propagar `InvalidSessionError` / `ForbiddenError`; en páginas admin, el layout o error boundary existente redirige 401 a login y muestra 403 (sin envelope JSON — Hallazgo 4).
3. **Scoping dual (Hallazgo 1):**
   - **Listado y métricas:** helper interno `buildProjectWhere(user, filters)` que siempre añade `deletedAt: null` y, si `user.roleName === 'tecnico'`, `assignedTechnicianId: user.userId`. El filtro `technicianId` solo aplica si el rol no es `tecnico`.
   - **Detalle:** `findFirst` + si no hay fila → `NotFoundError`; si hay fila → `assertOwnership(project, user)`; si ownership falla → **mismo `NotFoundError`** (no `ForbiddenError`) para anti-enumeración (técnico ajeno indistinguible de inexistente).
4. **Filtros Zod:** `projectFiltersSchema` estricto (`.strict()`), coerción de fechas y paginación; exportar tipo `ProjectFilters`.
5. **Métricas (Hallazgos 2, 5, 7):**
   - Agregaciones por `serviceId` / `provinceId` con `groupBy` + resolución de nombres en segunda query o `include` acotado.
   - Tasa cualificación: `_count` con filtro `isQualified: true` / total en el mismo `where`.
   - Tiempo medio: `Prisma.$queryRaw` con `Prisma.sql` parametrizado — `AVG(EXTRACT(EPOCH FROM (first_response_at - created_at))) / 3600.0` con `first_response_at IS NOT NULL`. Devolver `null` si no hay filas. **Dependencia:** otro ticket debe escribir `first_response_at`.
   - **Decisión negocio (Hallazgo 5):** métricas con el **mismo scoping** que listado — técnico ve KPIs solo de sus proyectos.
   - **Decisión negocio (Hallazgo 7):** conteos por servicio/zona sobre **`projects`** (pipeline real 1:1 con lead), no sobre `leads` sin convertir.
6. **UI admin:** páginas mínimas mobile-first en `app/(admin)/proyectos/` — tabla/lista en servidor, controles de filtro como enlaces o formulario GET; detalle con secciones por relación. Reutilizar tokens/layout `(admin)` existente; sin datos sensibles en cliente más allá de lo renderizado en HTML autenticado.
7. **Observabilidad:** log estructurado opcional con rol, página y total — **sin** PII ni emails en mensajes.

## Decisiones

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| Scoping en `where` para listado/métricas | Post-fetch + `assertOwnership` en cada fila | Evita fuga de totales/paginación e ineficiencia |
| Detalle: `NotFoundError` tras fallo de ownership | `ForbiddenError` para técnico ajeno | Anti-enumeración (criterio de aceptación Linear) |
| RSC + search params | Server Actions de consulta | Lecturas SSR compartibles; estándar frontend |
| Sin Route Handlers | API JSON interna | No hay consumidor externo; menos superficie |
| `pageSize` max 100 en Zod | Sin tope | Vector de coste (Hallazgo 6) |
| Métricas sobre `projects` | Contar `leads` crudos | Vista de pipeline operativo |

## Threat model

### Superficie de ataque

- Rutas `/admin/proyectos` y `/admin/proyectos/[id]` (Server Components, requieren sesión).
- Parámetros de URL: slugs de estado/servicio/provincia, UUID de técnico, fechas, paginación.
- Funciones server-only en `lib/projects/` invocables indirectamente desde RSC (no expuestas al cliente como endpoints).

### Actores

- Anónimo sin sesión (debe redirigir/login).
- `editor` con sesión válida (sin `projects.read`).
- `tecnico` intentando ver/editar alcance ajeno vía filtros o UUID en URL.
- `gestor`/`admin` con acceso global legítimo.
- Atacante con sesión revocada (cubierto por `getPortalSession` en GTK-25).

### Datos sensibles implicados

- PII: datos de `contacts` y `leads` vinculados a proyectos (nombre, email, teléfono, dirección según modelo).
- Clasificación RGPD: tratamiento en interés legítimo / ejecución contractual en CRM B2B; solo portal autenticado EU (Neon).

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | IDOR / fuga de pipeline ajeno | `tecnico` manipula `technicianId` o UUID en detalle | Alto — PII de otros clientes | Scoping forzado en `where`; detalle con `NotFoundError` unificado |
| T2 | Escalada horizontal de rol | `editor` accede a `/admin/proyectos` | Alto — lectura CRM no autorizada | `requirePermission('projects.read')` → 403 |
| T3 | Exfiltración por paginación masiva | `pageSize` enorme o scraping | Medio — carga y volumen PII | Zod `.max(100)`; auth obligatoria |
| T4 | Inyección vía filtros | Slugs o fechas maliciosas en query string | Medio | Zod estricto; Prisma parametrizado; `$queryRaw` solo con `Prisma.sql` |
| T5 | Fuga en logs | Log de filas completas de contacto | Alto | Logs sin PII; solo metadatos de consulta |
| T6 | Enumeración de UUID de proyecto | 403 vs 404 distintos en detalle | Medio | Mismo `NotFoundError` para no existe y no es tuyo (técnico) |

Amenazas descartadas:
- Turnstile / rate limit en estas rutas: no son formularios públicos; rate limit admin global (GTK-26) aplica a la zona.
- Prompt injection / IA: no hay llamadas a Claude en esta US.

### Requisitos de seguridad (criterios de aceptación verificables)

- [ ] SEC-1: `listProjects` con rol `editor` lanza `ForbiddenError` antes de cualquier query Prisma.
- [ ] SEC-2: `listProjects` con rol `tecnico` nunca devuelve filas con `assignedTechnicianId !== user.userId`, aunque `technicianId` en filtros apunte a otro UUID.
- [ ] SEC-3: `getProjectDetail` con `tecnico` y proyecto asignado a otro usuario lanza el mismo error que proyecto inexistente (`NotFoundError`), no `ForbiddenError`.
- [ ] SEC-4: `projectFiltersSchema` rechaza `pageSize > 100` y objetos con claves extra (`.strict()`).
- [ ] SEC-5: consultas de listado/detalle/métricas excluyen filas con `deletedAt` no nulo.

## Verificación

- `npm run test` (módulo `projects`), `npm run typecheck`, `npm run lint`.
- `openspec validate --strict` sobre el change.
- `/opsx:verify` antes de archive (riesgo PII CRM).

## Fase 2 (contrato)

- **Schemas Zod:** `projectFiltersSchema` (+ tipos exportados) en `lib/projects/queries.ts` o `lib/projects/project-filters-schema.ts` — congelar en fase 2.
- **`api-spec.yml`:** sin cambios (no hay endpoints HTTP).
