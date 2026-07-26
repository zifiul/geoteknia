# Security scan — gtk-58-licitaciones

- Fecha: 2026-07-26
- Alcance: diff GTK-58 (RSC `/licitaciones`, lectores Prisma, `TenderForm`, Turnstile cliente)

## SAST

- Revisión manual del diff: sin `dangerouslySetInnerHTML`, sin SQL crudo; `tenders.ts` con `server-only`.
- Formulario: validación Zod compartida (`tenderLeadSchema`); fetch same-origin a `/api/leads/licitacion`.
- Semgrep repo-wide reporta hallazgos preexistentes (crypto GCM, QA HTTP); ninguno en ficheros nuevos de GTK-58.

## SCA

- Sin dependencias nuevas en este change.
- Advisories heredados de `next-auth`/transitivos (documentados a nivel proyecto).

## Secretos

- gitleaks `main..HEAD`: sin fugas en commits del change.

## DAST

- Omitido — sin Route Handlers nuevos (reutiliza GTK-31).

## Hallazgos

| Severidad | Hallazgo | Estado |
|-----------|----------|--------|
| — | Ninguno bloqueante en el diff GTK-58 | Limpio |
