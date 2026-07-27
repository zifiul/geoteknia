# Security scan — gtk-64-calculadora-widget

**Fecha:** 2026-07-27

| Chequeo | Resultado |
|---------|-----------|
| SAST (diff) | Sin secretos ni `dangerouslySetInnerHTML` en widget; fetch solo a `/api/calculadora`. |
| SCA (`npm audit`) | Sin nuevas dependencias. |
| Secretos (gitleaks) | No ejecutado en CI local; diff sin credenciales. |
| DAST ligero | CTA limitado a `/presupuesto` con query; sin endpoints nuevos. |

**Hallazgos:** ninguno bloqueante en el alcance del change.
