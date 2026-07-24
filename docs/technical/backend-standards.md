# Estándares de Backend — Geoteknia

> Convenciones de desarrollo backend para el monolito modular Next.js de Geoteknia. Aplica a Route Handlers, Server Actions, servicios de dominio, Prisma, Auth.js, integración con Claude, email transaccional, auditoría, seguridad y pruebas.

---

## 1. Introducción

Este documento define los estándares backend del proyecto Geoteknia. El sistema es un **monolito modular Next.js full-stack** orientado a captación B2B, SEO programático, portal interno, CRM ligero, generación asistida por IA y trazabilidad completa de leads, contenidos y proyectos.

El backend no se implementa como una API Express separada. La capa servidor vive dentro de Next.js mediante:

- **Route Handlers** para endpoints HTTP consumidos por formularios, integraciones y automatizaciones.
- **Server Actions** para mutaciones internas desde componentes del App Router cuando aporten simplicidad y seguridad.
- **Módulos de dominio en `/lib`** para encapsular reglas de negocio, acceso a datos, validación y orquestación.
- **Prisma + PostgreSQL Neon EU** como fuente persistente.

Las decisiones backend deben proteger tres prioridades del producto:

1. **Captación y medición de leads cualificados** por servicio, zona, origen y canal.
2. **SEO e ISR** como parte central del negocio, especialmente la publicación de contenido sin redeploy.
3. **RGPD/LOPDGDD y seguridad del portal interno**, con especial cuidado en PII, Auth.js, RBAC, 2FA, auditoría e IA.

---

## 2. Stack Tecnológico

### 2.1 Tecnologías principales

| Capa | Estándar |
|---|---|
| Runtime | Next.js 15 App Router sobre Vercel |
| Lenguaje | TypeScript en modo estricto |
| Backend HTTP | Route Handlers en `app/api/**/route.ts` |
| Mutaciones internas | Server Actions en módulos de servidor |
| ORM | Prisma |
| Base de datos | PostgreSQL gestionado en Neon, región EU |
| Validación runtime | Zod |
| Autenticación | Auth.js v5 con credenciales, sesiones, 2FA TOTP y RBAC |
| Email | Resend + React Email |
| IA | SDK oficial de Anthropic, solo server-side |
| Anti-spam | Cloudflare Turnstile |
| Observabilidad | Sentry, Axiom/logs estructurados y auditoría propia |
| Testing | Vitest para unidad/integración, Playwright para flujos críticos |

### 2.2 Dependencias server-only

Las dependencias que manejan secretos, PII, base de datos, Auth.js, Anthropic, Resend o tokens deben importarse solo desde módulos de servidor.

Usar `server-only` en módulos sensibles:

```typescript
import 'server-only';
```

No importar módulos de `/lib/server`, Prisma, Anthropic, Resend ni utilidades de sesión desde componentes cliente.

---

## 3. Arquitectura Backend

### 3.1 Monolito modular

El backend se organiza por capacidades de negocio, no por tecnología accidental. La frontera recomendada es:

```text
app/
├── api/                         # Route Handlers públicos o internos
│   ├── leads/
│   ├── ubicacion-parcela/
│   ├── lead-magnets/
│   ├── licitaciones/
│   ├── conversion-events/
│   ├── calculator/
│   └── revalidate/
├── admin/                       # Portal interno protegido
└── (public)/                    # Sitio público

lib/
├── auth/                        # Auth.js, sesiones, 2FA, RBAC
├── db/                          # Prisma client, helpers transaccionales
├── leads/                       # Captación, cualificación y formularios
├── projects/                    # CRM ligero y pipeline
├── content/                     # Contenido publicable, revisiones, ISR
├── ai/                          # Claude, prompts, costes, sanitización PII
├── email/                       # Resend y plantillas transaccionales
├── audit/                       # Audit log append-only
├── analytics/                   # Conversion events y dataLayer server-side
├── validations/                 # Schemas Zod compartidos por dominio
└── shared/                      # Errores, tipos, utilidades puras

prisma/
├── schema.prisma
├── migrations/
└── seed.ts
```

Si el código final usa una estructura distinta, debe conservar la misma intención: módulos de dominio explícitos, servidor aislado y dependencias externas encapsuladas.

### 3.2 Capas por módulo

Cada módulo de `/lib` debe separar responsabilidades:

