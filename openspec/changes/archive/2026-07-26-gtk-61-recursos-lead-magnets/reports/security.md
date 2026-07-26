# Security scan — gtk-61-recursos-lead-magnets

- Fecha: 2026-07-26
- Alcance: `/recursos`, `GET /api/recursos/download`, `ResourceForm`, lectores Prisma

## SAST

- Formulario valida con `resourceLeadSchema`; sin PII en logs cliente.
- Token parseado con validación UUID; sin SQL crudo.
- Thank You reutiliza `sanitizeDownloadUrl` (GTK-63).

## SCA

- Sin dependencias nuevas.

## Secretos

- Sin credenciales en el diff.

## DAST

- `GET /api/recursos/download` sin token → 400 (contrato).
- Token inválido → 400; lead incoherente → 404.

## Hallazgos

| Severidad | Hallazgo | Estado |
|-----------|----------|--------|
| Bajo | Token de descarga reutilizable (MVP) | Aceptado — documentado en design.md |
| — | Ninguno bloqueante | Limpio |
