# Design — gtk-77-cwv-lighthouse-ci

## Enfoque

1. **Fuente única** `lib/perf/lighthouse-phase1.cjs`: rutas relativas Fase 1 y helpers de URL (slugs alineados con E2E existentes: `sondeos`, `normativa/novedades-db-sec-2024`). Fase 2 añadirá paths de geo/caso sin tocar assertions base.
2. **`lighthouserc.cjs`**: `collect.url` desde helper; `assert.assertions` con `'error'`; umbrales CWV (`largest-contentful-paint`, `cumulative-layout-shift`); `settings.budgetPath: './budget.json'`.
3. **CI**: workflow GitHub Actions con Postgres efímero, `prisma migrate deploy` + `db seed`, `pnpm build`, `pnpm run ci:lighthouse` (`lhci autorun` con `startServerCommand: next start -p 3010`). Variables de entorno de CI con placeholders seguros (sin secretos reales en el workflow).
4. **Auditoría UI (Stitch)**: las plantillas ya implementan la jerarquía visual de Stitch (GTK-48 hero full-bleed, GTK-49 hero servicio, GTK-55 hero artículo). Este ticket solo verifica atributos de rendimiento (`priority`, `sizes`, RSC por defecto) sin alterar composición.
5. **No tocar**: `next.config.ts` imágenes, `app/layout.tsx` fuentes, `components/analytics/gtm.tsx` salvo regresión detectada en tests.

## Threat model

### Superficie de ataque

- Workflow de CI (secretos de repositorio, ejecución de scripts en PR).
- Sin endpoints HTTP nuevos.

### Actores

- Contribuidor con PR (potencial fork si el workflow no está endurecido).
- Anónimo: sin cambio en superficie pública.

### Datos sensibles implicados

- Secretos de CI (`DATABASE_URL` real en forks: usar Postgres local del job, no Neon de producción).
- Sin PII nueva en cliente.

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Exfiltración de secretos vía workflow en PR de fork | `pull_request_target` mal configurado | Alto | Usar `pull_request` estándar; env de CI solo placeholders + Postgres del job |
| T2 | Ejecución arbitraria en CI | script malicioso en PR | Medio | Solo comandos fijos del workflow; sin `curl` a endpoints internos nuevos |

### Requisitos de seguridad (criterios de aceptación verificables)

- [ ] SEC-1: El workflow de Lighthouse no referencia secretos de producción obligatorios (Neon/Resend/Anthropic reales); usa servicio Postgres efímero y placeholders documentados.
- [ ] SEC-2: No se añaden Route Handlers ni se amplía superficie de upload/ejecución.

### Amenazas descartadas

- RBAC/Turnstile en formularios: sin cambios en formularios.
- XSS vía optimización de imágenes: sin `dangerouslySetInnerHTML` nuevo.

## Decisiones

- **Slugs fijos en LHCI**: asumen seed/BD de CI con el mismo contenido que E2E; si falta contenido, el job falla explícitamente (preferible a URLs dinámicas opacas).
- **Performance ≥ 90 en gate, ≥ 95 aspiracional** en documentación; CWV numéricos en assertions donde Lighthouse los expone.
