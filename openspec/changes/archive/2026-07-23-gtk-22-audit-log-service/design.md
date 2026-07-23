# Design — gtk-22-audit-log-service

> Servicio interno append-only en `lib/audit/`.

## Enfoque técnico

1. **`recordAudit`:** valida input con Zod, sanitiza metadata, inserta en `audit_logs` vía Prisma. Solo INSERT; nunca UPDATE/DELETE.
2. **Contexto HTTP:** `extractRequestAuditContext(headers)` devuelve `{ ip, userAgent }` para pasarlos explícitamente a `recordAudit` (función testeable sin Request).
3. **Política por acción:**
   - **mustAudit** (`delete`, `publish`, `approve`, `role_change`): fallo de persistencia propaga error → la transacción de negocio revierte si se usa `{ tx }`.
   - **best-effort** (`login`, `login_failed`, `reject`, `ai_generate`, `export`): fallo se registra en log estructurado y retorna `null`; no bloquea la acción de negocio.
4. **Metadata:** lista blanca por `AuditAction` + redacción de claves sensibles (contraseñas, secretos 2FA, PII de leads). Solo identificadores y diffs no sensibles.

## Decisiones

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| IP/user-agent explícitos en input | Leer Request dentro de `recordAudit` | Testabilidad y pureza del servicio |
| Zod interno (no schema compartido público) | Exportar schema en `lib/validations/` | Servicio interno sin contrato HTTP |
| `tx` opcional en options | Siempre usar `db` global | Permite mustAudit en la misma transacción Prisma |
| best-effort retorna `null` | Excepción silenciada sin retorno | Callers pueden detectar fallo opcional |

## Threat model

| Aspecto | Evaluación |
|---|---|
| Superficie | Servicio server-only invocado desde handlers autenticados |
| Datos sensibles | Metadata puede contener diffs; sanitización obligatoria antes de persistir |
| PII | IP/user-agent en fila; nunca email/teléfono de leads en metadata |
| SEC-1 | Módulos con `import 'server-only'` |
| Append-only | Solo `create`; sin métodos de mutación expuestos |

## Verificación

- `npm run test`, `npm run typecheck`, `npm run lint`
- Tests: persistencia OK, acción inválida rechazada, claves sensibles eliminadas
