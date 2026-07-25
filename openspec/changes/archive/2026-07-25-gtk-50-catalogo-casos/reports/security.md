# Security Scan — gtk-50-catalogo-casos

- Fecha: 2026-07-25
- Diff analizado: `main..HEAD` (~26 ficheros)
- Herramientas: Semgrep (0 findings), `pnpm audit` (SCA), gitleaks (0 leaks), DAST omitido (sin API)

## Resumen

| Chequeo | Resultado | Crítico | Alto | Medio | Bajo |
|---------|-----------|---------|------|-------|------|
| SAST | LIMPIO | 0 | 0 | 0 | 0 |
| SCA | HALLAZGOS PREEXISTENTES | 3 | 6 | 3 | 1 |
| Secretos | LIMPIO | 0 | 0 | 0 | 0 |
| DAST | OMITIDO | — | — | — | — |

## Hallazgos

### SCA — dependencias transitivas (no introducidas por GTK-50)

- **Estado:** ACEPTADO — advisories en `next-auth`/`@auth/core`, `postcss`, `tmp`, `brace-expansion`, `uuid` ya presentes en el árbol del monolito; este change no añade dependencias nuevas.
- **Recomendación:** ticket transversal de actualización de Auth.js / audit de toolchain (fuera de GTK-50).

## Superficie GTK-50

- Lecturas Prisma server-only; params de URL saneados; sin endpoints nuevos; tracking solo `pushRawDataLayer` en cliente con consentimiento.
