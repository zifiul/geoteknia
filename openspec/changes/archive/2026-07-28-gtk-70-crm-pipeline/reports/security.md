# Security scan — gtk-70-crm-pipeline

| Chequeo | Resultado |
|---------|-----------|
| SAST (diff) | Sin handlers nuevos; mutación vía `changeStateAction` existente |
| Secretos | Sin credenciales en componentes |
| RBAC | Lecturas con `requirePermission`; técnico sin UI de mutación en tablero |
| Inputs URL | Zod GTK-34 |

**Hallazgos:** ninguno bloqueante.
