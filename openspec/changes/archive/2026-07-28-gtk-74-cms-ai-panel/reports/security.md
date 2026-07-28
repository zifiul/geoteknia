# Security scan — GTK-74

**Fecha:** 2026-07-28  
**Alcance:** diff frontend panel IA (sin endpoints nuevos)

## SAST (diff)

- Sin secretos en cliente; llamadas a `/api/admin/ia/generar` con sesión de portal.
- Inputs UI acotados a campos de plantilla (`prompt-input-ui.ts`); sin campos PII lead/proyecto.
- Salida IA mostrada en admin (`noindex` heredado del layout portal).

## SCA

- Sin dependencias nuevas.

## Secretos

- Sin claves Anthropic en componentes cliente.

## DAST ligero

- Omitido: no hay Route Handlers nuevos; RBAC y presupuesto cubiertos por GTK-38/37 (tests existentes).

## Hallazgos

| Severidad | Hallazgo | Estado |
|-----------|----------|--------|
| — | Ninguno bloqueante en el diff GTK-74 | Limpio |