| Capa | Responsabilidad | Ejemplo |
|---|---|---|
| Validación | Parsear y validar entradas externas con Zod | `leadInputSchema` |
| Aplicación | Orquestar casos de uso y transacciones | `createBudgetLead()` |
| Dominio | Reglas de negocio puras e invariantes | cualificación, estados, permisos |
| Infraestructura | Prisma, Anthropic, Resend, Turnstile, Sentry | `leadRepository`, `claudeClient` |
| Presentación | Route Handler o Server Action | `POST /api/leads/presupuesto` |

No colocar reglas de negocio complejas directamente en `route.ts` ni en componentes React.

### 3.3 DDD pragmático

El proyecto debe usar DDD de forma práctica, sin sobrediseñar el MVP:

- Modelar como **agregados** los conceptos con invariantes claras: `Lead`, `Project`, `ContentItem`, `AiGeneration`, `UserSession`.
- Usar **value objects** para conceptos reutilizables y validables: email, teléfono, slug, referencia catastral, provincia, estado editorial, evento de conversión.
- Crear **servicios de dominio** cuando una regla no pertenece a una única entidad: cálculo de alcance geotécnico, cambio de estado editorial, control de coste IA, asignación de técnico.
- Usar **repositorios** donde haya consultas complejas, transacciones, soft delete, filtros o necesidad de testear la lógica sin Prisma real.
- Evitar clases vacías que solo envuelven datos. Si una clase no protege invariantes ni comportamiento, preferir tipos, schemas Zod y funciones puras.

### 3.4 Principios SOLID y DRY

Aplicar **SOLID** y **DRY** como guía práctica para mantener el backend modular, testeable y fácil de evolucionar. No deben usarse para introducir abstracciones prematuras, sino para reducir acoplamiento real, duplicación relevante y responsabilidades mezcladas.

#### Single Responsibility Principle (SRP)

Cada módulo, función o clase debe tener una razón clara para cambiar.

- Un Route Handler traduce HTTP a un caso de uso; no contiene reglas de negocio.
- Un schema Zod valida y normaliza entrada; no persiste datos.
- Un servicio de aplicación orquesta el caso de uso; no conoce detalles de React ni de la respuesta HTTP.
- Un repositorio encapsula acceso a datos; no decide reglas editoriales o comerciales.
- Un cliente de infraestructura llama a proveedores externos; no transforma el dominio.

Ejemplo recomendado:

```typescript
export async function POST(request: Request) {
  const input = await parseJson(request, budgetLeadSchema);
  const result = await createBudgetLead(input);

  return okJson({ leadId: result.id }, 201);
}
```

En este patrón, `POST` no calcula cualificación, no envía emails directamente y no escribe auditoría manualmente; delega en el caso de uso.

#### Open/Closed Principle (OCP)

El sistema debe permitir ampliar comportamiento sin modificar código estable más de lo necesario.

- Añadir un nuevo tipo de lead no debe obligar a reescribir todos los endpoints de captación.
- Añadir un nuevo evento de conversión debe apoyarse en enums, schemas y handlers reutilizables.
- Añadir un nuevo proveedor de email o IA debe hacerse detrás de una interfaz mínima del módulo correspondiente.
- Las reglas específicas por tipo de contenido deben vivir en estrategias, mapas tipados o funciones de dominio, no en cadenas largas de `if/else` dispersas.

Usar OCP cuando ya exista variación real. No crear jerarquías genéricas para casos hipotéticos.

#### Liskov Substitution Principle (LSP)

Cuando se definan interfaces o adaptadores, cualquier implementación debe respetar el mismo contrato.

- Un repositorio mockeado en tests debe comportarse como el repositorio real en errores esperados, nulos y formatos.
- Un proveedor alternativo de email debe devolver resultados equivalentes para éxito, fallo recuperable y fallo definitivo.
- Un cliente de IA fake no debe saltarse validaciones que el cliente real exige al flujo.

Evitar herencia salvo que aporte valor claro. Preferir composición, funciones puras e interfaces pequeñas.

#### Interface Segregation Principle (ISP)

Las interfaces deben ser pequeñas y orientadas al consumidor.

- Un caso de uso que solo lee leads no debe depender de un repositorio con métodos de escritura.
- Un servicio de publicación no debe depender de todas las operaciones del CMS si solo necesita aprobar y revalidar.
- Separar puertos como `LeadReader`, `LeadWriter`, `AuditAppender`, `EmailSender` o `AiContentGenerator` cuando ayuden a testear y reducir acoplamiento.

No crear interfaces por defecto para cada clase. Crear una interfaz cuando haya varias implementaciones, un mock relevante o una frontera de infraestructura clara.

