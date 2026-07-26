# Security scan — gtk-59-acreditaciones

- Fecha: 2026-07-26
- Alcance: diff GTK-59 (RSC `/acreditaciones`, `listPublishedAccreditationsDetailed`, organismos UI)

## SAST

- Revisión manual del diff: sin `dangerouslySetInnerHTML`, sin SQL crudo; `accreditations.ts` con `server-only`.
- Enlaces externos: `rel="noopener noreferrer"`; URLs desde CMS.
- Semgrep repo-wide: hallazgos preexistentes (crypto GCM, etc.); ninguno en ficheros nuevos GTK-59.

## SCA

- Sin dependencias nuevas.
- Advisories heredados (`next-auth`, transitivos) — baseline proyecto.

## Secretos

- gitleaks `main..HEAD`: 0 commits escaneados (cambios sin commit); revisión manual del diff sin secretos.

## DAST

- Omitido — sin Route Handlers nuevos.

## Hallazgos

| Severidad | Hallazgo | Estado |
|-----------|----------|--------|
| — | Ninguno bloqueante en el diff GTK-59 | Limpio |
