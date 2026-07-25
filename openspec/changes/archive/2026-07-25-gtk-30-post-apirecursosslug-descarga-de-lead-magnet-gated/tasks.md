# Tareas de Implementación: POST /api/recursos/[slug]: descarga de lead magnet gated

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] 0.1 Revisar `openspec/config.yaml` y documentación técnica aplicable (`docs/technical/backend-standards.md`, `docs/technical/openspec-tasks-mandatory-steps.md`).
- [x] 0.2 Crear rama `feature/backend-gtk-30-lead-magnet-gated` desde `main`.
- [x] 0.3 Verificar rama actual con `git branch --show-current` y `git status`.
- [x] 0.4 Confirmar que no se sobrescribirá trabajo no relacionado del usuario.

## 1. Backend: Contrato Zod y lectura pública de Lead Magnet

- [x] 1.1 Definir `resourceLeadSchema` en `lib/leads/schema.ts` exportándolo adecuadamente.
- [x] 1.2 Implementar `findGatedLeadMagnetBySlug(slug)` en `lib/content/lead-magnets.ts` para consulta pública sin requerir sesión admin.
- [x] 1.3 Exportar los nuevos miembros desde `lib/leads/index.ts`.

## 2. Backend: Caso de uso y persisitencia

- [x] 2.1 Crear `lib/leads/create-resource-lead.ts` con la lógica de transacción Prisma (`upsertContact` + `lead` + `project` con `REC-YYYYMMDD-XXXX`).
- [x] 2.2 Integrar envío de email `sendLeadConfirmation` post-commit con fallbacks (`serviceName: leadMagnet.title`, `province: 'Por determinar'`).
- [x] 2.3 Integrar evento de conversión `recordConversionEvent` (`resource_download`) best-effort post-commit.
- [x] 2.4 Generar `downloadUrl` estilizada/protegida y `thankYouUrl` para la respuesta.

## 3. Backend: Route Handler

- [x] 3.1 Crear `app/api/recursos/[slug]/route.ts` con la gestión de rate limit, Zod, Turnstile y manejo de excepciones `LeadCaptureError` / `RESOURCE_NOT_FOUND`.
- [x] 3.2 Actualizar `docs/technical/api-spec.yml` declarando `POST /api/recursos/{slug}`.

## 4. Backend: revisar y actualizar tests existentes (OBLIGATORIO)

- [x] 4.1 Localizar tests relacionados de `lib/leads` y `app/api/leads`.
- [x] 4.2 Añadir tests unitarios en Vitest para `resourceLeadSchema`, `findGatedLeadMagnetBySlug` y `createResourceLead`.

## 5. Backend: ejecutar tests unitarios y verificar base de datos (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 5.1 Capturar línea base de base de datos Neon para `contacts`, `leads`, `projects` y `conversion_events`.
- [x] 5.2 Ejecutar tests dirigidos en Vitest (`npx vitest run tests/unit/content/content-publication.test.ts` o suite en `tests/unit/leads/`).
- [x] 5.3 Verificar estado posterior y restaurar mutaciones de prueba (`db-state-verify`).
- [x] 5.4 Crear informe `openspec/changes/gtk-30-post-apirecursosslug-descarga-de-lead-magnet-gated/reports/2026-07-25-step-N+1-unit-test-and-db-verification.md`.

## 6. Backend: pruebas manuales de endpoints con curl (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 6.1 Verificar/arrancar servidor local Next.js en puerto activo.
- [x] 6.2 Ejecutar `curl` para `POST /api/recursos/[slug]` probando:
  - 201 Created (caso feliz con Turnstile bypass de dev).
  - 400 Bad Request (falta GDPR o email inválido).
  - 403 Forbidden (Turnstile token inválido).
  - 404 Not Found (slug inexistente o `is_gated=false`).
- [x] 6.3 Restaurar registros de prueba en la base de datos Neon.
- [x] 6.4 Crear informe `openspec/changes/gtk-30-post-apirecursosslug-descarga-de-lead-magnet-gated/reports/2026-07-25-step-N+2-curl-endpoint-verification.md`.

## 7. QA & Security Scan (fase 5a / 5b)

- [x] 7.1 Ejecutar `security-scan` (SAST sobre diff, SCA, gitleaks) y generar `reports/security.md`.
- [x] 7.2 Omitir E2E Playwright (N+3) explícitamente por regla de label `Backend`.

## 8. Actualizar documentación técnica (OBLIGATORIO)

- [x] 8.1 Actualizar `docs/technical/api-spec.yml` con el contrato HTTP.
- [x] 8.2 Verificar coincidencia con `docs/technical/data-model.md`.

## 9. Verificación OpenSpec y Code Review Gate

- [x] 9.1 Generar informe de Code Review en `reports/code-review.md` con veredicto APTO/NO APTO.
- [x] 9.2 Ejecutar `/opsx:sync` y `/opsx:archive` tras aprobación en Gate 2.