#### Dependency Inversion Principle (DIP)

La lógica de aplicación y dominio no debe depender directamente de Prisma, Anthropic, Resend, Sentry ni APIs de framework cuando eso dificulte testear o cambiar la implementación.

- Los casos de uso deben recibir dependencias como parámetros o desde factories de servidor.
- Prisma debe quedar encapsulado en repositorios o helpers de persistencia.
- Anthropic, Resend y Turnstile deben quedar detrás de clientes propios del proyecto.
- Los módulos de dominio no deben importar `next/server`, `next/cache`, SDKs externos ni variables de entorno.

Ejemplo:

```typescript
export type CreateBudgetLeadDeps = {
  leads: LeadWriter;
  audit: AuditAppender;
  email: EmailSender;
};

export async function createBudgetLead(input: BudgetLeadInput, deps: CreateBudgetLeadDeps) {
  const lead = await deps.leads.create(input);
  await deps.audit.append({ action: 'lead.create', targetId: lead.id });
  await deps.email.sendBudgetLeadConfirmation(lead.id);

  return lead;
}
```

#### DRY sin ocultar el dominio

Evitar duplicación de conocimiento, no necesariamente cada repetición de líneas.

Centralizar:

- Schemas Zod y tipos derivados.
- Formato de respuestas JSON y errores.
- Checks de sesión, RBAC y permisos.
- Normalización de email, teléfono, slugs y referencias.
- Mapeo de errores de Prisma a errores de aplicación.
- Clientes de Anthropic, Resend, Turnstile, Sentry y Prisma.
- Escritura de audit log y eventos de conversión.

No centralizar prematuramente:

- Dos flujos de negocio que se parecen pero tienen reglas distintas.
- Validaciones que comparten campos pero producen mensajes o efectos diferentes.
- Código de test si una factory genérica vuelve opaco el escenario.

Regla práctica: si la duplicación representa una regla de negocio que debe cambiar en un único lugar, aplicar DRY. Si solo son tres líneas similares que mantienen dos casos más claros, mantenerlas separadas.

---

## 4. Convenciones de Código

### 4.1 Idioma

El proyecto documenta en español. En backend:

- Comentarios, documentación interna, descripciones Prisma y mensajes de commit: **español**.
- Nombres de variables, funciones, tipos, modelos y ficheros: preferentemente **inglés técnico** cuando representen código ejecutable, para mantener coherencia con ecosistema TypeScript/Prisma.
- Mensajes visibles al usuario final: **español**.
- Códigos de error, claves JSON, enums técnicos y nombres de eventos: estables, ASCII y en inglés o formato canónico definido por el modelo.

Ejemplo:

```typescript
throw new AppError('VALIDATION_ERROR', 'Los datos del formulario no son válidos');
```

### 4.2 Nombres

| Elemento | Convención | Ejemplo |
|---|---|---|
| Variables y funciones | `camelCase` | `createBudgetLead` |
| Tipos, interfaces y clases | `PascalCase` | `LeadRepository` |
| Constantes globales | `UPPER_SNAKE_CASE` | `MAX_AI_MONTHLY_COST_EUR` |
| Ficheros de código | `kebab-case` o patrón local consistente | `lead-service.ts` |
| Modelos Prisma | `PascalCase` | `ConversionEvent` |
| Campos Prisma | `camelCase` con `@map` a `snake_case` | `createdAt @map("created_at")` |
| Tablas y columnas físicas | `snake_case` | `conversion_events` |

### 4.3 TypeScript

- Activar `strict`.
- Tipar parámetros y retornos públicos de funciones exportadas.
- Evitar `any`; usar `unknown`, schemas Zod o tipos derivados.
- No duplicar tipos manualmente cuando puedan derivarse de Zod o Prisma.
- No confiar en tipos TypeScript para datos externos: todo input HTTP, webhook, formulario y respuesta de IA debe validarse en runtime.

Patrón recomendado:

```typescript
const parsed = budgetLeadSchema.safeParse(await request.json());

if (!parsed.success) {
  return problemJson(validationProblem(parsed.error), 400);
}

const lead = await createBudgetLead(parsed.data);
return okJson({ leadId: lead.id }, 201);
```

---

## 5. Route Handlers y Server Actions

### 5.1 Cuándo usar Route Handlers

Usar `app/api/**/route.ts` cuando:

- El endpoint sea consumido desde formularios públicos, integraciones, webhooks o scripts.
- Se necesite un contrato HTTP estable.
- Haya que aplicar Turnstile, rate limiting, CORS, trazabilidad o status codes explícitos.
- El flujo genere conversión medible o lead.

