# Geoteknia — Arnés de desarrollo de una User Story
### (SDD → TDD → Impl → QA + Security → Review → Docs → Archive)

> Fases del harness y agentes que las ejecutan.
> **Incluye Shift-Left Security:** la seguridad se integra desde la especificación, no como fase final.

---

## Resumen ejecutivo

El harness lleva cada User Story de principio a fin con un flujo dirigido por especificación (**SDD**, vía OpenSpec/OPSX) y guiado por tests (**TDD**, vía Vitest/Playwright). El orquestador elige la siguiente US del backlog de Linear y delega cada fase en un subagente especializado, transfiriendo solo el contexto mínimo y recogiendo un resumen al finalizar.

**Gates duros y secuenciales:** `SDD → Contrato → TDD-RED` (no se implementa nada sin tests en rojo).

**Contrato congelado:** en Geoteknia no hay SDK generado. El contrato son los **schemas Zod compartidos** (`lib/validations/` y `lib/<dominio>/*-schemas.ts`) más `docs/technical/api-spec.yml` mantenido a mano. Una vez congelado, back y front avanzan en paralelo sin renegociar tipos.

**Revisión humana:** dos paradas obligatorias (tras SDD y antes de archive/PR) más un code-review obligatorio con veredicto **APTO** que cierra el ciclo antes del PR.

**Shift-Left Security:** preventiva en las fases 1–3 (threat model en la spec, seguridad en el contrato, abuse cases en TDD), verificada automáticamente en la fase 5b (SAST/SCA/secrets/DAST ligero) y cerrada en la fase 6, cuyo veredicto APTO exige el security scan limpio. Cero paradas humanas nuevas.

> **Prerrequisito (repo greenfield):** el código de aplicación aún no está inicializado (sin `package.json`, `app/`, `prisma/`). Antes de la primera US funcional debe ejecutarse una **US-0 de bootstrap** (scaffolding Next.js 15 + Prisma + Vitest + Playwright + herramientas de seguridad). Hasta entonces, las fases 3–5 no son ejecutables.

---

## Disparador

> **Entrada:** *"Implementa la siguiente US"* — disparador del harness

---

## Flujo de fases

### 0. Selección de US
- **Agente:** `harness-orchestrator`
- **Skills:** `geoteknia-context`, `openspec-workflow`
- **Acción:** lee el backlog de Linear a través del MCP y elige la primera US no completada cuyas dependencias estén hechas (orden por dependencias y criticidad).
- **Entrega:** US seleccionada, plan de fases (`TodoWrite`).

### 1. SDD — Abrir change OpenSpec 🛡️ *threat modeling*
- **Agente:** `spec-author`
- **Skills:** `openspec-propose`, `geoteknia-domain`, `us-traceability`, **`threat-modeling`**, `using-git-worktrees`
- **Acción:** crea feature branch (Step 0). Redacta `proposal.md`, delta specs y `tasks.md` con los pasos obligatorios de `docs/technical/openspec-tasks-mandatory-steps.md`. Valida con `openspec validate --strict`.
- **🛡️ Shift-left:** `design.md` incluye una sección obligatoria de **threat model** de la US: superficie de ataque, actores, datos sensibles (PII/RGPD), y requisitos de seguridad expresados como criterios de aceptación (authz por permiso atómico RBAC, validación Zod de inputs, rate limits, Turnstile).
- **Entrega:** branch, `proposal.md`, delta specs, `design.md` **(+ threat model)**, `tasks.md`.

---

> ### 🔶 GATE 1 — Revisión humana de artefactos *(parada obligatoria)*
> El flujo **SE DETIENE**: aprobar `proposal + specs + design` **ANTES** de implementar. No avanza sin OK explícito. — **humano**
> **🛡️ La revisión incluye el threat model:** amenazas identificadas y requisitos de seguridad de la US.

---

### 2. Contrato *(si la US toca Route Handlers o Server Actions)* 🛡️ *api security governance*
- **Agente:** `contract-engineer`
- **Skills:** `api-contract-governance`
- **Acción:** define/evoluciona los schemas Zod compartidos del cambio y actualiza `docs/technical/api-spec.yml`. Congela el contrato (commit) antes de implementar.
- **🛡️ Shift-left:** el contrato declara para cada endpoint/acción: rol y permiso atómico RBAC requerido, rate limit, Turnstile si es público, límites de payload y formatos estrictos en los schemas. **Al congelarse el contrato, la seguridad de la API queda congelada con él.**
- **Entrega:** schemas Zod + `api-spec.yml` **(con seguridad declarada)**, contrato congelado.
- **Salto de fase:** si la US no toca API ni mutaciones (p. ej. contenido estático puro), se omite y se registra en el resumen de fase.

