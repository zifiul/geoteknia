# Design — gtk-38-generacion-contenido-ia

> US: [GTK-38](https://linear.app/geoteknia/issue/GTK-38)

## Decisiones (hallazgos Linear / repo)

| # | Tema | Decisión |
|---|------|----------|
| 1 | Cliente IA | Reutilizar `runGeneration`, `persistTokenUsage`, `selectModel` de GTK-36 sin duplicar retries/timeout/streaming. |
| 1b | Salida | Parsear `text` → JSON; validación post-hoc con `output-schema.ts`; `partial` por truncado (GTK-36) o schema inválido (GTK-38). |
| 2 | Auditoría | `recordAudit({ action: 'ai_generate', ... })` best-effort; whitelist existente. |
| 3 | Primer `/api/admin` | `withRoutePermission('ai.generate')`; patrón envelope + handler delgado. |
| 4 | Borrador en entidad | **GTK-41 no listo:** no crear `lib/content/drafts.ts` completo; persistir `output_structured` en `ai_generations`. La AC editorial “borrador_ia” se cumple a nivel de artefacto generado no publicado; materialización en tablas `services`/`blog_posts`/etc. queda para GTK-41. |
| 5 | Structured outputs API | No usar `output_config.format`; Zod post-hoc. |
| 6 | Transacciones | Claude fuera de tx; tx solo para update + `persistTokenUsage`. |
| 7 | Inputs | Validación dinámica JSON Schema almacenado en `prompt_templates.input_schema` (implementación con Zod/`zod-to-json-schema` o validador JSON Schema ligero acordado en impl). |
| 8 | Regeneración | Validar padre; sub-schema por `section`. |
| 9 | Presupuesto | `assertWithinBudget` antes de crear fila; **429** + `BUDGET_EXCEEDED`. |
| 10 | Envelope | `apiSuccess` / `apiError` (GTK-28). |

## Arquitectura

```
POST /api/admin/ia/generar
  → withRoutePermission('ai.generate')
  → generateContentSchema.parse(body)
  → resolveTemplate(pageType | templateId)
  → validateInputs(input_schema, inputs)
  → assertWithinBudget()  [429]
  → prisma.ai_generations.create (pending)
  → runGeneration({ userMessage, cacheablePrefix, model })  // sin tx
  → parseAndValidateOutput(text)
  → prisma.$transaction(update generation + persistTokenUsage)
  → recordAudit('ai_generate')  // best-effort
  → 201 + envelope
```

Plantillas: cargar `prompt_templates` con `is_active=true`; render `template_body` sustituyendo `{{key}}` desde `inputs` validados.

## Contrato HTTP (fase 2)

- Ruta: `POST /api/admin/ia/generar`
- Auth: sesión + `ai.generate`
- Rate limit: heredar política admin cuando GTK-26 aplique (documentar en api-spec; no bloqueante MVP)
- Códigos: 201, 400, 401, 403, 429, 502

## Threat model

### Superficie de ataque

- Nuevo Route Handler autenticado `POST /api/admin/ia/generar`.
- Payload JSON con `inputs` arbitrarios acotados por schema de plantilla.
- Salida de Claude persistida en `ai_generations` (contenido editorial, no PII de CRM).

### Actores

- Anónimo: no puede invocar (401).
- `gestor` / `tecnico`: sesión válida pero sin permiso (403).
- `editor` / `admin`: pueden generar (coste + contenido no publicado).
- Atacante con sesión de editor: abuso de coste vía generaciones masivas.

### Datos sensibles

- Prompts: solo parámetros SEO; prohibido PII de leads/contacts/projects (RNF-IA).
- `rendered_prompt` / `input_params` en BD (sin PII).
- Coste y tokens en `ai_token_usage`.

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Escalada de privilegio | llamar endpoint sin `ai.generate` | Generación no autorizada | `withRoutePermission`; tests 403 |
| T2 | Abuso de coste API | spam POST como editor | Gasto Anthropic | `assertWithinBudget` antes de Claude; 429 |
| T3 | PII en prompt | inputs maliciosos con email/teléfono | RGPD | Validación schema plantilla; convención editor; no mezclar CRM |
| T4 | Publicación accidental YMYL | persistir HTML sin revisión | SEO/legal | No escribir `workflow_status=publicado`; solo `ai_generations` |
| T5 | Prompt injection | strings en `inputs` | Calidad / exfil | Plantillas controladas; salida validada Zod; no ejecutar HTML |
| T6 | Fuga en logs | log de `rendered_prompt` completo | RGPD | Log estructurado: ids, modelo, latencia — sin texto de prompt |
| T7 | JSON malicioso en salida | Claude devuelve payload enorme | DoS / almacenamiento | Límites Zod + tamaño máximo en schema de entrada/salida |

### Requisitos de seguridad (criterios de aceptación)

- [ ] SEC-1: Sin sesión → 401; `gestor`/`tecnico` → 403 en `POST /api/admin/ia/generar`.
- [ ] SEC-2: Presupuesto superado → 429 sin llamada a Claude ni fila `ai_generations`.
- [ ] SEC-3: Tests de abuso verifican que mocks no reciben campos tipo email/teléfono de lead en `userMessage`.
- [ ] SEC-4: `recordAudit` solo usa claves whitelist de `ai_generate`.
- [ ] SEC-5: Errores 502 no exponen stack ni texto de prompt al cliente.

### Amenazas descartadas

- **Turnstile:** endpoint autenticado admin, no público.
- **IDOR sobre UUID ajeno:** generación crea recurso propio; lectura por ID no está en alcance GTK-38.
- **2FA adicional:** no exigido más allá de sesión admin existente.

## Testing (fases 3–5)

- Vitest: orquestación mockeada, RBAC, budget, partial output, section regen, audit metadata.
- BD: conteos `ai_generations` / `ai_token_usage` / `audit_logs`; restaurar con `db-state-verify`.
- curl N+2: 201, 400, 403, 429, 502 (con dev server).
- E2E N+3: **omitido** — label `Backend`; cubrirá US frontend del editor.
