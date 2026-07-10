---
name: code-review-gate
description: "Code review de gate duro de la fase 6 del harness de Geoteknia - checklist contra los estándares del proyecto y OWASP Top 10, revisión obligatoria de reports/security.md e informe con línea Veredicto: APTO o NO APTO que condiciona el archive. Úsala al revisar el diff completo de una US implementada y verificada."
author: Geoteknia
version: 1.0.0
---

# Skill code-review-gate

Formaliza el gate duro de la fase 6: revisión del diff completo de la US contra los estándares del proyecto y la evidencia de QA/seguridad, cerrada con un veredicto binario que el gate `require-code-review` comprueba antes de permitir el archive.

## Entradas obligatorias

1. Diff completo de la feature branch contra la base (`git diff <base>...HEAD`).
2. Artefactos del change: `proposal.md`, `design.md` (incl. threat model), delta specs, `tasks.md`.
3. Evidencia de la fase 5: reports N+1/N+2/N+3 de QA y `reports/security.md` del scan.
4. Estándares: `docs/technical/base-standards.md`, `backend-standards.md`, `frontend-standards.md`.

Si falta alguna entrada (report ausente, scan no ejecutado), el veredicto es **NO APTO por evidencia incompleta** — no se revisa "a ciegas".

## Método

Aplica la mentalidad y el flujo de la skill `adversarial-review` (refutar, no confirmar; diff como contexto incompleto; profundidad calibrada al riesgo) y añade los checklists específicos del gate:

### Checklist de arquitectura (guardrails)

- Lógica de negocio en `/lib`, nunca en `route.ts` ni componentes; capas respetadas (presentación fina, casos de uso con dependencias explícitas, infraestructura encapsulada).
- Todo input externo validado con el schema Zod del contrato congelado; tipos derivados con `z.infer`, sin duplicados manuales.
- Errores tipados (`AppError`) mapeados al formato unificado y status codes correctos.
- Frontend: corte Server/Client intencionado, Atomic Design correcto, tokens del sistema, estados explícitos.
- Sin desviaciones del contrato congelado (fase 2) ni de las specs aprobadas en Gate 1; toda desviación justificada tiene su artefacto actualizado.
- Tests: cubren los requisitos (funcionales y SEC-N), conductuales, sin debilitamientos respecto al RED de la fase 3.

### Checklist de seguridad (OWASP Top 10 adaptado)

- **A01 Broken Access Control:** authz en servidor por permiso atómico en cada handler/action; sin IDOR; 403/404 coherentes.
- **A02 Cryptographic Failures:** secretos fuera del código; argon2 para credenciales; cookies de sesión seguras.
- **A03 Injection:** solo Prisma parametrizado; sin `dangerouslySetInnerHTML` inseguro; contenido de usuario/IA tratado como no confiable (incl. prompt injection).
- **A04 Insecure Design:** los requisitos SEC-N del threat model están implementados y testeados.
- **A05 Security Misconfiguration:** `import 'server-only'` donde toca; `/admin` con `noindex`; errores sin detalles internos.
- **A07 Auth Failures:** 2FA donde el estándar lo exige; rate limit y Turnstile según contrato.
- **A08 Integridad:** dependencias nuevas justificadas y sin advisories (ver SCA del scan).
- **A09 Logging:** audit log en acciones críticas; sin PII en logs/analítica/Sentry/prompts.
- **Revisión de `reports/security.md`:** cada hallazgo está CORREGIDO o ACEPTADO con justificación que tú validas. Un hallazgo crítico/alto PENDIENTE o una justificación débil bloquea el veredicto.

## Informe

Se guarda en `openspec/changes/<change-name>/reports/code-review.md`:

```markdown
# Code Review — <change-name>

- Fecha: YYYY-MM-DD
- Diff revisado: <base>..HEAD (<n> ficheros)
- Evidencia revisada: <reports N+1/N+2/N+3, security.md>

## Alineación spec ↔ implementación
- ...

## Hallazgos
| Severidad | Área | Hallazgo | Evidencia | Fix sugerido |
|-----------|------|----------|-----------|--------------|
| Bloqueante / Mayor / Menor | | | | |

## Sección de seguridad
- Resultado del scan (5b): LIMPIO / hallazgos y su estado
- Hallazgos aceptados validados: <lista o ninguno>
- Checklist OWASP: <desviaciones o "sin desviaciones">

Veredicto: APTO
```

La última línea del informe es literalmente `Veredicto: APTO` o `Veredicto: NO APTO` (es lo que verifica el script `ai-specs/scripts/require-code-review.sh`).

## Regla del veredicto

**APTO** exige TODAS estas condiciones:

1. Sin hallazgos Bloqueantes ni Mayores pendientes (funcionales o de seguridad).
2. `reports/security.md` limpio, o con todos sus hallazgos corregidos/aceptados con justificación validada.
3. Evidencia de QA completa (reports N+1 y, si aplican, N+2/N+3) con estado PASS.
4. Sin desajustes spec ↔ código sin resolver.

Cualquier otra situación es **NO APTO**, con los bloqueantes listados: el orquestador devuelve el flujo a la fase 4 pasando esa lista al implementador.

## Señales de alerta

- Emitir APTO "con condiciones" — el veredicto es binario; las condiciones son hallazgos.
- Aceptar justificaciones de seguridad genéricas ("riesgo bajo") sin razonamiento verificable.
- Revisar solo los ficheros "importantes" del diff.
- Reescribir código durante la revisión: el reviewer reporta, no implementa.
