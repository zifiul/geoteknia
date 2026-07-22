# Tareas de implementación — GTK-16: Generación de contenido IA y flujo editorial

**Variante:** Harness DB (schema + migraciones, sin API/UI).

---

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [ ] 0.1 Revisar `openspec/config.yaml` y documentación de referencia (`docs/technical/data-model.md`, `docs/technical/backend-standards.md`).
- [ ] 0.2 Crear rama `feature/db-gtk-16-generacion-contenido-ia` desde `main` (o rama base acordada).
- [ ] 0.3 Verificar rama actual con `git branch --show-current` y `git status`.
- [ ] 0.4 Confirmar que no se sobrescribirá trabajo no relacionado del usuario.

---

## 1. Schema Prisma: definir enums y entidades (OBLIGATORIO)

- [ ] 1.1 Revisar `prisma/schema.prisma` actual y documentación de modelo en `docs/technical/data-model.md`.
- [ ] 1.2 Añadir enums `PromptPageType`, `AiGenerationStatus` al schema.
- [ ] 1.3 Añadir modelo `PromptTemplate` con campos: id (UUID), name, pageType, templateBody (@db.Text), inputSchema (Json), defaultModel, cacheablePrefix, version, isActive, bloques AUDIT, índices.
- [ ] 1.4 Añadir modelo `AiGeneration` con campos: id (UUID), promptTemplateId (FK), targetContentType, targetContentId, requestedById, model, inputParams (Json), renderedPrompt (@db.Text), outputText (@db.Text), outputStructured (Json), status, errorMessage, retryCount, latencyMs, isSectionRegeneration, parentGenerationId (auto-referencia opcional), índices por (targetContentType, targetContentId), (status), (model), (requested_by_id), (created_at).
- [ ] 1.5 Añadir modelo `AiTokenUsage` (append-only) con campos: id (UUID), aiGenerationId (UNIQUE FK), model, inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens, costEur (@db.Decimal(10,4)), billingPeriod (string YYYY-MM), createdAt (@default(now())), sin updated_at/deleted_at. Índices por (billing_period), (model), (created_at).
- [ ] 1.6 Añadir modelo `AiBudgetConfig` con campos: id (UUID), billingPeriod (UNIQUE nullable), monthlyBudgetEur (@db.Decimal(10,2)), alertThresholdPct (int %), modelByPageType (Json), notifyEmails (Json), isActive, bloques AUDIT.
- [ ] 1.7 Añadir modelo `ContentRevision` (append-only) con campos: id (UUID), contentType (string), contentId (UUID), versionNumber (int), bodySnapshot (Json), seoSnapshot (Json), workflowStatusAt (WorkflowStatus enum), editorId (UUID), changeSummary, aiGenerationId (FK nullable), createdAt (@default(now())), sin updated_at/deleted_at. Índice compuesto `(contentType, contentId, versionNumber)`.
- [ ] 1.8 Validar schema con `prisma validate`.

---

## 2. Migración de base de datos (OBLIGATORIO)

- [ ] 2.1 Ejecutar `prisma migrate dev --name ai_generation_editorial_revisions` (o nombre sugerido por descripción GTK-16).
- [ ] 2.2 Verificar que el nombre de migración aparece en `prisma/migrations/` con timestamp.
- [ ] 2.3 Revisar el SQL generado (`migration.sql`) y confirmar DDL: CREATE TYPE (enums), CREATE TABLE, ADD CONSTRAINT (FKs, índices, UNIQUE).
- [ ] 2.4 Verificar que no hay errores en Neon dev (si aplica).

---

## 3. Seed de maestros IA (OBLIGATORIO - TAREA DB-14)

> Este paso puede ser condicional si DB-14 es una tarea separada. Si GTK-16 incluye seed, hacerlo aquí.

- [ ] 3.1 Revisar descripción de GTK-16 sobre seed recomendado: ≥1 `prompt_template` por `page_type` con `default_model='claude-sonnet-4-6'`, `cacheable_prefix` e `input_schema`.
- [ ] 3.2 Si seed va en esta tarea: crear `lib/content/prompt-templates.seed.ts` o actualizar `prisma/seed.ts` con inserciones idempotentes.
- [ ] 3.3 Ejecutar `prisma db seed` (si existe script) o documentar que seed se ejecutará en fase RF-14.
- [ ] 3.4 Capturar estado de base de datos post-seed (contar `prompt_templates` por `page_type`).

---

## 4. Validación de schema y migraciones (OBLIGATORIO)

- [ ] 4.1 Ejecutar `prisma validate` nuevamente (pre-merge).
- [ ] 4.2 Verificar que no hay conflictos de schema con cambios paralelos.
- [ ] 4.3 Confirmar que `prisma migrate deploy` sería ejecutable en Neon staging/prod (sin simular, pero validar sintaxis).

---

## 5. Revisar y actualizar documentación de modelo (OBLIGATORIO)

- [ ] 5.1 Leer `docs/technical/data-model.md` actual.
- [ ] 5.2 Añadir sección para nuevas entidades: descripción, campos, relaciones, índices, restricciones append-only.
- [ ] 5.3 Documentar enums `PromptPageType`, `AiGenerationStatus`.
- [ ] 5.4 Actualizar diagramas ER si existen en formato Markdown o referencias.
- [ ] 5.5 Confirmar que toda documentación está en español y es coherente.

---