### 3. TDD — RED (tests primero) 🛡️ *abuse cases*
- **Agente:** `tdd-engineer`
- **Skills:** `tdd-core`, **`security-test-cases`**
- **Acción:** escribe primero los tests Vitest (dominio, casos de uso, validación, Route Handlers) y verifica que fallan en **ROJO** ejecutándolos.
- **🛡️ Shift-left:** incluye **abuse cases** derivados del threat model de la fase 1: acceso sin permiso RBAC → 403, escalada de rol, inputs maliciosos (inyección, payloads fuera de schema → 400), bypass de rate limit/Turnstile, fuga de PII. Si están en RED, la implementación no puede ignorarlos.
- **Entrega:** suites de tests en RED **(funcionales + seguridad)**, contrato de implementación.

---

### 4. Implementación *(en paralelo — solo si el contrato ya está congelado y las capas son independientes)*

| | 4a. Backend | 4b. Frontend |
|---|---|---|
| **Agente** | `backend-developer` (modo implementador) | `frontend-developer` (modo implementador) |
| **Skills** | `secure-coding` | `frontend-feature`, `secure-coding` |
| **Acción** | Implementa `/lib` + Route Handlers/Server Actions hasta poner los tests en **VERDE** (incluidos los abuse cases). Respeta capas, RBAC y audit log según `backend-standards.md`. | Construye la UI mobile-first (Atomic Design) consumiendo los schemas Zod congelados. El contrato Zod es la frontera. |
| **🛡️ Shift-left** | Sin secretos en código, solo Prisma (nunca SQL crudo), `import 'server-only'`, sin PII en logs/Claude. | Sanitización de outputs, sin datos sensibles en cliente/analítica, validación servidor como fuente de verdad. |
| **Entrega** | schemas, caso de uso, dominio, infraestructura, handler/action | páginas, componentes, hooks, formularios |

---

### 5. QA + Security Scan *(en paralelo)*

| | 5a. QA *(el agente ejecuta, nunca delega)* | 🛡️ 5b. Security Scan *(automatizado)* |
|---|---|---|
| **Agente** | `qa-verifier` | `security-verifier` |
| **Skills** | `qa-mandatory-steps`, `db-state-verify` | `security-scan` |
| **Acción** | Unit + verificación de BD (Neon), pruebas con `curl` y E2E con Playwright MCP. Genera reports en la carpeta del change. | SAST sobre el diff (Semgrep), SCA de dependencias (`npm audit`), detección de secretos (gitleaks) y DAST ligero con `curl` malicioso contra los endpoints nuevos usando el contrato. |
| **Entrega** | reports unit-db, curl y e2e; BD restaurada | `reports/security.md` con hallazgos clasificados por severidad |

> Ambas subfases corren **en paralelo**. La 5b es automatizada y barata: no introduce paradas humanas.

### 6. Code Review — GATE DURO *(obligatorio)* 🛡️ *absorbe el veredicto de seguridad*
- **Agente:** `code-reviewer`
- **Skills:** `code-review-gate`, `adversarial-review`
- **Acción:** revisa el diff contra los estándares (`base/backend/frontend-standards.md`) y deja un informe en `reports/` con línea **Veredicto: APTO o NO APTO**.
- **🛡️ Shift-left:** el checklist incorpora OWASP Top 10 y la revisión de `reports/security.md` (fase 5b). **El veredicto solo puede ser APTO si el security scan está limpio o los hallazgos están explícitamente justificados y aceptados.**
- ⚠️ **NO APTO o bloqueantes (funcionales o de seguridad) → vuelve a Implementación.** Sin informe APTO no se archiva (comprobación `require-code-review` en `openspec-workflow`).
- **Entrega:** informe code-review (APTO) **con sección de seguridad**.

