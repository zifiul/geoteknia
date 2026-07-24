# Security Scan — gtk-32-eventos-conversion

- Fecha: 2026-07-24
- Diff analizado: `main..HEAD` (working tree feature/backend-gtk-32-eventos-conversion)
- Herramientas: Semgrep (SAST), `npm audit` (SCA), gitleaks (secretos), curl DAST manual

## Resumen

| Chequeo | Resultado | Crítico | Alto | Medio | Bajo |
|---------|-----------|---------|------|-------|------|
| SAST | LIMPIO | 0 | 0 | 0 | 0 |
| SCA | HALLAZGOS PREEXISTENTES | 2 | 3 | 0 | 0 |
| Secretos | LIMPIO | 0 | 0 | 0 | 0 |
| DAST | LIMPIO (manual curl) | 0 | 0 | 0 | 0 |

## Hallazgos

### [SEV-CRÍTICA/ALTA] Advisories npm preexistentes (@auth/core, next, postcss, sharp)

- Ubicación: dependencias del repo (no introducidas por GTK-32; **sin deps nuevas** en este change).
- Descripción: `npm audit` reporta 5 vulnerabilidades (2 critical en `@auth/core` vía next-auth, 3 high en next/postcss/sharp).
- Recomendación: ticket de mantenimiento de dependencias; fuera del alcance de GTK-32.
- Estado: **ACEPTADO** (preexistente; no atribuible al diff de eventos).

### DAST evidencia (endpoint nuevo)

- Claves extra / event inválido → 400 sin stack.
- Inyección en slug + clave `email` → 400.
- Rate limit → 429 tras superar `publicPerMin`.
- Sin Turnstile por diseño (contrato público telemetría).
- Sin fuga de PII en respuesta (solo `recorded`).

## Veredicto del scan

**HALLAZGOS ACEPTABLES CON JUSTIFICACIÓN** — SAST/secretos/DAST limpios para el change; SCA crítico/alto preexistente y no introducido por GTK-32.