Endpoints esperados en el MVP:

```text
POST /api/leads/presupuesto
POST /api/ubicacion-parcela
POST /api/lead-magnets
POST /api/licitaciones
POST /api/conversion-events
POST /api/calculator/alcance
POST /api/revalidate
```

### 5.2 Cuándo usar Server Actions

Usar Server Actions cuando:

- La mutación sea interna del portal admin.
- El flujo esté protegido por sesión y RBAC.
- No haga falta exponer un endpoint público estable.
- La acción esté cerca del formulario o pantalla que la dispara, pero la lógica viva en `/lib`.

Las Server Actions deben validar permisos y entradas igual que un endpoint HTTP.

### 5.3 Respuestas HTTP

Todas las respuestas JSON deben ser consistentes.

Éxito:

```json
{
  "success": true,
  "data": {
    "id": "uuid"
  }
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos enviados no son válidos",
    "details": []
  }
}
```

Usar status codes correctos:

| Código | Uso |
|---:|---|
| 200 | Lectura o mutación idempotente completada |
| 201 | Recurso creado |
| 204 | Operación correcta sin cuerpo |
| 400 | Validación fallida |
| 401 | No autenticado |
| 403 | Sin permisos |
| 404 | Recurso inexistente o no visible |
| 409 | Conflicto de estado o unicidad |
| 429 | Rate limit o anti-spam |
| 500 | Error inesperado |

---

## 6. Validación y Errores

### 6.1 Zod como contrato de entrada

Cada endpoint, Server Action y adaptador externo debe tener schema Zod.

- Validar antes de ejecutar lógica de negocio.
- Normalizar datos en el schema cuando sea seguro: trim, lowercase de email, coerción controlada de fechas.
- Mantener schemas cerca del módulo de dominio: `lib/leads/lead-schemas.ts`, `lib/content/content-schemas.ts`.
- Exportar tipos derivados con `z.infer`.

### 6.2 Errores de aplicación

Usar errores tipados para errores esperados:

```typescript
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

No filtrar detalles internos al usuario. Registrar contexto técnico en logs, pero devolver mensajes seguros.

### 6.3 Patrón de manejo

- Los casos de uso lanzan `AppError` para errores esperados.
- Los Route Handlers traducen errores a JSON.
- Los errores inesperados se registran con `requestId`, usuario si existe y operación.
- No envolver todos los errores si no se añade contexto útil.

---

## 7. Prisma y Base de Datos

### 7.1 Principios del modelo

El modelo de datos se rige por `docs/technical/data-model.md`:

- PostgreSQL + Prisma como fuente de verdad.
- IDs UUID para entidades persistentes.
- Tablas y columnas físicas en `snake_case` mediante `@@map` y `@map`.
- Soft delete selectivo con `deleted_at`.
- Tablas append-only para auditoría, sesiones operativas y eventos.
- Región EU obligatoria.
- Integridad polimórfica validada por dominio cuando Prisma no pueda expresarla.

### 7.2 Prisma Client

- Instanciar Prisma en un único módulo server-only, por ejemplo `lib/db/prisma.ts`.
- Evitar crear clientes Prisma en cada función.
- No importar Prisma Client desde componentes cliente.
- En tests unitarios, mockear repositorios o cliente Prisma.

### 7.3 Migraciones

- Todo cambio de esquema requiere migración versionada.
- Revisar el SQL generado antes de aplicarlo.
- No editar migraciones ya compartidas salvo que aún no hayan salido de la rama local.
- Los seeds deben ser idempotentes.
- Los catálogos base, roles y permisos deben poder reconstruirse desde `seed.ts`.

Comandos esperados:

```bash
npx prisma migrate dev --name nombre_descriptivo
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

### 7.4 Consultas

- Seleccionar solo los campos necesarios.
- Usar `include` y `select` para evitar N+1.
- Paginar listados administrativos.
- Aplicar filtros de `deletedAt: null` en entidades con soft delete.
- Encapsular transacciones en servicios de aplicación.

Ejemplo:

```typescript
await prisma.$transaction(async (tx) => {
  const lead = await leadRepository.create(tx, input);
  await auditRepository.append(tx, {
    action: 'lead.create',
    targetId: lead.id,
  });
  return lead;
});
```

---

## 8. Seguridad

### 8.1 Reglas generales

