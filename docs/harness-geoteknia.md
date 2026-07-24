# Geoteknia — Arnés de desarrollo de una User Story
### (SDD → TDD → Impl → QA + Security → Review → Docs → Archive)

> Fases del harness y agentes que las ejecutan.
> **Incluye Shift-Left Security:** la seguridad se integra desde la especificación, no como fase final.

---

## Resumen ejecutivo

El harness lleva cada User Story de principio a fin con un flujo dirigido por especificación (**SDD**, vía OpenSpec/OPSX) y guiado por tests (**TDD**, vía Vitest/Playwright). El orquestador elige la siguiente US del backlog de Linear y delega cada fase en un subagente especializado, transfiriendo solo el contexto mínimo y recogiendo un resumen al finalizar.

**Rama primero:** antes de crear o modificar **cualquier archivo** del repositorio (artefactos OpenSpec, código, tests o docs), el agente debe crear y verificar una rama de feature (`feature/<area>-<ticket-id>-<slug>`). Detalle en [Prerrequisito operativo — Rama de feature](#prerrequisito-operativo--rama-de-feature-obligatorio).

Para issues de Linear con label **`DB`** (schema Prisma, migraciones, seeds, índices) existe la **[Variante: Harness DB](#variante-harness-db)**: mismo ciclo de gates y archive, sin contrato API, frontend ni E2E.

Para issues con label **`Backend`**, el harness completo sigue aplicando salvo en QA: **no** se ejecuta el paso N+3 (E2E con Playwright MCP). Ver [Regla QA — label `Backend`](#regla-qa--label-backend).

**Gates duros y secuenciales:** `SDD → Contrato → TDD-RED` (no se implementa nada sin tests en rojo).

**Contrato congelado:** en Geoteknia no hay SDK generado. El contrato son los **schemas Zod compartidos** (`lib/validations/` y `lib/<dominio>/*-schemas.ts`) más `docs/technical/api-spec.yml` mantenido a mano. Una vez congelado, back y front avanzan en paralelo sin renegociar tipos.

**Revisión humana:** dos paradas obligatorias (tras SDD y antes de archive) más un code-review obligatorio con veredicto **APTO** que cierra el ciclo antes de archivar.

**Commit y PR manuales:** el harness **no** crea commits ni abre PRs. Tras la fase 8 (archive), el humano commitea y abre el PR cuando corresponda.

**Shift-Left Security:** preventiva en las fases 1–3 (threat model en la spec, seguridad en el contrato, abuse cases en TDD), verificada automáticamente en la fase 5b (SAST/SCA/secrets/DAST ligero) y cerrada en la fase 6, cuyo veredicto APTO exige el security scan limpio. Cero paradas humanas nuevas.

> **Prerrequisito (repo greenfield):** el código de aplicación aún no está inicializado (sin `package.json`, `app/`, `prisma/`). Antes de la primera US funcional debe ejecutarse una **US-0 de bootstrap** (scaffolding Next.js 15 + Prisma + Vitest + Playwright + herramientas de seguridad). Hasta entonces, las fases 3–5 no son ejecutables.

---

## Disparador

> **Entrada:** *"Implementa la siguiente US"* — disparador del harness completo.
>
> **Entrada (DB):** *"Implementa la siguiente tarea DB"* / *"Implementa GTK-N (DB)"* — variante [Harness DB](#variante-harness-db).

---

## Prerrequisito operativo — Rama de feature (obligatorio)

> **Primer paso de todo change:** crear la rama de trabajo **antes** de tocar archivos. Aplica al harness completo y a la [Variante Harness DB](#variante-harness-db).

1. Crear la rama `feature/<area>-<ticket-id>-<slug>` (o `feature/<change-name>` si no hay ticket) desde `main` o la rama base acordada.
2. Verificar la rama activa (`git branch --show-current`) y el estado del working tree (`git status`).
3. Confirmar que no se pisa ni revierte trabajo no relacionado del usuario.

Este paso es el **Step 0** de `tasks.md` (convención en `docs/technical/openspec-tasks-mandatory-steps.md` §4). Lo ejecuta el `spec-author` al inicio de la fase 1 (SDD), **antes** de redactar `proposal.md`, delta specs, `design.md` o cualquier otro cambio en disco. Ninguna fase posterior puede empezar sin rama verificada.

---

## Flujo de fases

### 0. Selección de US
- **Agente:** `harness-orchestrator`
- **Skills:** `geoteknia-context`, `openspec-workflow`
- **Acción:** lee el backlog de Linear a través del MCP y elige la primera US no completada cuyas dependencias estén hechas (orden por dependencias y criticidad). Si la issue tiene label `Backend`, anunciar en el plan que la fase 5a **omite E2E Playwright** (regla [label `Backend`](#regla-qa--label-backend)).
- **Entrega:** US seleccionada, plan de fases (`TodoWrite`).

### 1. SDD — Abrir change OpenSpec 🛡️ *threat modeling*
- **Agente:** `spec-author`
- **Skills:** `openspec-propose`, `geoteknia-domain`, `us-traceability`, **`threat-modeling`**, `using-git-worktrees`
- **Acción:** **Step 0 — rama primero:** crear y verificar la feature branch (ver [Prerrequisito operativo](#prerrequisito-operativo--rama-de-feature-obligatorio)); solo entonces redactar `proposal.md`, delta specs y `tasks.md` con los pasos obligatorios de `docs/technical/openspec-tasks-mandatory-steps.md`. Valida con `openspec validate --strict`.
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
- **Acción:** define/evoluciona los schemas Zod compartidos del cambio y actualiza `docs/technical/api-spec.yml`. Congela el contrato (artefactos listos en disco) antes de implementar; el commit lo hace el humano.
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
| **Acción** | Implementa `/lib` + Route Handlers/Server Actions hasta poner los tests en **VERDE** (incluidos los abuse cases). Respeta capas, RBAC y audit log según `backend-standards.md`. | Construye la UI mobile-first (Atomic Design) consumiendo los schemas Zod congelados. El contrato Zod es la frontera. Aplica el design system de `docs/design/DESIGN.md` (tokens, atmósfera, componentes visuales de la web pública) — **no confundir** con el `design.md` OpenSpec de la fase 1. |
| **🛡️ Shift-left** | Sin secretos en código, solo Prisma (nunca SQL crudo), `import 'server-only'`, sin PII en logs/Claude. | Sanitización de outputs, sin datos sensibles en cliente/analítica, validación servidor como fuente de verdad. |
| **Entrega** | schemas, caso de uso, dominio, infraestructura, handler/action | páginas, componentes, hooks, formularios |

---

### 5. QA + Security Scan *(en paralelo)*

| | 5a. QA *(el agente ejecuta, nunca delega)* | 🛡️ 5b. Security Scan *(automatizado)* |
|---|---|---|
| **Agente** | `qa-verifier` | `security-verifier` |
| **Skills** | `qa-mandatory-steps`, `db-state-verify` | `security-scan` |
| **Acción** | Unit + verificación de BD (Neon); `curl` si hay Route Handlers/endpoints; E2E con Playwright MCP **solo** si hay flujo de usuario en el change **y** la issue **no** tiene label `Backend` (ver [regla QA Backend](#regla-qa--label-backend)). Genera reports en la carpeta del change. | SAST sobre el diff (Semgrep), SCA de dependencias (`npm audit`), detección de secretos (gitleaks) y DAST ligero con `curl` malicioso contra los endpoints nuevos usando el contrato. |
| **Entrega** | reports unit-db, curl (si aplica) y e2e (si aplica); BD restaurada | `reports/security.md` con hallazgos clasificados por severidad |

> Ambas subfases corren **en paralelo**. La 5b es automatizada y barata: no introduce paradas humanas.

> **Label `Backend`:** omitir siempre el paso N+3 (Playwright). La verificación del flujo en navegador queda para la US de frontend o full-stack que consuma el contrato.

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
> El flujo **SE DETIENE**: con code-review APTO (funcional + seguridad) + validación manual, se espera el OK humano **ANTES** de archive. Tras archivar, el humano commitea y abre el PR por su cuenta. — **humano**

---

### 8. Archive *(commit y PR manuales)*
- **Agente:** `spec-author`
- **Skills:** `openspec-archive-change`, `openspec-sync-specs`
- **Acción:** verifica el gate `require-code-review`, archiva el change y promueve las specs vivas (solo tras gate final y code-review APTO). **No** crea commits ni abre PRs.
- **Entrega:** change archivado, specs vivas sincronizadas.
- **Post-harness (humano):** commit de los cambios en la rama y apertura del PR a `master` cuando el humano lo decida.

---

## ✅ US completada — archive hecho; commit y PR a cargo del humano

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
  → GATE 2 → 8 (Archive) → [humano: commit + PR]
```

---

## Regla QA — label `Backend`

> Aplica a issues de Linear con label **`Backend`** que siguen el harness completo (no la [Variante Harness DB](#variante-harness-db)).

### Cuándo aplica

Cuando la issue seleccionada en Linear lleva el label **`Backend`** (servicios en `/lib`, Route Handlers, Server Actions, auth, email, auditoría, etc.), la fase **5a** debe ejecutar:

| Paso | Obligatorio en label `Backend` |
|------|--------------------------------|
| N+1 — Vitest + verificación BD (`db-state-verify`) | **Sí** |
| N+2 — `curl` contra endpoints del change | **Sí**, si el ticket crea o modifica Route Handlers, webhooks o API |
| N+3 — E2E Playwright MCP | **No — omitir siempre** |

### Qué documentar

En `tasks.md` y en el informe de fase 5a:

- Marcar explícitamente *E2E omitido — issue label `Backend`*.
- Si el comportamiento tiene recorrido de usuario, indicar la **US de Linear** (p. ej. frontend) que cubrirá el E2E del flujo integrado.

La omisión de E2E **no** exime de TDD-RED (Vitest), `curl` cuando hay API, ni del security scan (5b).

### Señales de alerta

- Ejecutar Playwright en un ticket solo `Backend` “porque el harness lo pide”.
- Marcar N+3 completado sin informe E2E cuando el label es `Backend`.
- Incluir UI en el mismo change con label `Backend` sin acordar con el humano qué US lleva el E2E (preferir ticket `Frontend` o full-stack para flujos visibles).

---

## Variante: Harness DB

> Flujo adaptado para issues de Linear con label **`DB`** (schema Prisma, migraciones, seeds, índices). No sustituye el harness completo: **omite o reduce** las fases pensadas para API/UI y mantiene gates, seguridad y trazabilidad OpenSpec.

### Cuándo aplicar

Aplicar **Harness DB** cuando la issue seleccionada:

1. Tiene label `DB` en Linear, **y**
2. Su alcance es solo capa de datos: `prisma/schema.prisma`, migraciones, `prisma/seed.ts`, índices/SQL manual documentado, o sincronización de `docs/technical/data-model.md`.

**No aplicar** (usar el harness completo) cuando el mismo change incluya Route Handlers, Server Actions, lógica de dominio en `/lib` consumible por API, o UI. En ese caso el schema va embebido en la US funcional.

### Disparador

> **Entrada:** *"Implementa la siguiente tarea DB"* / *"Implementa GTK-N (DB)"* — o selección en fase 0 de una issue con label `DB`.

El orquestador anuncia en el plan: **variante = Harness DB**.

### Mapa de fases (respecto al harness completo)

| # | Fase | Harness DB | Notas |
|---|------|------------|--------|
| 0 | Selección | **Obligatoria** | Filtrar label `DB`. Orden por dependencias de schema (fundación → maestros → dominio → seed → índices). |
| 1 | SDD + threat model | **Obligatoria (ligera)** | **Step 0 — rama primero** (mismo [prerrequisito operativo](#prerrequisito-operativo--rama-de-feature-obligatorio)). OpenSpec change por ticket. La descripción Linear suele ser la fuente; empaquetar en `proposal` / delta specs / `design` / `tasks`. Threat model centrado en PII, retención, soft-delete, región EU y acceso a datos (no superficie HTTP). |
| 🔶 | Gate 1 | **Obligatoria** | Revisar schema propuesto, migración, RGPD e impacto en `data-model.md` **antes** de migrar Neon. |
| 2 | Contrato Zod + API | **Omitir** | Registrar en el resumen de fase: *omitida — sin Route Handlers/Server Actions*. |
| 3 | TDD-RED | **Condicional** | **Omitir** en SCHEMA/INDEX puro sin lógica en `/lib`. **Aplicar** (mínimo) si hay seed con reglas, helpers de migración de datos, o invariantes testeables en `/lib`. Sin abuse cases HTTP. |
| 4a | Backend (Prisma) | **Obligatoria (núcleo)** | `schema.prisma` + migrate + seed/SQL según ticket. Agente: `backend-developer` (modo implementador). Skills: `secure-coding`, `geoteknia-domain`. |
| 4b | Frontend | **Omitir** | Registrar omisión. |
| 5a | QA | **Adaptada** | Obligatorios: `prisma validate`, `prisma migrate` (dev/deploy según entorno), skill `db-state-verify`. **Omitir** curl y E2E Playwright salvo que el ticket añada endpoint (entonces no es Harness DB). |
| 5b | Security Scan | **Obligatoria (ligera)** | SAST sobre el diff, SCA si cambian deps, secretos. **Omitir** DAST/`curl` malicioso (sin endpoints nuevos). |
| 6 | Code Review | **Obligatoria** | Checklist enfocado a schema: UUID, bloques AUDIT/SEO/EDITORIAL, PII, índices, FKs, append-only, sin SQL inseguro. Veredicto APTO/NO APTO. |
| 7 | Docs | **Obligatoria** | Actualizar `docs/technical/data-model.md` (y estándares solo si cambia una convención). |
| 🔶 | Gate 2 | **Obligatoria** | OK humano antes de archive. Commit y PR manuales tras archivar. |
| 8 | Archive | **Obligatoria** | Misma comprobación `require-code-review`. Sin commit ni PR automáticos. |

```
0 → 1 (SDD ligero + threat model datos) → GATE 1
  → [2 omitida] → [3 omitida | TDD mínimo si hay lógica]
  → 4a (Prisma) → [4b omitida]
  → 5a (validate + migrate + db-state) ∥ 5b (scan sin DAST)
  → 6 (Review) ∥ 7 (data-model.md)
  → GATE 2 → 8 (Archive) → [humano: commit + PR]
```

### Selección y orden típico (label `DB`)

1. Listar issues con label `DB` no completadas (`list_issues` + `label: DB`).
2. Respetar dependencias Linear y el orden de capas del modelo:
   - Fundación (`datasource`, enums, convención de bloques)
   - Identidad/RBAC (referenciado por AUDIT)
   - Maestros y media
   - Dominio (CRM, SEO, IA, etc.)
   - Seed de catálogos
   - Índices avanzados / SQL manual al final
3. Un change OpenSpec por issue (no agrupar tickets DB no relacionados sin OK humano).

### Artefactos SDD mínimos

En fase 1, el `spec-author` prioriza:

- `proposal.md` — qué entidades/cambios y por qué (enlace Linear).
- Delta specs de datos (requisitos del modelo) o referencia explícita a `docs/technical/data-model.md` cuando el delta sea solo materialización del modelo ya documentado.
- `design.md` — decisiones Prisma, migración, seed; sección **threat model de datos** (PII, base legal, EU, soft-delete, append-only, sin PII en prompts).
- `tasks.md` — pasos de `docs/technical/openspec-tasks-mandatory-steps.md` aplicables: rama, migrate, validación BD, docs. **Sin** pasos N+2 (curl) ni N+3 (E2E) salvo excepción documentada.

### Criterios de aceptación típicos (fase 5a)

- [ ] `prisma validate` OK.
- [ ] `prisma migrate dev` / `migrate deploy` OK en el entorno del change.
- [ ] Seed idempotente (si aplica) sin duplicar maestros.
- [ ] Línea base BD capturada y restaurada (`db-state-verify`) tras pruebas con escritura.
- [ ] Diff de schema alineado con Gate 1 y con `data-model.md` tras fase 7.

### Señales de alerta (Harness DB)

- Ejecutar el harness completo (contrato + TDD-RED HTTP + frontend + E2E) sobre un ticket solo SCHEMA.
- Migrar Neon antes del Gate 1.
- Omitir code-review o `data-model.md` porque “solo es schema”.
- Meter lógica de API/UI en el mismo change sin cambiar a harness completo.
- Saltar dependencias (p. ej. seed antes de las tablas, o dominio antes de enums/fundación).

---

## Notas

- Flujo genérico del harness (plantilla, no una US concreta). Para issues label `DB`, ver **Variante: Harness DB**. Para label `Backend`, ver **Regla QA — label `Backend`** (sin E2E).
- **Gates duros y secuenciales:** SDD → Contrato → TDD-RED (en Harness DB: SDD → [sin contrato] → TDD solo si hay lógica testeable).
- **Paralelizable:** 4a con 4b (backend con frontend), 5a con 5b (QA con security scan) y 6 con 7 (code-review con docs). En Harness DB no hay 4b.
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
| 8 | Archive *(commit/PR manuales)* | `spec-author` | — |

### Resumen Harness DB (deltas)

| # | Fase | En Harness DB |
|---|------|----------------|
| 0 | Selección | Label `DB` + orden por capas del modelo |
| 1 / Gate 1 | SDD | Ligero; threat model de datos |
| 2 | Contrato | Omitida |
| 3 | TDD-RED | Omitida o mínima (sin abuse cases HTTP) |
| 4a / 4b | Impl | Solo 4a (Prisma); 4b omitida |
| 5a / 5b | QA + Scan | validate/migrate/`db-state-verify`; scan sin DAST |
| 6–8 | Review → Archive | Igual (APTO + docs `data-model.md` + gates) |
