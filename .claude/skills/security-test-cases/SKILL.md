---
name: security-test-cases
description: Catálogo de abuse cases de Geoteknia para la fase TDD-RED - convierte los requisitos SEC-N del threat model en tests de seguridad en rojo (RBAC, inputs maliciosos, rate limit, Turnstile, PII, IA). Úsala junto a tdd-core en la fase 3 del harness.
author: Geoteknia
version: 1.0.0
---

# Skill security-test-cases

Convierte el threat model de la fase 1 en **abuse cases ejecutables** que se escriben junto a los tests funcionales y se verifican en RED. Si un abuse case está en rojo, la implementación no puede ignorarlo.

## Entrada obligatoria

La sección `## Threat model` de `design.md` del change: cada requisito `SEC-N` DEBE terminar con al menos un test. Si un SEC-N no es testeable con las herramientas del proyecto, se documenta el hueco en el contrato de implementación para que lo cubra el scan (5b) o el reviewer (6).

## Catálogo de abuse cases por categoría

Recorre las categorías que el threat model haya marcado como aplicables:

### 1. Autorización (RBAC/2FA)
- Petición sin sesión a endpoint/acción protegida → 401.
- Sesión con rol sin el permiso atómico requerido → 403 (probar con cada rol no autorizado relevante: `tecnico` invocando acciones de `gestor`, `editor` publicando sin `content.publish`...).
- Acceso a recurso por ID de otro contexto sin permiso → 403/404 coherente con el contrato (sin revelar existencia).
- Acción sensible sin 2FA verificado cuando el perfil lo exige → rechazo.

### 2. Validación de inputs
- Payload con claves extra (schema `strict()`) → 400.
- Strings sobre el `max()` del schema, formatos inválidos (email, UUID), enums fuera de rango → 400 con el formato de error unificado.
- Intentos de inyección en campos de texto libre: fragmentos SQL, `<script>`, payloads de prompt injection en campos que alimentan IA → se persisten escapados/rechazados, nunca se ejecutan ni interpretan.
- Coerciones peligrosas: números como strings, fechas malformadas, `null`/`undefined` en campos requeridos.

### 3. Abuso de formularios públicos
- Petición sin token Turnstile o con token inválido → 403 (validado en servidor).
- Ráfaga sobre el rate limit declarado en el contrato → 429.
- Payload sobre el límite de tamaño → 400/413.

### 4. PII / RGPD
- La respuesta del endpoint no devuelve más PII que la declarada en el contrato.
- Los logs/eventos generados por el caso de uso no contienen PII (asertar sobre el mock del logger/analítica).
- Los prompts construidos para Claude no contienen PII de contacts/leads/projects (asertar sobre el mock del cliente Anthropic).

### 5. IA
- La salida de Claude fuera del schema esperado → se rechaza, no se persiste como válida.
- El contenido generado entra en estado borrador; el test verifica que no existe camino directo a publicado.
- Registro de generación completo (modelo, tokens, coste, usuario).

### 6. Auditoría
- La acción crítica de la US genera exactamente su entrada de audit log (append-only) con los campos esperados.
- El fallo de authz también queda auditado cuando el estándar lo exija.

## Convenciones

- Los tests de seguridad viven junto a los funcionales del módulo, marcados de forma rastreable: nombre con el ID (`SEC-1: rechaza payload sin Turnstile con 403`) o agrupados en un `describe('seguridad')`.
- Mismo rigor RED que `tdd-core`: se ejecutan y se verifica que fallan por el motivo correcto.
- Cada categoría descartada del catálogo se anota con una línea de justificación en el contrato de implementación.

## Señales de alerta

- Threat model con SEC-N sin test ni justificación de hueco.
- Abuse cases que solo prueban el camino de rechazo "fácil" (400 por campo vacío) e ignoran authz.
- Tests de authz que comprueban la UI (botón oculto) en lugar del servidor.
- Dar por cubierta la seguridad porque "el scan de la fase 5b ya lo mirará".