- Nunca commitear `.env`, secretos, dumps con PII ni claves de proveedores.
- Validar variables de entorno al arrancar.
- Mantener claves de Anthropic, Resend, Auth.js, Neon y Turnstile solo en servidor.
- Aplicar rate limiting en endpoints públicos de captación con `checkRateLimit` (`lib/security/rate-limit.ts`; umbrales `RATE_LIMIT_*` en `lib/env.ts`).
- Proteger formularios públicos con Turnstile cuando sean susceptibles de spam.
- Sanitizar HTML y contenido generado por IA antes de publicarlo.

### 8.2 RGPD y PII

El backend debe minimizar y aislar PII:

- No enviar datos personales de `contacts`, `leads` o `projects` a Claude.
- No guardar PII en `ai_generations.input_params` ni `rendered_prompt`.
- No registrar cuerpos completos de formularios en logs.
- Registrar identificadores y metadatos, no contenido sensible.
- Mantener datos en proveedores con región EU y DPA cuando aplique.
- Respetar consentimiento para analítica y marketing.

### 8.3 Auth.js, RBAC y 2FA

- El portal `/admin` requiere sesión válida.
- Los roles canónicos son `admin`, `gestor`, `editor` y `tecnico`.
- Los permisos se evalúan por código atómico, por ejemplo `content.publish` o `projects.read`.
- Acciones críticas requieren RBAC explícito en servidor, no solo ocultar UI.
- Login, login fallido, cambio de rol, publicación, aprobación, generación IA y exportación deben generar audit log.
- 2FA TOTP es obligatorio para perfiles con permisos sensibles.
- Toda comprobación de autorización en Server Actions/Route Handlers usa `requirePermission`/`withPermission`/`withRoutePermission` de `lib/auth/rbac.ts` (GTK-25), nunca comprobaciones de rol ad hoc en el handler.
- `can(user, permissionCode)` resuelve el permiso **en memoria** contra `resolvePermissionCodesForRole` (`lib/auth/permissions.ts`); no consulta `role_permissions` en runtime — esa tabla es solo la materialización vía seed de la matriz de código.
- La autorización obtiene la sesión con `getPortalSession()` (`lib/auth/session.ts`), que sí comprueba el espejo de sesión en BD (revocación/expiración). **Nunca** usar `getServerSession()` (solo valida el JWT) para decidir acceso.
- El rol `tecnico` exige además `assertOwnership()` sobre recursos con `assigned_technician_id`; toda denegación (permiso o pertenencia) responde con el mismo `ForbiddenError` genérico, sin filtrar si el recurso existe.
- **TOTP (GTK-24):** la verificación en login usa el punto de extensión `registerVerifyTotp` / `verifyTotp` en `lib/auth/totp.ts`. La implementación real (`lib/auth/totp-verifier.ts`) se registra por efecto de importación desde `lib/auth/config.ts` antes de cualquier `authorize()`. El secreto se cifra en reposo con `TWOFA_ENCRYPTION_KEY` (`lib/auth/crypto.ts`).
- **Gestión self-service 2FA (GTK-24):** enrolamiento y desactivación vía Server Actions en `lib/auth/totp-actions.ts` (schemas en `lib/auth/totp-schemas.ts`, documentadas en `api-spec.yml` → `x-geoteknia-serverActions`). Requieren sesión portal (`getPortalSession()`); no sustituyen RBAC en otras mutaciones. UI: `app/(admin)/perfil/seguridad/`.
- **Sub-eventos de auditoría en `role_change`:** además de cambios de rol RBAC, la whitelist de `METADATA_WHITELIST.role_change` admite `event` (p. ej. `2fa_enabled`, `2fa_disabled`) para distinguir activación/desactivación de 2FA sin ampliar el enum `AuditAction`.

### 8.4 Aislamiento de `/admin` (GTK-26)

