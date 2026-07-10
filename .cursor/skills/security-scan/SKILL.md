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

- **Herramienta preferida:** Semgrep (`semgrep --config auto` sobre los ficheros del diff, o los rulesets `p/typescript`, `p/react`, `p/owasp-top-ten` si están disponibles).
- **Fallback sin Semgrep instalado:** revisión estática dirigida del diff buscando los patrones prohibidos por `secure-coding`: `$queryRawUnsafe`, interpolación en `$queryRaw`, `dangerouslySetInnerHTML`, `eval`/`new Function`, secretos hardcodeados, módulos sensibles sin `import 'server-only'`, handlers sin validación Zod ni authz. Documenta en el informe que se usó el fallback manual.

### 2. SCA (dependencias)

- `npm audit --json` (o el gestor del proyecto). Registra vulnerabilidades por severidad y si existe fix disponible.
- Dependencias nuevas introducidas por la US: verifica que son necesarias, mantenidas y sin advisories abiertos.

### 3. Detección de secretos

- **Herramienta preferida:** gitleaks (`gitleaks detect --source . --log-opts "<base>..HEAD"`) sobre los commits de la branch.
- **Fallback:** búsqueda dirigida en el diff de patrones de alta señal (claves `sk-`/`AKIA`/`ghp_`, `BEGIN PRIVATE KEY`, asignaciones sospechosas a `password|secret|token|apiKey` con literales largos, ficheros `.env*` añadidos al índice). Documenta el fallback.

### 4. DAST ligero (endpoints nuevos/modificados)

Con el servidor local levantado y usando el contrato congelado (schemas Zod + `api-spec.yml`) como guía, lanza `curl` maliciosos contra cada endpoint de la US:

- Sin autenticación y con rol insuficiente → espera 401/403.
- Payload malformado, claves extra, tipos incorrectos → espera 400 con formato unificado.
- Payloads de inyección básicos en campos string (SQL, XSS) → espera rechazo o persistencia inerte.
- Payload sobredimensionado → espera 400/413.
- Ráfaga rápida → espera 429 si el contrato declara rate limit.
- Verifica que ningún error expone stack, SQL o rutas internas.

Restaura la BD si alguna petición llegó a escribir (skill `db-state-verify`).

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
