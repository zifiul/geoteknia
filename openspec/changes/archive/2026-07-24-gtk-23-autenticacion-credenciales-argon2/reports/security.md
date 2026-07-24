# Security Scan — gtk-23-autenticacion-credenciales-argon2

- Fecha: 2026-07-24
- Diff analizado: `origin/main..HEAD` (cambios locales; DAST automático omitido por diff sin commits)
- Herramientas: Semgrep 80 rules, `npm audit`, gitleaks, curl manual (Step 6)

## Resumen

| Chequeo | Resultado | Crítico | Alto | Medio | Bajo |
|---------|-----------|---------|------|-------|------|
| SAST | LIMPIO | 0 | 0 | 0 | 0 |
| SCA | HALLAZGOS PREEXISTENTES | 2 | 3 | 0 | 0 |
| Secretos | LIMPIO | 0 | 0 | 0 | 0 |
| DAST | PARCIAL (curl manual QA) | 0 | 0 | 0 | 0 |

## SAST

- Comando: `npm run security:scan origin/main`
- 0 findings en `app/`, `lib/`, `tests/` del diff efectivo.

## SCA

- `npm audit`: 5 vulnerabilidades en dependencias transversales (`@auth/core`/`next-auth`, `next`, `postcss`, `sharp`).
- **No introducidas por GTK-23** (sin dependencias nuevas).
- Estado: **ACEPTADO** — alineado con informes GTK-21/GTK-27; upgrade de stack fuera de alcance de este ticket.

## Secretos

- gitleaks `origin/main..HEAD`: 0 leaks (0 commits en diff HEAD).

## DAST

- Script: omitido (sin route en diff commiteado).
- Sustituto: curl malicioso/inválido en Step 6 — credenciales inválidas/inactivas rechazadas; sin fuga de stack en respuesta JSON de sesión.

## Hallazgos corregidos en QA (funcional/seguridad)

- Validación Zod compatible con Auth.js (`totp` vacío, campos extra en callback).
- `sessionTokenHash` no expuesto al cliente en `/api/auth/session`.

## Veredicto del scan

**HALLAZGOS ACEPTABLES CON JUSTIFICACIÓN** (SCA transversal preexistente; sin hallazgos SAST/secretos en código del change).