- **`middleware.ts` (Edge Runtime):** matcher `/admin/:path*` y `/api/admin/:path*`. Comprueba solo JWT de sesión vía `auth()` de `lib/auth/auth-edge.ts` (config Auth.js mínima, **sin** Prisma ni `import 'server-only'`). No consulta `sessions` en BD.
- **Capa autoritativa (Node.js):** Server Components, Server Actions y Route Handlers de `/admin` deben seguir usando `getPortalSession()` / `requireSession()` (`lib/auth/session.ts`), que valida revocación y expiración en la tabla `sessions`. El middleware **no sustituye** esta capa: un JWT aún válido puede pasar el middleware mientras la sesión esté revocada en BD hasta que el handler Node rechace el acceso.
- **Prohibido en middleware:** importar `lib/db.ts`, `lib/env.ts` (`server-only`) o `lib/auth/config.ts` (arrastra Prisma). Umbrales de rate limit en Edge: `readRateLimitEnv()` en `lib/security/rate-limit-env.ts` (lee `process.env` sin Zod server-only).
- **Comportamiento HTTP:** sin sesión → redirect 307 a `/admin/login` (páginas) o `401` JSON `{ success: false, error: { code: 'UNAUTHORIZED', ... } }` (rutas bajo `/api/admin`). Cabeceras `X-Robots-Tag: noindex, nofollow` y `SECURITY_HEADERS` vía `lib/security/headers.ts`.
- **`app/robots.ts`:** `Disallow` de `/admin` (complementa cabeceras HTTP; el meta `robots` por página es defensa en profundidad opcional).
- **Rate limiting (MVP):** primitiva `checkRateLimit(key, limit, windowMs, cost?)` en `lib/security/rate-limit.ts` (ventana en memoria por instancia/isolate; **no** compartida entre regiones/cold starts; `cost` opcional para consumir N unidades — p. ej. lote de eventos en GTK-32). Variables `RATE_LIMIT_LOGIN_PER_MIN` y `RATE_LIMIT_PUBLIC_PER_MIN` en `lib/env.ts` (Node). Los endpoints de login, captación pública (GTK-28+) y `POST /api/eventos` deben importar esta primitiva, no reimplementar contadores. Upstash (`UPSTASH_REDIS_*` opcionales en env) reservado para fase 2.
- **Logs:** eventos `401` en middleware con path e `ipHint` truncado; sin email ni PII de leads.
- Cloudflare WAF debe proteger rutas administrativas cuando esté disponible.
- No mezclar endpoints públicos y administrativos sin checks explícitos.
- Evitar que errores del admin filtren información operativa al público.

---

## 9. IA y Claude

### 9.1 Uso permitido

Claude se usa para generación asistida de contenido SEO y apoyo editorial, siempre con humano técnico en el bucle.

Reglas obligatorias:

- La API de Claude se invoca solo desde servidor.
- No se envía PII a prompts.
- Cada generación registra modelo, tokens, coste estimado, usuario, objetivo y estado.
- El contenido generado entra como borrador, nunca se publica automáticamente.
- Toda salida estructurada se valida con Zod antes de persistir.
- Usar `claude-sonnet-4-6` por defecto y reservar `claude-opus-4-8` para piezas pillar o casos justificados.

### 9.2 Control de coste

- Registrar tokens de entrada, salida y caché cuando el proveedor los exponga.
- Aplicar límite mensual configurable.
- Rechazar o degradar generaciones cuando se supere el presupuesto.
- Usar retries con backoff y timeouts.
- No reintentar indefinidamente.

### 9.3 Seguridad editorial

El contenido geotécnico puede afectar decisiones técnicas. Por tanto:

- Marcar contenido asistido por IA con `isAiAssisted`.
- Mantener flujo `borrador_ia → en_revision → aprobado → publicado`.
- Guardar revisiones y aprobadores.
- Incluir avisos de verificación técnica cuando corresponda.
- No publicar normativa, datos de cálculo o recomendaciones técnicas sin revisión humana.

---

## 10. Auditoría y Observabilidad

### 10.1 Audit log

El audit log es append-only y debe registrar acciones relevantes:

- Autenticación: login, login fallido, logout, 2FA.
- Seguridad: cambios de rol, permisos, activación/desactivación de usuario.
- Contenido: generación IA, revisión, aprobación, publicación, despublicación.
- CRM: creación de lead, conversión a proyecto, cambio de estado, asignación.
- Datos: exportaciones, eliminaciones, restauraciones.

Cada evento debe incluir como mínimo:

| Campo | Descripción |
|---|---|
| `actorId` | Usuario interno o sistema |
| `action` | Acción canónica |
| `targetType` | Tipo de recurso |
| `targetId` | ID afectado |
| `metadata` | Contexto no sensible |
| `ipAddress` | Si aplica |
| `userAgent` | Si aplica |

### 10.2 Logging técnico

- Usar logs estructurados.
- Incluir `requestId` o correlation ID.
- No loguear secretos ni PII completa.
- Usar niveles correctos: `debug`, `info`, `warn`, `error`.
- Enviar errores inesperados a Sentry con contexto seguro.

---

## 11. Email Transaccional

### 11.1 Resend y React Email

