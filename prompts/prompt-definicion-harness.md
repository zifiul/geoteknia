# ROL
Actúa como arquitecto senior de harness engineering para desarrollo asistido por agentes de IA, con experiencia en flujos SDD (Spec-Driven Development), TDD, shift-left security y orquestación de subagentes con transferencia mínima de contexto.

# CONTEXTO
Quiero implantar en este proyecto (**Geoteknia**) un harness de desarrollo que lleve cada User Story desde su selección en el backlog hasta el PR, dirigido por especificación (SDD), guiado por tests (TDD) y con seguridad shift-left integrada. Un agente orquestador delega cada fase en un subagente especializado, transfiriendo solo el contexto mínimo y recogiendo un resumen al finalizar cada fase.

El harness que defino a continuación es la **especificación normativa** de este trabajo:

## Definición del harness (fases, gates y entregables)

**Disparador:** "Implementa la siguiente US".

**Gates duros y secuenciales:** SDD → Contrato → TDD-RED (no se implementa nada sin tests en rojo). El contrato de API, una vez congelado, permite que backend y frontend avancen en paralelo.

| # | Fase | Rol del agente | Responsabilidad | Entregables |
|---|------|----------------|-----------------|-------------|
| 0 | Selección de US | orquestador del harness | Lee el backlog y elige la primera US no completada cuyas dependencias estén hechas (orden por dependencias y criticidad). Genera el plan de fases. | US seleccionada, plan de fases |
| 1 | SDD — abrir change OpenSpec | autor de especificaciones | Crea la feature branch, redacta proposal, spec-delta, design y tasks con los pasos obligatorios; valida con `openspec validate --strict`. **Shift-left:** el design incluye una sección obligatoria de threat model (superficie de ataque, actores, datos sensibles, requisitos de seguridad como criterios de aceptación). | branch, proposal.md, spec-delta, design.md (+ threat model), tasks.md |
| 🔶 GATE 1 | Revisión humana de artefactos (parada obligatoria) | humano | El flujo SE DETIENE: aprobar proposal + spec-delta + design (incluido el threat model) ANTES de implementar. No avanza sin OK explícito. | OK humano |
| 2 | Contrato (si la US toca API) | ingeniero de contrato | Evoluciona la especificación de la API, valida, regenera el SDK/cliente y sincroniza DTOs. Congela el contrato antes de implementar. **Shift-left:** el contrato declara security schemes, scopes/roles por endpoint, límites de payload y formatos estrictos; al congelarse, la seguridad queda congelada con él. | api-spec (con seguridad declarada), SDK regenerado, contrato congelado |
| 3 | TDD — RED (tests primero) | ingeniero TDD | Escribe primero los tests de los invariantes críticos del dominio y verifica que fallan en ROJO. **Shift-left:** incluye abuse cases derivados del threat model (authz, aislamiento entre clientes/tenants, inputs maliciosos, escalada de privilegios). | suites de tests en RED (funcionales + seguridad), contrato de implementación |
| 4a ∥ 4b | Implementación (paralelo, solo con contrato congelado y capas independientes) | desarrollador backend ∥ desarrollador frontend | Backend: implementa hasta poner los tests en VERDE respetando los estándares de arquitectura del proyecto. Frontend: construye la UI consumiendo el SDK generado (nunca a mano); el SDK es la frontera. Ambos aplican guardrails de codificación segura (sin secretos en código, queries parametrizadas, sanitización de outputs, sin datos sensibles en cliente/logs). | Backend: dominio, use-cases, adapters, controllers, DTOs. Frontend: páginas, componentes, hooks, formularios |
| 5a ∥ 5b | QA ∥ Security Scan (paralelo) | verificador QA ∥ verificador de seguridad | QA (ejecuta, nunca delega): unit + verificación de BD, pruebas de API y E2E; genera reports en la carpeta del change y restaura la BD. Security (automatizado): SAST sobre el diff, SCA de dependencias, detección de secretos y DAST ligero contra los endpoints nuevos usando el contrato de API. | reports de QA (unit-db, api, e2e); report de seguridad con hallazgos por severidad |
| 6 | Code Review — GATE DURO (obligatorio) | revisor de código | Revisa el diff contra los guardrails de arquitectura y un checklist de seguridad (OWASP Top 10 + report de 5b). Emite informe con línea "Veredicto: APTO / NO APTO". El veredicto solo puede ser APTO si el security scan está limpio o los hallazgos están justificados y aceptados. NO APTO o bloqueantes → vuelve a Implementación. Sin informe APTO no se archiva (hook de enforcement). | informe code-review (APTO) con sección de seguridad |
| 7 | Docs (paralelo con 6) | guardián de documentación | Sincroniza la documentación técnica (data-model, diagramas, api-spec, standards) y el registro de decisiones de seguridad (threat models por US, hallazgos aceptados con justificación). | docs actualizados y coherentes |
| 🔶 GATE 2 | Revisión humana final (parada obligatoria) | humano | El flujo SE DETIENE: con code-review APTO + validación manual, se espera el OK humano ANTES de archive/PR. | OK humano |
| 8 | Archive + PR | autor de especificaciones | Archiva el change con OpenSpec, promueve las specs vivas y abre el PR (solo tras gate final y code-review APTO). | change archivado, specs vivas, PR abierto |

