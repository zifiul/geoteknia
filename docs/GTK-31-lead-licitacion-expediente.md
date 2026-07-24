# GTK-31 — POST /api/leads/licitacion: lead de licitación con referencia de expediente

> Ticket unificado (original + enriquecido con `/enrich-us`), listo para Linear. Fuente: [GTK-31 en Linear](https://linear.app/geoteknia/issue/GTK-31/post-apilicitaciones-lead-de-licitacion-con-referencia-de-expediente).
>
> Contrastado el 2026-07-24 contra el repo: **GTK-28 y GTK-29 ya están implementados** e hicieron el refactor DRY (existen `upsertContact`, `generateUniqueReferenceNumber(tx, prefix)`, `createProjectFromLead(..., titlePrefix)`, `emailField`/`phoneField`, `deriveLeadSource`, `recordConversionEvent`, envelope HTTP). GTK-31 es un **tercer hermano** que reutiliza todo ello; la estimación S/2 (antes irreal por falta de base) ahora es correcta.

## Descripción

Implementar el Route Handler público del formulario de licitaciones/obra pública, que captura contacto corporativo + **referencia de expediente O enlace a la plataforma de contratación** y crea un lead diferenciado de alto valor (`lead_type='licitacion'`, priorizable por importe) con su ficha de `project`. Es necesario para captar el segmento de subcontratación geotécnica con plazos de presentación estrictos. Materializa RF-15 (página de licitaciones con formulario y campo de expediente), US-11 y RF-18 (alta automática de ficha).

Es el tercer hermano del pipeline de captación tras GTK-28 (presupuesto) y GTK-29 (ubicación), ambos ya implementados: reutiliza su patrón de Route Handler, envelope HTTP, Turnstile, rate limiting, `upsertContact`, `generateUniqueReferenceNumber`, `createProjectFromLead`, `deriveLeadSource` y `recordConversionEvent`.

## Ruta(s) afectada(s)

* `app/api/leads/licitacion/route.ts` — Route Handler `POST` (ruta alineada con los hermanos, ver Hallazgo 1)
* `lib/leads/create-tender-lead.ts` — lógica de dominio (nuevo)
* `lib/leads/schema.ts` — añadir `tenderLeadSchema`
* `lib/projects/create-project-from-lead.ts` — extender con `expedienteRef?`/`estimatedValue?` (Hallazgo 3)
* `docs/technical/api-spec.yml` — añadir `POST /api/leads/licitacion`
* **Reutilizar (ya existen):** `lib/http/api-envelope.ts`, `lib/security/turnstile.ts`, `lib/security/rate-limit.ts`/`rate-limit-env.ts`, `lib/leads/upsert-contact.ts`, `lib/leads/reference.ts`, `lib/leads/attribution.ts`, `lib/leads/errors.ts`, `lib/analytics/record-event.ts`

## Criterios de aceptación

- [ ] Un POST válido crea `lead` con `lead_type='licitacion'`, persiste `expediente_ref` y crea el `project` con `expediente_ref` (y `estimated_value` si se aporta), devolviendo 201 con `referenceNumber`.
- [ ] Validación Zod (contacto corporativo + `expedienteRef` o `plataformaUrl` vía `superRefine`) y `gdprConsent=true`; inválido → 400.
- [ ] Token Turnstile inválido → 403 (y 502 si el verificador no responde).
- [ ] `lead` + `project` en transacción; sin huérfanos.
- [ ] El evento de conversión se diferencia con `lead_type='licitacion'` (verificable en `conversion_events`).
- [ ] Cubierto por rate limiting (429 con `Retry-After`).

## Implementación técnica (guía, no prescripción)

### 0. Hallazgos de contraste con el repo (a resolver antes de picar código)

| # | Hallazgo | Decisión |
|---|---|---|
| 1 | **Inconsistencia de ruta.** El ticket fija `app/api/licitaciones/route.ts` (`POST /api/licitaciones`), pero los dos hermanos shipped usan `POST /api/leads/<subtipo>` (`/api/leads/presupuesto`, `/api/leads/ubicacion`). `backend-standards.md` §5.1 documenta rutas mixtas (histórico), pero el código real ya fijó `/api/leads/*`. | Usar `app/api/leads/licitacion/route.ts` → **`POST /api/leads/licitacion`** por consistencia con lo shipped. Documentar la desviación respecto al texto del ticket y actualizar §5.1 si procede. |
| 2 | **Falta `gdprConsent` en el schema propuesto.** `leads.gdpr_consent` es **NOT NULL** (`data-model.md` §8); el insert fallaría sin él. Los hermanos ya lo exigen. | Añadir `gdprConsent: z.literal(true)` al `tenderLeadSchema` (400 si falta). |
| 3 | **`createProjectFromLead` NO persiste `expediente_ref` ni `estimated_value` en el `project`.** Verificado: solo escribe `leadId`, `stateId`, `title`, `serviceId`, `provinceId`. Pero la AC exige "crea el `project` con `expediente_ref`" y el original pide `estimated_value` (priorización CRM). | Extender `createProjectFromLead` con campos opcionales `expedienteRef?`/`estimatedValue?` (retrocompatible; GTK-28/29 no los pasan) y setearlos en el `data`. |
| 4 | **`organismo`, `plataformaUrl`, `esUte` no tienen columna propia** en `leads`. `expediente_ref` y `estimated_value` sí (en `leads` y `projects`). | Persistir `organismo`/`plataformaUrl`/`esUte` en el JSON `leads.project_data`. **No** duplicar con `public_organism_experience` (otro dominio E-E-A-T). |
| 5 | **`contactBaseSchema` shipped es de presupuesto** (exige `rol` del enum `professionalRoleSchema`, `nombre` min 2). El contacto de licitación es corporativo (empresa relevante; `rol` puede no aplicar igual). | Definir `tenderLeadSchema` propio reutilizando `emailField`/`phoneField` (ya exportados). Contacto: `nombre` + `empresa` + `email` requeridos, `telefono` opcional, sin forzar `rol`. Confirmar con el diseño del formulario. |
| 6 | **`sendLeadConfirmation` exige `serviceName`/`province` (min 1) y `to` email.** Una licitación puede no tener servicio ni provincia concretos. | Email con fallbacks: `serviceName: 'Solicitud de licitación'`, `province:` provincia si el formulario la aporta o literal `'Por determinar'`. Email siempre que haya `email` corporativo. No romper el contrato de GTK-27. |
| 7 | **Registro de `conversion_events`.** El ticket dice `generate_lead` con `lead_type='licitacion'`. GTK-28 ya lo hace best-effort post-commit; GTK-32 (`recordConversionEvent`) está implementado. | `recordConversionEvent({ eventName: 'generate_lead', leadId, leadType: 'licitacion', value: importeEstimado, source })` best-effort (patrón idéntico a `create-lead.ts`). |

**Piezas ya disponibles que GTK-31 reutiliza directamente (sin cambios):**
- `lib/http/api-envelope.ts` (`apiSuccess`/`apiError`/`zodFieldDetails`); patrón de Route Handler de `app/api/leads/presupuesto/route.ts` (clave rate limit `leads-licitacion:${ip}`).
- `lib/security/turnstile.ts`, `lib/security/rate-limit.ts` + `rate-limit-env.ts`.
- `lib/leads/upsert-contact.ts` (`upsertContact` — soporta contacto corporativo con `company`), `lib/leads/reference.ts` (`generateUniqueReferenceNumber(tx, 'LIC')`), `lib/leads/attribution.ts` (`deriveLeadSource`), `lib/leads/errors.ts` (`LeadCaptureError`).
- `lib/projects/create-project-from-lead.ts` (`createProjectFromLead` con `titlePrefix: 'Licitación'`, `findInitialProjectStateId`) — **con la extensión del Hallazgo 3**.
- `lib/analytics/record-event.ts` (`recordConversionEvent`).

### 1. Campos exhaustivos (contraste con `schema.prisma` `Lead`/`Project`)

**Entrada (Zod, `lib/leads/schema.ts` — nuevo `tenderLeadSchema`)**

```typescript
export const tenderLeadSchema = z
  .object({
    // Contacto corporativo
    nombre: z.string().trim().min(2).max(200),
    empresa: z.string().trim().min(1).max(200),
    email: emailField,
    telefono: phoneField.optional(),
    // Específicos de licitación
    organismo: z.string().trim().max(200).optional(),
    expedienteRef: z.string().trim().max(200).optional(),
    plataformaUrl: z.string().trim().url().optional(),
    importeEstimado: z.coerce.number().positive().max(1e10).optional(),
    esUte: z.boolean().optional(),
    provincia: z.string().trim().min(1).optional(),   // slug si el formulario lo aporta
    gdprConsent: z.literal(true),                      // Hallazgo 2
    turnstileToken: z.string().min(1),
    utmSource: z.string().trim().max(200).optional(),
    utmMedium: z.string().trim().max(200).optional(),
    utmCampaign: z.string().trim().max(200).optional(),
    gaClientId: z.string().trim().max(200).optional(),
    landingUrl: z.string().trim().url().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (!data.expedienteRef && !data.plataformaUrl) {
      ctx.addIssue({ code: 'custom', path: ['expedienteRef'],
        message: 'Indica la referencia de expediente o el enlace a la plataforma de contratación' });
    }
  });
```

**Escritura (mapeo a `leads` / `projects`)**

| Campo entrada | Columna | Notas |
|---|---|---|
| `nombre`/`empresa`/`email`/`telefono` | `contacts.full_name`/`company`/`email`/`phone` | `upsertContact` (dedupe email OR phone) |
| — | `leads.lead_type='licitacion'`, `channel='formulario'` | Enums ya existentes |
| — | `leads.source` | `deriveLeadSource(...)` |
| — | `leads.reference_number` | `LIC-YYYYMMDD-XXXX` (`generateUniqueReferenceNumber(tx, 'LIC')`) |
| `expedienteRef` | `leads.expediente_ref` **y** `projects.expediente_ref` | RF-15; project vía extensión (Hallazgo 3) |
| `importeEstimado` | `leads.estimated_value` **y** `projects.estimated_value` | `Decimal(12,2)`; priorización CRM |
| `organismo`/`plataformaUrl`/`esUte` | `leads.project_data` (JSON) | Sin columna propia (Hallazgo 4) |
| `provincia` (slug, si viene) | `leads.province_id` / `projects.province_id` | Resolver contra `provinces.slug`; null si no |
| `utm*`/`gaClientId`/`landingUrl` | `leads.utm_*`/`ga_client_id`/`landing_url` | Atribución |
| `gdprConsent` | `leads.gdpr_consent` | `true`; si falta → 400 |
| — | `projects.title` (generado) | `titlePrefix: 'Licitación'` |
| — | `projects.state_id` = `is_initial` | `findInitialProjectStateId` |

Licitación **no tiene `servicio`** → `service_id` null en lead y project (soportado por `createProjectFromLead`).

### 2. Endpoint y contrato HTTP

* Ruta: `app/api/leads/licitacion/route.ts` → `POST /api/leads/licitacion` (Hallazgo 1).
* Éxito `201`: `apiSuccess({ referenceNumber }, 201)`.
* Errores (`apiError`): 400 `VALIDATION_ERROR` (Zod/superRefine, slug de provincia inexistente), 403 `TURNSTILE_INVALID`, 502 `TURNSTILE_UNAVAILABLE`, 429 `RATE_LIMITED` (con `Retry-After`), 500 `INTERNAL_ERROR`.
* Email de confirmación (con fallbacks, Hallazgo 6) + `conversion_events` (`generate_lead`/`licitacion`) best-effort post-commit.

### 3. Ficheros a crear/modificar

- **Crear** `app/api/leads/licitacion/route.ts` — Route Handler (patrón de `presupuesto`/`ubicacion`, clave rate limit `leads-licitacion:${ip}`).
- **Crear** `lib/leads/create-tender-lead.ts` — caso de uso `createTenderLead(input)`: transacción `contact + lead + project` (con `expediente_ref`/`estimated_value` en ambos), email + `generate_lead` best-effort post-commit. Espejo de `create-lead.ts`/`create-location-lead.ts`.
- **Modificar** `lib/leads/schema.ts` — añadir `tenderLeadSchema` + `TenderLeadInput`.
- **Modificar** `lib/projects/create-project-from-lead.ts` — añadir `expedienteRef?`/`estimatedValue?` opcionales al input y al `data` (Hallazgo 3, retrocompatible).
- **Modificar** `lib/leads/index.ts` — exportar el nuevo caso de uso y schema.
- **Modificar** `docs/technical/api-spec.yml` — añadir `POST /api/leads/licitacion` reutilizando `ApiErrorEnvelope`.
- **Reutilizar sin cambios** `upsertContact`, `generateUniqueReferenceNumber`, `deriveLeadSource`, turnstile, rate limit, envelope, `recordConversionEvent`.

## Seguridad

* **Autenticación requerida:** Pública (Turnstile).
* **Datos de entrada validados con Zod:** Sí (`.strict()` + `superRefine`).
* **PII en logs o prompts de Claude:** No — contacto corporativo y datos de expediente en `contacts`/`leads`; nunca a Claude ni en logs en claro (solo `referenceNumber` + resultado). `gdpr_consent=true` obligatorio.
* **Entrada en audit_log:** No (frontal público; trazabilidad en `leads`/`conversion_events`).
* Turnstile server-side (403/502) + rate limiting (429, GTK-26) + Zod `.strict()`.

## Tests a escribir

- Unitario (Vitest): `tenderLeadSchema` (superRefine rechaza sin expediente ni plataforma; acepta con uno; rechaza sin `gdprConsent`); `create-tender-lead` (crea lead `licitacion` + project con `expediente_ref` y `estimated_value` en ambos; rollback si falla el project; `generate_lead`/`licitacion` best-effort; `reference_number` con prefijo `LIC-`); extensión de `createProjectFromLead` (persiste `expedienteRef`/`estimatedValue`).
- Verificación de BD (skill `db-state-verify`): conteo antes/después en `contacts`/`leads`/`projects`/`conversion_events`; comprobar `expediente_ref`/`estimated_value` en project; restaurar.
- E2E (Playwright): envío con expediente + contacto (201); envío sin expediente ni plataforma (400).

## Definición de terminado

Como este ticket va a convertirse en un cambio OpenSpec, `tasks.md` debe seguir `docs/technical/openspec-tasks-mandatory-steps.md` íntegro, en particular:

- Paso 0 (obligatorio, primero): rama `feature/backend-gtk-31-lead-licitacion` desde `main`; verificar `git status`.
- `api-contract-governance` (fase 2): declarar `POST /api/leads/licitacion` en `api-spec.yml` (reutilizando `ApiErrorEnvelope`) y congelar el contrato antes de implementar.
- Extensión retrocompatible de `createProjectFromLead` con los tests de GTK-28/29 en verde.
- Tests unitarios + verificación de BD (según "Tests a escribir"), informe en `openspec/changes/<change-name>/reports/`.
- `curl` (obligatorio, agente ejecuta): 201 con expediente+contacto, 400 sin expediente ni plataforma, 403 Turnstile inválido; verificar `expediente_ref`/`estimated_value` persistidos; limpiar datos.
- E2E Playwright (según "Tests a escribir").
- `security-scan` (fase 5b): endpoint público nuevo → DAST ligero, rate limit y no filtrado de PII.
- Ejecutar `/opsx:verify` antes de archivar.

## Requisitos no funcionales

- **RGPD/PII**: contacto corporativo y datos de expediente en `contacts`/`leads`; nunca a Claude ni en logs; `gdpr_consent=true` obligatorio.
- **Seguridad**: Turnstile server-side (403/502) + rate limiting (429, GTK-26) + Zod `.strict()`.
- **Rendimiento**: transacción mínima; email y `generate_lead` best-effort/post-commit, no bloquean la respuesta (§13.1).
- **Observabilidad**: log estructurado del alta (`referenceNumber`, resultado, sin PII).
- **Auditoría**: sin `audit_logs` (frontal público).
- **CRM**: `estimated_value` en `leads` y `projects` habilita la priorización por valor del segmento de licitaciones.

## Dependencias

* **Variables de entorno:** `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (ya validadas); `RATE_LIMIT_PUBLIC_PER_MIN` opcional (GTK-26).
* **Estado en repo:** GTK-28 ✅ y GTK-29 ✅ implementados (proveen `upsertContact`, `generateUniqueReferenceNumber(tx, prefix)`, `createProjectFromLead(..., titlePrefix)`, `emailField`/`phoneField`); GTK-26 ✅ (rate limit); GTK-27 ✅ (email); GTK-32 ✅ (`recordConversionEvent`); `api-spec.yml` ✅ poblado (falta este endpoint); modelos y enums (`licitacion`, `expediente_ref`, `estimated_value`) ✅ en `schema.prisma`.
* Única modificación transversal: extender `createProjectFromLead` (Hallazgo 3), retrocompatible.
* No bloqueante: frontend del formulario de licitaciones (otro ticket) — el endpoint es consumible por curl/Postman.

## Estimación

Complejidad **S** / **2 puntos**. Ahora sí es realista (en la primera valoración no lo era porque faltaba toda la base): con GTK-28/29 shipped, GTK-31 se reduce a `tenderLeadSchema` + `create-tender-lead.ts` + el Route Handler + la pequeña extensión retrocompatible de `createProjectFromLead`. Es el hermano más barato del pipeline gracias al refactor DRY que hizo GTK-29.