- Las plantillas viven en `lib/email/templates/` (p. ej. `lead-confirmation-email.tsx`; helpers sin JSX en `lead-confirmation.ts`).
- El wrapper del proveedor está en `lib/email/client.ts` (`sendEmail`).
- La función de dominio de confirmación de lead es `sendLeadConfirmation` en `lib/email/send-lead-confirmation.ts` (GTK-27; consumida por GTK-28).
- Las plantillas deben ser tipadas.
- No construir HTML de email concatenando strings.
- Registrar intentos, errores y proveedor cuando el email sea crítico para conversión (solo `referenceNumber` + id Resend en logs, sin PII del cuerpo).
- Variables de entorno: `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO` (validadas en `lib/env.ts`).

### 11.2 Casos mínimos

- Confirmación de solicitud de presupuesto.
- Confirmación de formulario de licitación.
- Entrega de lead magnet.
- Notificación interna de lead nuevo.
- Notificación de contenido pendiente de revisión.

Los emails al usuario deben estar en español y ser claros sobre el plazo de respuesta.

---

## 12. API y Eventos de Conversión

### 12.1 Captación de leads

Cada lead debe guardar contexto comercial:

- Tipo de lead: presupuesto, licitación, recurso, ubicación.
- Canal: formulario, WhatsApp, teléfono, ubicación, lead magnet.
- Servicio, provincia y tipología si existen.
- Fuente y campaña cuando estén disponibles.
- Consentimiento aplicable.
- Evento GA4/GTM relacionado cuando proceda.

### 12.2 Conversion events

Los eventos de conversión deben ser consistentes con el modelo (`ConversionEventName` en Prisma) y persistirse solo con `lib/analytics/recordConversionEvent(s)` o `POST /api/eventos` (GTK-32):

- `generate_lead`
- `click_tel`
- `click_whatsapp`
- `click_email`
- `send_location`
- `calculator_use`
- `resource_download`
- `scroll_depth`

No aceptar eventos arbitrarios desde cliente sin validación Zod (`.strict()`, enums Prisma). Append-only; telemetría siempre best-effort.

---

## 13. Rendimiento

### 13.1 Backend serverless

- Mantener Route Handlers ligeros.
- Evitar trabajo lento sin timeout.
- Mover generación IA en lote a cola cuando el volumen lo justifique.
- Usar `Promise.all` para operaciones independientes.
- Evitar bloquear respuestas públicas por tareas no críticas; diferir email, auditoría secundaria o analítica cuando sea seguro.

### 13.2 ISR y publicación

- Publicar contenido debe disparar `revalidatePath` o mecanismo equivalente.
- Revalidar solo rutas afectadas.
- Registrar quién publica, cuándo y qué rutas se revalidan.
- No usar redeploy como mecanismo normal de publicación editorial.

### 13.3 Consultas y caché

- Cachear contenido público cuando sea compatible con ISR.
- No cachear respuestas con PII.
- Usar índices en campos consultados frecuentemente: slugs, estados, provincia, servicio, workflow, fechas y soft delete.
- Considerar Upstash Redis solo cuando exista necesidad real: rate limiting avanzado, colas o caché compartida.

---

## 14. Testing

### 14.1 Herramientas

- **Vitest** para funciones puras, servicios, validaciones, repositorios mockeados y Route Handlers.
- **Playwright** para flujos E2E críticos.
- **Lighthouse CI** para presupuestos de rendimiento y CWV en plantillas públicas.

### 14.2 Cobertura esperada

Priorizar cobertura por riesgo:

- Alta cobertura en validación de formularios, Auth/RBAC, cálculo de alcance, publicación editorial, control de coste IA y auditoría.
- Tests de integración para Route Handlers públicos de captación.
- E2E para formulario multi-paso, login + 2FA y flujo editorial `Borrador IA → Publicado`.

Objetivo recomendado: 90% en módulos de dominio y aplicación críticos. No perseguir cobertura artificial en código de pegamento sin lógica.

### 14.3 TDD cuando sea apropiado

Usar **TDD (test-driven development)** cuando ayude a aclarar el comportamiento antes de implementar, especialmente en lógica backend con reglas de negocio, invariantes o riesgo de regresión.

Aplicar el ciclo rojo-verde-refactor:

1. Escribir primero un test que describa el comportamiento esperado y falle por la razón correcta.
2. Implementar la mínima lógica necesaria para hacerlo pasar.
3. Refactorizar manteniendo los tests en verde.

TDD es especialmente recomendable en:

