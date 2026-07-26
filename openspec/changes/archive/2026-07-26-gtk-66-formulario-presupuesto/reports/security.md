# Security scan — gtk-66-formulario-presupuesto

**Fecha:** 2026-07-26

## SAST (diff manual)

- Sin secretos en cliente; Turnstile site key ya era pública.
- PII solo en POST al endpoint existente con Zod `.strict()`.
- Query params sanitizados (`sanitizePrefill`).

## SCA

- Sin dependencias nuevas.

## Secretos

- Sin hallazgos en archivos del change.

## DAST ligero

- No nuevos Route Handlers; endpoint presupuesto ya cubierto por GTK-28.

## Resumen

| Severidad | Count |
|-----------|-------|
| Crítica   | 0     |
| Alta      | 0     |
| Media     | 0     |
| Baja      | 0     |

**Estado:** Limpio para code review.
