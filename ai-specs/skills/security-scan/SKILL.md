---
name: security-scan
description: "Escaneo de seguridad automatizado de la fase 5b del harness de Geoteknia - cuatro chequeos (SAST sobre el diff, SCA de dependencias, detección de secretos y DAST ligero contra endpoints nuevos) con informe reports/security.md clasificado por severidad. Úsala en paralelo con QA tras la implementación."
author: Geoteknia
version: 1.0.0
---

# Skill security-scan

Ejecuta la verificación detectiva del shift-left: cuatro chequeos automatizados sobre el diff de la US y sus endpoints. Es barata y sin paradas humanas; su salida (`reports/security.md`) condiciona el veredicto APTO de la fase 6.

## Alcance

Se escanea el **diff de la feature branch contra la rama base** (no todo el repo), salvo SCA que evalúa el árbol de dependencias completo. Obtén el diff con `git diff <base>...HEAD --name-only` y trabaja sobre esos ficheros.

## Los cuatro chequeos

### 1. SAST (análisis estático)

- **Invocación uniforme:** `npm run security:sast` (alias legacy: `npm run security:semgrep`). Equivalente bash: `bash scripts/semgrep-scan.sh [base]`.
- **Herramienta:** Semgrep en `tools/semgrep-venv/` (`p/typescript`, `p/react`, `p/owasp-top-ten`) sobre ficheros `.ts/.tsx/.js` del diff `base..HEAD`.
- **Fallback sin Semgrep instalado:** `npm run security:install-semgrep` primero; si falla, revisión estática dirigida del diff buscando los patrones prohibidos por `secure-coding`: `$queryRawUnsafe`, interpolación en `$queryRaw`, `dangerouslySetInnerHTML`, `eval`/`new Function`, secretos hardcodeados, módulos sensibles sin `import 'server-only'`, handlers sin validación Zod ni authz. Documenta en el informe que se usó el fallback manual.

### 2. SCA (dependencias)

- **Invocación uniforme:** `npm run security:sca` (salida legible) o `npm run security:sca:json` (para el informe). Equivalente bash: `bash scripts/security-audit.sh [--json]`.
- Registra vulnerabilidades por severidad y si existe fix disponible.
- Dependencias nuevas introducidas por la US: verifica que son necesarias, mantenidas y sin advisories abiertos.

### 3. Detección de secretos

- **Invocación uniforme:** `npm run security:secrets` (alias legacy: `npm run security:gitleaks`). Equivalente bash: `bash scripts/gitleaks-detect.sh [base]`.
- **Herramienta:** gitleaks en `tools/gitleaks/` sobre commits `base..HEAD` con `.gitleaks.toml`.
- **Fallback:** búsqueda dirigida en el diff de patrones de alta señal (claves `sk-`/`AKIA`/`ghp_`, `BEGIN PRIVATE KEY`, asignaciones sospechosas a `password|secret|token|apiKey` con literales largos, ficheros `.env*` añadidos al índice). Documenta el fallback.

### 4. DAST ligero (endpoints nuevos/modificados)

- **Invocación uniforme:** `npm run security:dast` (requiere servidor: `npm run dev`). Equivalente bash: `bash scripts/security-dast.sh [base] [url]`.
- Si no hay Route Handlers en el diff, el script responde `omitido` (exit 0). Si el servidor no está levantado, `NO EJECUTADO` (exit 0): documentar en el informe, no declarar LIMPIO.
- Con servidor y endpoints en el diff, lanza `curl` maliciosos contra cada path derivado de `app/api/**/route.ts`:

- Sin autenticación y con rol insuficiente → espera 401/403.
- Payload malformado, claves extra, tipos incorrectos → espera 400 con formato unificado.
- Payloads de inyección básicos en campos string (SQL, XSS) → espera rechazo o persistencia inerte.
- Payload sobredimensionado → espera 400/413.
- Ráfaga rápida → espera 429 si el contrato declara rate limit.
- Verifica que ningún error expone stack, SQL o rutas internas.

Restaura la BD si alguna petición llegó a escribir (skill `db-state-verify`).

### Orquestador (los cuatro chequeos)

- **Invocación uniforme:** `npm run security:scan` — ejecuta SAST → SCA → Secretos → DAST y muestra resumen. Equivalente bash: `bash scripts/security-scan.sh [base]`.
- **Instalar herramientas:** `npm run security:install` (Semgrep + gitleaks en `tools/`).

## Informe: `reports/security.md`

Se guarda en `openspec/changes/<change-name>/reports/security.md`:

```markdown
# Security Scan — <change-name>

- Fecha: YYYY-MM-DD
- Diff analizado: <base>..HEAD (<n> ficheros)
- Herramientas: <semgrep x.y | fallback manual>, npm audit, <gitleaks x.y | fallback manual>, curl DAST

## Resumen
| Chequeo | Resultado | Crítico | Alto | Medio | Bajo |
|---------|-----------|---------|------|-------|------|
| SAST | LIMPIO/HALLAZGOS | 0 | 0 | 0 | 0 |
| SCA | ... | | | | |
| Secretos | ... | | | | |
| DAST | ... | | | | |

## Hallazgos
### [SEV-ALTA] <título>
- Ubicación: <fichero:línea o endpoint>
- Descripción y evidencia
- Recomendación
- Estado: PENDIENTE | CORREGIDO | ACEPTADO (justificación)

## Veredicto del scan
LIMPIO | HALLAZGOS BLOQUEANTES | HALLAZGOS ACEPTABLES CON JUSTIFICACIÓN
```

## Reglas

- Crítico/Alto = bloqueante por defecto: vuelve a la fase 4 salvo justificación escrita que el reviewer acepte en la fase 6.
- Un chequeo no ejecutable (herramienta ausente sin fallback posible, servidor no arrancable) se reporta como `NO EJECUTADO` con el motivo — nunca como LIMPIO.
- No corrijas código en esta fase: reporta. La corrección pertenece a la fase 4 y la aceptación de riesgos a la 6.

## Señales de alerta

- Informe sin la sección de herramientas/fallbacks usados.
- Declarar LIMPIO un chequeo que no se ejecutó.
- Hallazgos "aceptados" sin justificación escrita.
- Escanear todo el repositorio y diluir los hallazgos del diff en ruido preexistente.
