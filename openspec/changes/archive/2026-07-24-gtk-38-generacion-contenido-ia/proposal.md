# Proposal — gtk-38-generacion-contenido-ia

> US: [GTK-38 — Generación asistida de contenido SEO con Claude (endpoint + ai_generations)](https://linear.app/geoteknia/issue/GTK-38/generacion-asistida-de-contenido-seo-con-claude-endpoint-ai)
> Labels: `Backend`, `Feature` | Dependencias: GTK-36 ✅, GTK-37 ✅, GTK-25 ✅, GTK-22 ✅, GTK-28 ✅ | GTK-41 ❌ (materialización de borrador en entidad publicable)

## Why

El portal necesita un endpoint autenticado `ai.generate` que orqueste plantillas SEO, presupuesto mensual y `runGeneration` (GTK-36), persista cada invocación en `ai_generations`/`ai_token_usage` y devuelva salida estructurada validada — sin publicar contenido YMYL sin revisión humana. Cierra el trío IA (cliente + coste + endpoint) y desbloquea la malla de silos servicio × zona (RF-19, US-16).

## What Changes

- **Primer Route Handler de `/api/admin`:** `POST /api/admin/ia/generar` con `withRoutePermission('ai.generate')`.
- **Dominio:** `lib/ia/content-generation.ts` (orquestación), `lib/ia/output-schema.ts` (validación post-hoc JSON), schemas Zod de entrada compartidos.
- **Flujo:** RBAC → validación dinámica contra `prompt_templates.input_schema` → `assertWithinBudget` (429) → fila `ai_generations` → `runGeneration` fuera de tx → parseo `text`→JSON + Zod → tx (actualizar generación + `persistTokenUsage`) → auditoría `ai_generate` (best-effort).
- **Regeneración de sección** con `parent_generation_id` y sub-schema de salida.
- **Materialización de borrador en tablas de contenido:** **diferida** a GTK-41; este change persiste `output_structured` en `ai_generations` (decisión en `design.md`).
- **Contrato:** `docs/technical/api-spec.yml` + schemas Zod congelados (fase 2).
- **Tests:** Vitest (mocks + RBAC + presupuesto) + BD + curl N+2; **E2E N+3 omitido** (label `Backend`).
- **Docs:** `api-spec.yml`, `backend-standards.md` si aplica.

## Capabilities

### New Capabilities

- (ninguna — el comportamiento extiende la spec viva existente)

### Modified Capabilities

- `ai-generation-workflow`: añadir requisitos del endpoint admin, validación post-hoc de salida, gate de presupuesto previo, códigos HTTP y auditoría.

## Impact

- **Código:** `app/api/admin/ia/generar/route.ts`, `lib/ia/content-generation.ts`, `lib/ia/output-schema.ts`, `lib/ia/index.ts`, tests en `tests/unit/ia/**`, `tests/qa/gtk-38-db.qa.test.ts`.
- **BD:** escritura en `ai_generations`, `ai_token_usage`, `audit_logs` (sin migración).
- **API:** nuevo endpoint admin autenticado; patrón para futuros `/api/admin/*`.
- **Seguridad / RGPD:** sin PII en prompts/logs; RBAC estricto; presupuesto como control de abuso; salida no publicable si `partial` o schema inválido.
- **SEO/ISR:** no publica; deja salida en borrador lógico (`ai_generations`) hasta GTK-41/39/40.

## Fuera de alcance

- CRUD de contenido publicable y `upsertDraft` en entidades (`lib/content/drafts.ts` completo) — GTK-41.
- `content_revisions`, flujo editorial y publicación ISR — GTK-39 / GTK-40.
- UI del editor RF-19 — US frontend posterior.
- Rate limiting dedicado del endpoint — opcional GTK-26.
- Structured outputs nativos de Anthropic (`output_config.format`) — validación post-hoc con Zod.
- E2E Playwright en este ticket (label `Backend`).
