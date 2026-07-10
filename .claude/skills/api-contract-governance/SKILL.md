---
name: api-contract-governance
description: Gobernanza del contrato API de Geoteknia sin SDK generado - schemas Zod compartidos como frontera front/back, api-spec.yml manual, seguridad declarada por endpoint (RBAC, rate limit, Turnstile) y ritual de congelación del contrato. Úsala en la fase 2 del harness cuando la US toca Route Handlers o Server Actions.
author: Geoteknia
version: 1.0.0
---

# Skill api-contract-governance

En Geoteknia el contrato NO es un SDK generado: es el par **schemas Zod compartidos** (fuente de verdad ejecutable) + **`docs/technical/api-spec.yml`** (documentación OpenAPI mantenida a mano). Esta skill define cómo evolucionarlo, declararle seguridad y congelarlo para que backend y frontend implementen en paralelo sin renegociar.

## Qué es el contrato

| Pieza | Rol | Ubicación |
|---|---|---|
| Schemas Zod de entrada/salida | Fuente de verdad ejecutable; front y back derivan tipos con `z.infer` | `lib/<dominio>/*-schemas.ts` (o `lib/validations/` para transversales) |
| `api-spec.yml` | Documentación OpenAPI 3.1 de Route Handlers públicos/estables | `docs/technical/api-spec.yml` |
| Tabla de seguridad por endpoint | Authz, rate limit, Turnstile, límites | Sección del propio `design.md` del change + `api-spec.yml` |

Las Server Actions no aparecen en `api-spec.yml` (no son contrato HTTP público), pero SÍ tienen contrato: schema Zod de entrada + permiso RBAC declarado.

## Flujo de trabajo (fase 2)

1. **Lee** el threat model y las delta specs del change (`openspec/changes/<change-name>/`), y `backend-standards.md` §5 (endpoints, formato de respuesta, status codes).
2. **Define los schemas Zod** de entrada y salida de cada endpoint/acción de la US: formatos estrictos (`.email()`, `.uuid()`, enums cerrados, `max()` en strings, `strict()` para rechazar claves extra), normalización segura (trim, lowercase) y límites de tamaño.
3. **Declara la seguridad de cada endpoint/acción** (obligatorio, deriva de los requisitos SEC-N del threat model):
   - Rol y **permiso atómico** RBAC requerido (o `público`).
   - Rate limit aplicable.
   - Turnstile sí/no (formularios públicos).
   - Límite de payload y content-type aceptado.
   - Datos PII que entran/salen y su tratamiento.
4. **Actualiza `docs/technical/api-spec.yml`** para los Route Handlers: paths, schemas (coherentes con los Zod), respuestas de error con el formato unificado `success`/`error`, códigos 400/401/403/404/429, y `security` + descripción de authz por operación.
5. **Congela el contrato:** commit dedicado (p. ej. `feat(contract): congela contrato <change-name>`) que incluye solo schemas + `api-spec.yml`. A partir de aquí, cualquier cambio de contrato exige reabrir la fase 2 y avisar al orquestador (invalida tests y trabajo en paralelo).

## Reglas de evolución

- Un endpoint existente no cambia de forma incompatible dentro de una US sin señalarlo como `MODIFIED` en las delta specs.
- Ningún endpoint/acción entra al contrato **sin authz definida** ("público" también es una decisión explícita y justificada).
- Los tipos del frontend se importan de los schemas Zod compartidos; está prohibido duplicar interfaces a mano a ambos lados.
- Los mensajes de error del contrato no filtran detalles internos (stack, SQL, existencia de recursos ajenos).

## Criterio de salida de la fase

- [ ] Schemas Zod creados/actualizados con formatos estrictos y límites.
- [ ] Tabla de seguridad por endpoint/acción completa (sin celdas "TBD").
- [ ] `api-spec.yml` actualizado y coherente con los schemas.
- [ ] Todos los SEC-N del threat model con reflejo en el contrato.
- [ ] Commit de congelación realizado.

## Señales de alerta

- Endpoints en `api-spec.yml` sin equivalente Zod (o viceversa).
- Schemas permisivos: strings sin `max()`, objetos sin `strict()`, enums abiertos.
- "Lo securizamos en la implementación" — la seguridad se congela con el contrato, no después.
- Cambiar el contrato durante la fase 4 sin reabrir la fase 2.
