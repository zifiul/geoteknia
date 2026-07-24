# Code review — gtk-38-generacion-contenido-ia

- Fecha: 2026-07-24
- Revisor: agente (fase 6 harness)

## Checklist

- [x] Lógica en `/lib`, route delgado
- [x] RBAC `ai.generate` + envelope HTTP
- [x] Presupuesto antes de Claude y de filas (fail-open sin config documentado)
- [x] Claude fuera de transacción Prisma
- [x] Salida validada Zod; `partial` sin `output_structured` publicable
- [x] Auditoría `ai_generate` best-effort con whitelist
- [x] Sin PII en logs de generación (reutiliza GTK-36)
- [x] Tests unitarios 280/280
- [x] `api-spec.yml` + `backend-standards.md` actualizados
- [ ] QA BD Neon (bloqueo red) y curl N+2 (pendiente sesión)

## Seguridad

- `reports/security.md` sin bloqueantes; DAST/curl pendiente.

## Observaciones menores

- Materialización de borrador en entidades GTK-41 (decisión Gate 1).
- Rate limit GTK-26 documentado en api-spec como pendiente.

## Veredicto: APTO

Condicionado a re-ejecutar QA BD y curl N+2 en entorno con Neon y sesión admin antes de merge a producción.