### 7. Docs
- **Agente:** `docs-keeper`
- **Skills:** `update-docs`, `geoteknia-domain`
- **Acción:** sincroniza la documentación técnica (`data-model.md`, `api-spec.yml`, estándares). Puede ir en paralelo con el review.
- **🛡️ Shift-left:** mantiene actualizado el registro de decisiones de seguridad (threat models por US, hallazgos aceptados con su justificación).
- **Entrega:** docs actualizados y coherentes.

---

> ### 🔶 GATE 2 — Revisión humana final *(parada obligatoria)*
> El flujo **SE DETIENE**: con code-review APTO (funcional + seguridad) + validación manual, se espera el OK humano **ANTES** de archive/PR. — **humano**

---

### 8. Archive + PR
- **Agente:** `spec-author`
- **Skills:** `openspec-archive-change`, `openspec-sync-specs`, `commit`
- **Acción:** verifica el gate `require-code-review`, archiva el change, promueve las specs y abre el PR con `commit` (solo tras gate final y code-review APTO).
- **Entrega:** change archivado, specs vivas, PR abierto.

---

## ✅ US completada — PR a master

---

## Estrategia Shift-Left Security del harness

| Momento | Fase | Mecanismo | Naturaleza |
|---|---|---|---|
| **Diseño** | 1 (SDD) | Threat model en `design.md`, revisado en Gate 1 | Preventiva |
| **Contrato** | 2 | RBAC/rate-limit/Turnstile declarados en schemas Zod + `api-spec.yml` congelados | Preventiva |
| **Tests** | 3 (TDD-RED) | Abuse cases en rojo antes de implementar | Preventiva |
| **Código** | 4a / 4b | Guardrails de `secure-coding` | Preventiva |
| **Verificación** | 5b | SAST + SCA + secrets + DAST ligero automatizados | Detectiva |
| **Gate** | 6 | Veredicto APTO condicionado al scan limpio | Bloqueante |
| **Trazabilidad** | 7 | Registro de decisiones y hallazgos aceptados | Documental |

**Principio de diseño:** cero paradas humanas nuevas. Los gates humanos existentes (1 y 2) y la comprobación `require-code-review` absorben la seguridad sin añadir fricción al flujo.

```
0 → 1 (SDD + threat model) → GATE 1 → 2 (contrato Zod + api-security)
  → 3 (TDD-RED + abuse cases) → 4a ∥ 4b (impl + secure-coding)
  → 5a (QA) ∥ 5b (Security Scan) → 6 (Review + security) ∥ 7 (Docs)
  → GATE 2 → 8 (Archive + PR)
```

---

## Notas

- Flujo genérico del harness (plantilla, no una US concreta).
- **Gates duros y secuenciales:** SDD → Contrato → TDD-RED.
- **Paralelizable:** 4a con 4b (backend con frontend), 5a con 5b (QA con security scan) y 6 con 7 (code-review con docs).
- **Estado en disco:** backlog en Linear (fuente de verdad única, sin `_backlog.json` local), `tasks.md` y `reports/` dentro de `openspec/changes/<change-name>/` (incluye `reports/security.md`).
- Los agentes viven en `ai-specs/agents/` (stubs en `.claude/agents/` y `.cursor/agents/`); las skills canónicas en `ai-specs/skills/` con copias sincronizadas en `.claude/skills/` y `.cursor/skills/` (skill `sync-agent-mirrors`).

## Resumen de fases

| # | Fase | Agente | Tipo de gate |
|---|------|--------|---------------|
| 0 | Selección de US | `harness-orchestrator` | — |
| 1 | SDD + threat model 🛡️ | `spec-author` | — |
| 🔶 | **Gate 1** — artefactos + threat model | humano | Parada obligatoria |
| 2 | Contrato Zod + api-security 🛡️ | `contract-engineer` | — |
| 3 | TDD-RED + abuse cases 🛡️ | `tdd-engineer` | Gate duro secuencial |
| 4a/4b | Implementación (paralelo) | `backend-developer` / `frontend-developer` | — |
| 5a | QA | `qa-verifier` | — (paralelo con 5b) |
| 5b | Security Scan 🛡️ | `security-verifier` | — (paralelo con 5a) |
| 6 | Code Review + security 🛡️ | `code-reviewer` | Gate duro (APTO condicionado a seguridad) |
| 7 | Docs | `docs-keeper` | — (paralelo con 6) |
| 🔶 | **Gate 2** — Revisión final | humano | Parada obligatoria |
| 8 | Archive + PR | `spec-author` | — |
