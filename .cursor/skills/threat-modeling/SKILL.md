---
name: threat-modeling
description: Threat modeling ligero por User Story para Geoteknia - plantilla de la sección obligatoria de design.md con superficie de ataque, actores, datos sensibles y requisitos de seguridad como criterios de aceptación. Úsala en la fase SDD del harness, antes del Gate 1.
author: Geoteknia
version: 1.0.0
---

# Skill threat-modeling

Produce el threat model de una US como sección obligatoria de `design.md`. Es la pieza shift-left que alimenta el contrato (fase 2), los abuse cases (fase 3) y el checklist del reviewer (fase 6). Sin esta sección, el Gate 1 no puede aprobarse.

## Cuándo y dónde

- Se redacta en la fase 1 (SDD), dentro de `openspec/changes/<change-name>/design.md`, bajo el encabezado `## Threat model`.
- Es proporcional al riesgo: una US de contenido estático puede resolverse en 10 líneas; una US que toca leads, auth o `/admin` exige el análisis completo.

## Plantilla de la sección

```markdown
## Threat model

### Superficie de ataque
- Endpoints/acciones nuevos o modificados (Route Handlers, Server Actions, webhooks).
- Formularios públicos y parámetros de URL aceptados.
- Componentes cliente que reciben datos de usuario.

### Actores
- Anónimo (internet), bot/spam, usuario autenticado por rol (`admin`, `gestor`, `editor`, `tecnico`), atacante con sesión válida de rol inferior.

### Datos sensibles implicados
- PII (contacts/leads/projects), credenciales/sesiones, tokens 2FA, contenido no publicado, costes/uso de IA.
- Clasificación RGPD y dónde se persisten/transitan.

### Amenazas identificadas
| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | ... | ... | ... | ... |

### Requisitos de seguridad (criterios de aceptación verificables)
- [ ] SEC-1: <requisito, p. ej. "POST /api/leads/presupuesto rechaza payloads sin token Turnstile válido con 403">
- [ ] SEC-2: ...
```

## Checklist de amenazas típicas de Geoteknia

Recorre esta lista y descarta explícitamente las que no apliquen:

1. **Authz:** ¿cada endpoint/acción declara rol + permiso atómico? ¿Un `editor` puede invocar acciones de `gestor`? ¿La UI oculta pero el servidor valida?
2. **Validación de inputs:** ¿payloads fuera del schema Zod → 400? ¿inyección vía campos de texto libre (SQL a través de Prisma raw, XSS almacenado en contenido editorial)?
3. **Abuso de formularios públicos:** ¿rate limit? ¿Turnstile validado en servidor? ¿límite de tamaño de payload?
4. **PII/RGPD:** ¿la US introduce PII nueva? ¿puede filtrarse a logs, Sentry, analítica, dataLayer o prompts de Claude?
5. **Sesión/2FA:** ¿la acción exige 2FA para perfiles sensibles? ¿se invalidan sesiones al cambiar credenciales/rol?
6. **IA:** ¿prompt injection desde contenido de usuario? ¿coste no acotado? ¿salida IA publicada sin revisión?
7. **Enumeración/IDOR:** ¿los IDs (UUID) evitan enumeración? ¿un usuario puede acceder a recursos por ID sin comprobación de permiso? ¿respuestas 404 vs 403 coherentes (no revelar existencia)?
8. **Audit log:** ¿las acciones críticas de la US generan entrada de auditoría?

## Reglas

- Cada amenaza con impacto medio/alto DEBE tener al menos un requisito SEC-N asociado; los SEC-N son la entrada directa de `security-test-cases` en la fase 3.
- Los requisitos se escriben verificables (endpoint + condición + resultado esperado), nunca como intenciones ("debe ser seguro").
- Las amenazas descartadas se listan con su justificación (una línea), para que el reviewer del Gate 1 vea que se consideraron.

## Señales de alerta

- `design.md` sin sección `## Threat model` en una US que toca API, formularios o `/admin`.
- Requisitos SEC-N no testeables o sin amenaza asociada.
- Threat model que ignora la PII cuando la US toca leads/contacts/projects.