- Validadores Zod y normalización de formularios.
- Cálculo de alcance geotécnico.
- Cualificación y creación de leads.
- Cambios de estado de proyectos y contenido editorial.
- RBAC, 2FA y reglas de sesión.
- Control de coste IA y sanitización de PII antes de llamar a Claude.
- Repositorios o queries con filtros, soft delete, paginación o permisos.

No es obligatorio aplicar TDD de forma rígida en tareas puramente mecánicas, cambios de documentación, cableado simple de UI o código de pegamento sin reglas relevantes. En esos casos, añadir tests después sigue siendo válido si cubren el comportamiento importante.

### 14.4 Organización de tests

Nombrar tests de forma conductual:

```typescript
describe('createBudgetLead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('crea un lead de presupuesto cuando los datos son validos', async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

Seguir patrón Arrange, Act, Assert.

### 14.5 Mocking

- Mockear proveedores externos: Anthropic, Resend, Turnstile, Sentry.
- Mockear repositorios en tests de servicios.
- Mockear servicios en tests de Route Handlers.
- No usar base de datos real en tests unitarios.
- Usar factories para datos realistas: leads, proyectos, contenido, usuarios y permisos.

### 14.6 Casos obligatorios

Para cada función crítica cubrir:

1. Camino feliz.
2. Validación fallida.
3. Permisos insuficientes.
4. Errores de proveedor externo.
5. Estados inválidos o conflictos.
6. Datos nulos, vacíos o límite.
7. No filtrado accidental de PII.

---

## 15. Flujo de Desarrollo

### 15.1 Antes de abrir PR o cerrar ticket

Ejecutar, cuando existan los scripts:

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run lighthouse
npx prisma migrate deploy
```

Adaptar los comandos al `package.json` real cuando el proyecto esté inicializado.

### 15.2 Calidad de código

- Mantener ramas pequeñas y enfocadas.
- Actualizar documentación técnica si cambian arquitectura, API, datos o proceso de despliegue.
- No mezclar refactors amplios con features de negocio.
- Revisar migraciones y cambios de seguridad con especial atención.
- Empezar con TDD cuando la tarea tenga reglas de negocio, estados, permisos, validación o integraciones con riesgo.
- Todo cambio que afecte a PII, Auth, RBAC, IA o publicación debe incluir tests.

### 15.3 Commits

- Mensajes descriptivos en español, según el estándar documental del proyecto.
- Indicar intención, no solo lista de ficheros.
- No incluir secretos, dumps, `.env` ni salidas de cobertura pesadas.

---

## 16. Criterios de Aceptación Backend

Una tarea backend se considera terminada cuando:

- La entrada externa está validada con Zod.
- La lógica de negocio vive en `/lib`, no en el handler.
- Prisma se usa mediante módulo server-only y, si procede, repositorio.
- Los errores devuelven formato consistente.
- Hay checks de sesión y RBAC en servidor cuando aplica.
- No se filtra PII a logs, analítica ni Claude.
- Las operaciones críticas generan audit log.
- Los tests cubren el comportamiento relevante.
- La documentación afectada queda actualizada.
- Lint, typecheck y tests pasan o se documenta claramente por qué no se pudieron ejecutar.

---

## 17. Antipatrones a Evitar

- Crear un backend Express/Nest separado para el MVP sin una señal clara de necesidad.
- Escribir lógica de negocio extensa en `route.ts`.
- Usar Server Actions públicas sin validación ni permisos.
- Importar Prisma o SDKs con secretos en componentes cliente.
- Enviar PII a Claude o registrar prompts con datos personales.
- Publicar contenido generado por IA sin revisión humana.
- Confiar en ocultar botones como control de permisos.
- Usar migraciones manuales no versionadas.
- Loguear cuerpos completos de formularios.
- Crear abstracciones genéricas antes de que exista duplicación real.
- Cachear respuestas con datos personales.

---

## 18. Evolución Futura

La arquitectura permite crecer sin romper el MVP:

- Añadir Redis/QStash/BullMQ cuando haya generación IA en lote, rate limiting avanzado o jobs lentos.
- Extraer `/lib` a NestJS si el back-office crece a plataforma o aparece un equipo backend dedicado.
- Añadir read replicas o caché compartida si el tráfico supera claramente el objetivo inicial.
- Mantener contratos de dominio y tests para facilitar cualquier extracción futura.

La regla general es simple: primero entregar un monolito modular sólido; extraer servicios solo cuando el volumen, el equipo o las integraciones lo justifiquen.