**Paralelismos permitidos:** 4a con 4b, 5a con 5b, y 6 con 7. **Paradas humanas:** exactamente dos (Gate 1 y Gate 2).

## Estado actual del proyecto
- La arquitectura y estándares reales de Geoteknia están definidos en `docs/technical/` (base-standards.md, backend-standards.md, frontend-standards.md, data-model.md, development_guide.md).
- El proyecto ya tiene infraestructura de agentes y skills: definiciones en `ai-specs/agents/` y `ai-specs/skills/`, con espejos en `.claude/skills/` y `.cursor/skills/`. Ya existen skills OpenSpec (`openspec-propose`, `openspec-apply-change`, `openspec-archive-change`, `openspec-sync-specs`) y agentes como `backend-developer`.

# OBJETIVO
Definir el conjunto completo de **agentes** y **skills** necesarios para ejecutar todas las fases del harness definido arriba, adaptados a la arquitectura, stack y estándares reales de Geoteknia.

# TAREAS
1. Lee los estándares de `docs/technical/` e inventaría los agentes y skills ya existentes en el repositorio (`ai-specs/agents/`, `ai-specs/skills/`).
2. Elabora un **análisis de gap**: para cada rol de agente y cada capacidad (skill) que exige el harness, indica si ya existe algo en el repositorio (y si es reutilizable tal cual), existe pero requiere adaptación, o hay que crearlo desde cero.
3. Propón el **nombre concreto** de cada agente y skill siguiendo las convenciones ya presentes en el repositorio.
4. Para cada **agente** a crear o adaptar, define: nombre, misión, fase(s) que ejecuta, skills que usa, contexto mínimo de entrada, entregable de salida y condiciones de handoff al orquestador.
5. Para cada **skill** a crear o adaptar, define: nombre, propósito, agente(s) que la consumen y contenido clave (pasos obligatorios, guardrails, checklists). Deriva las skills de stack de las tecnologías reales del proyecto según `docs/technical/`.
6. Señala explícitamente las decisiones que requieren mi confirmación (p. ej. herramientas de security scan disponibles, si aplica la fase de contrato de API en este stack, integración con Linear vía MCP).

# RESTRICCIONES
- Respeta la estructura de fases, gates y paralelismos definida en el CONTEXTO: no elimines ni añadas paradas humanas.
- Reutiliza los agentes y skills existentes siempre que sea posible; no dupliques.
- No implementes todavía ningún fichero: esta fase es solo de definición y diseño.

# FORMATO DE SALIDA
Documento en Markdown con estas secciones:
1. **Mapa fase → agente → skills** (tabla).
2. **Análisis de gap** (tabla: elemento, estado actual, acción).
3. **Fichas de agentes** (una por agente).
4. **Fichas de skills** (una por skill).
5. **Decisiones abiertas** (lista numerada de preguntas para mí).
6. **Plan de implementación propuesto** (orden de creación de los ficheros).