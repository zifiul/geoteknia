# Code review — gtk-39-flujo-editorial

- Fecha: 2026-07-24
- US: GTK-39
- Diff: flujo editorial Server Actions + `lib/content/workflow*`

## Checklist

- [x] Grafo único y transiciones según spec
- [x] RBAC `content.update` / `content.publish` sin permiso `approve` nuevo
- [x] Transacción atómica estado + audit mustAudit
- [x] Revisiones solo con cambio de cuerpo
- [x] Sin `published_at` / ISR (frontera GTK-40)
- [x] Threat model SEC-1–SEC-6 cubiertos en tests
- [x] `reports/security.md` sin bloqueantes
- [x] `backend-standards.md` actualizado

## Seguridad

- Alineado con `reports/security.md`.

## Observaciones menores

- Re-publicación desde `despublicado` pendiente de negocio (documentado en design).
- QA BD depende de conectividad Neon.

**Veredicto: APTO**
