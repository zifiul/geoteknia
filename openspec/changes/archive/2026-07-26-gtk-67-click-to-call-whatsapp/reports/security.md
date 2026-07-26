# Security Scan — gtk-67-click-to-call-whatsapp

- Fecha: 2026-07-26
- Diff analizado: main..HEAD (solo ficheros del change; sin API nueva)
- Herramientas: gitleaks OK en commits del branch; Semgrep/audit del monorepo con hallazgos **preexistentes** fuera del diff GTK-67

## Resumen

| Chequeo | Resultado | Notas |
|---------|-----------|-------|
| SAST (diff GTK-67) | LIMPIO | Sin hallazgos en archivos tocados por el change |
| SAST (script repo) | FALLO heredado | Semgrep escaneó árbol completo al no detectar diff; hallazgos en `lib/auth/crypto.ts`, tests QA HTTP |
| SCA | Heredado | Advisories en `next-auth`/transitivas; sin deps nuevas en GTK-67 |
| Secretos | LIMPIO | 0 leaks en commits `main..HEAD` |
| DAST | OMITIDO | Sin Route Handlers en el diff |

## Hallazgos del change

Ninguno. URLs externas construidas con datos CMS y `encodeURIComponent` para `text=`.