## 6. Verificación de base de datos (OBLIGATORIO - AGENTE DEBE EJECUTAR)

> Este paso es mínimo para Harness DB: sin curl/E2E. Ejecutable siempre que se toquen migraciones.

- [ ] 6.1 Capturar línea base pre-test: contar tablas, enums, índices relevantes (p. ej. `\dt+ prompt_templates` en psql o Prisma Studio).
- [ ] 6.2 Ejecutar `prisma db push` (dev) o `prisma migrate deploy` (staging) en entorno de prueba (rama Neon si disponible).
- [ ] 6.3 Verificar que las 5 tablas nuevas existen: `prompt_templates`, `ai_generations`, `ai_token_usage`, `ai_budget_config`, `content_revisions`.
- [ ] 6.4 Verificar que los enums existen: `"PromptPageType"`, `"AiGenerationStatus"` (en info de tipos de Neon).
- [ ] 6.5 Verificar índices creados correctamente (p. ej. índice compuesto en `content_revisions`).
- [ ] 6.6 Verificar UNIQUE constraints: `ai_token_usage.ai_generation_id`, `ai_budget_config.billing_period`.
- [ ] 6.7 Verificar FKs: `ai_generations.prompt_template_id` RESTRICT, `ai_generations.parent_generation_id` (self), `ai_token_usage.ai_generation_id` CASCADE, `content_revisions.ai_generation_id` SET NULL.
- [ ] 6.8 Confirmar que tablas `ai_token_usage` y `content_revisions` NO tienen `updated_at` ni `deleted_at` (append-only).
- [ ] 6.9 Restaurar base de datos o rama Neon (cleanup de test).
- [ ] 6.10 Crear informe `openspec/changes/gtk-16-generacion-contenido-ia/reports/2026-07-22-step-6-db-migration-and-schema-verification.md`.

---

## 7. Verificación de seguridad y RGPD (OBLIGATORIO - LIGERO)

- [ ] 7.1 Confirmar que ningún campo en `ai_generations` o `prompt_templates` almacena PII de `contacts`, `leads` o `projects` (RNF-IA).
- [ ] 7.2 Confirmar que `requested_by_id` y `editor_id` referencian tabla `users` (usuarios internos), no PII de clientes.
- [ ] 7.3 Verificar región EU: BD en Neon EU (configurado en proyecto).
- [ ] 7.4 Documentar amenazas resueltas en threat model de `design.md` (ya presente).

---

## 8. SAST / SCA (Security Scan - OBLIGATORIO LIGERO)

> Harness DB omite DAST (sin endpoints nuevos).

- [ ] 8.1 Ejecutar `semgrep --config=p/security-audit` sobre el diff de `prisma/schema.prisma` (si SAST disponible).
- [ ] 8.2 Ejecutar `npm audit` para verificar que no hay nuevas dependencias vulnerables (schema Prisma no añade deps).
- [ ] 8.3 Ejecutar `gitleaks` (si disponible) sobre la rama para detectar secrets accidentales.
- [ ] 8.4 Documentar hallazgos en `openspec/changes/gtk-16-generacion-contenido-ia/reports/security.md` (sin hallazgos esperados para schema puro).

---

## 9. Code Review (OBLIGATORIO)

> Esta tarea corre en paralelo con paso 8 (fase 5b). Aquí se lista por completitud.

- [ ] 9.1 Preparar el diff de schema/migración para revisión por `code-reviewer` o supervisor.
- [ ] 9.2 Ejecutar `/opsx:verify` si comando disponible.
- [ ] 9.3 Esperar veredicto `Veredicto: APTO` de `code-reviewer`.

---

## 10. Actualizar especificaciones principales (OBLIGATORIO)

- [ ] 10.1 Sincronizar delta specs de cambio hacia `openspec/specs/` con `/opsx:sync` si es necesario (antes de archive).
- [ ] 10.2 Confirmar que specs vivas en `openspec/specs/` reflejan las 4 nuevas capacidades.

---

## 11. Archive y PR (OBLIGATORIO)

- [ ] 11.1 Verificar que `require-code-review.sh <change-name>` pasa (existe `reports/code-review.md` con `Veredicto: APTO`).
- [ ] 11.2 Ejecutar `/opsx:archive gtk-16-generacion-contenido-ia`.
- [ ] 11.3 Confirmar que cambio se archiva en `openspec/changes/archive/2026-07-22-gtk-16-generacion-contenido-ia/`.
- [ ] 11.4 Crear PR con migración + schema + docs usando `/opsx:commit` o comando `commit` de skills.
- [ ] 11.5 Verificar que PR title/description referencia GTK-16 y describe schema de 5 entidades nuevas.

---

## Notas

- **Variante Harness DB:** pasos N+2 (curl) y N+3 (E2E Playwright) son **omitidos** porque no hay endpoints nuevos ni UI.
- **Append-only:** verificar explícitamente en paso 6.8 que `ai_token_usage` y `content_revisions` carecen de `updated_at`/`deleted_at`.
- **DB-14 dependencia:** la tarea de seed de maestros (`prompt_templates` iniciales) puede ejecutarse en GTK-16 (paso 3) o delegarse a tarea separada RF-14. Actualizar plan si se aplica variante.
- **Linaje parent_generation_id:** es auto-referencia opcional; validar sintaxis Prisma.
- **Security shift-left:** threat model en `design.md` ya incluye SEC-1 a SEC-6 (requisitos verificables). Code-review valida contra threat model.
