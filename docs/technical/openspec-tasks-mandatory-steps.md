# OpenSpec/OPSX Tasks: pasos obligatorios para `tasks.md`

> Estándar operativo para crear, actualizar e implementar tareas OpenSpec en Geoteknia usando el flujo OPSX actual. Aplica a cualquier `tasks.md` de cambios OpenSpec, tickets de `/tickets` y flujos `/opsx:*` o skills OpenSpec equivalentes.

---

## 1. Objetivo

Este estándar obliga a que todos los planes de implementación OpenSpec incluyan pasos mínimos de preparación, pruebas, verificación de base de datos, pruebas manuales ejecutadas por el agente y actualización documental.

OpenSpec usa actualmente **OPSX** como flujo estándar: un sistema guiado por artefactos, iterativo y no bloqueado por fases rígidas. Los artefactos habilitan el siguiente trabajo, pero pueden revisarse durante la implementación si aparece información nueva.

El proyecto Geoteknia es un **monolito modular Next.js full-stack** con:

- Next.js 15 App Router, React 19 y TypeScript estricto.
- Route Handlers en `app/api/**/route.ts` y Server Actions cuando aplique.
- Prisma sobre PostgreSQL gestionado en Neon, región EU.
- Zod para validación runtime.
- Auth.js v5, 2FA TOTP, RBAC y audit log para `/admin`.
- Vitest para unidad/integración y Playwright para flujos E2E críticos.
- Lighthouse CI como quality gate de rendimiento, SEO y accesibilidad cuando afecte a plantillas públicas.

---

## 2. Compatibilidad con OpenSpec/OPSX actual

### 2.1 Flujo principal

El perfil por defecto (`core`) de OpenSpec trabaja con estos comandos de chat:

| Comando | Uso |
|---|---|
| `/opsx:explore` | Investigar y aclarar ideas antes de crear artefactos. No crea cambios ni archivos obligatorios. |
| `/opsx:propose` | Crear un cambio y generar los artefactos de planificación necesarios. |
| `/opsx:apply` | Implementar las tareas de `tasks.md` y marcar checkboxes al completarlas. |
| `/opsx:sync` | Fusionar delta specs del cambio en `openspec/specs/` sin archivar todavía. |
| `/opsx:archive` | Archivar un cambio completado en `openspec/changes/archive/`. |

El flujo expandido puede añadir:

| Comando | Uso |
|---|---|
| `/opsx:new` | Crear solo el scaffold de un cambio. |
| `/opsx:continue` | Crear el siguiente artefacto disponible según dependencias. |
| `/opsx:ff` | Crear todos los artefactos de planificación de una vez. |
| `/opsx:verify` | Validar que la implementación coincide con los artefactos. |
| `/opsx:bulk-archive` | Archivar varios cambios completados. |
| `/opsx:onboard` | Recorrido guiado del flujo completo. |

Los comandos `/opsx:*` se ejecutan en el chat del asistente, no en terminal. Los comandos `openspec init`, `openspec update`, `openspec status`, `openspec schemas` y similares se ejecutan en terminal.

### 2.2 Artefactos del schema `spec-driven`

El schema por defecto `spec-driven` usa estos artefactos:

```text
proposal -> specs -> design -> tasks -> implement
```

La relación es de dependencia operativa, no de fase rígida:

- `proposal.md` explica intención, alcance e impacto.
- `specs/**/*.md` contiene delta specs: requisitos `ADDED`, `MODIFIED`, `REMOVED` o `RENAMED`.
- `design.md` describe el enfoque técnico cuando aplica.
- `tasks.md` contiene la lista de implementación que `/opsx:apply` ejecuta y marca.

Si durante `/opsx:apply` se descubre que el diseño, specs o tareas están incompletos, el agente debe actualizar el artefacto correspondiente y seguir trabajando dentro del mismo cambio cuando el objetivo siga siendo el mismo.

### 2.3 Configuración actual

`openspec/config.yaml` es la fuente de configuración del proyecto y sustituye al antiguo `openspec/project.md`.

Debe contemplar:

```yaml
schema: spec-driven

context: |
  Contexto conciso del proyecto inyectado en todos los artefactos.

rules:
  proposal:
    - Regla específica para propuestas
  specs:
    - Regla específica para especificaciones
  design:
    - Regla específica para diseños
  tasks:
    - Regla específica para tareas
```

Reglas actuales relevantes:

- `context` se inyecta en todos los artefactos y debe mantenerse conciso.
- `rules` se inyecta solo en el artefacto cuyo ID coincide.
- En `spec-driven`, los IDs válidos son `proposal`, `specs`, `design` y `tasks`.
- La resolución de schema sigue este orden: flag `--schema`, `.openspec.yaml` del cambio, `openspec/config.yaml`, valor por defecto `spec-driven`.
- `.openspec.yaml` dentro del cambio guarda metadatos como schema y fecha de creación cuando el scaffold lo genera.

---

## 3. Lectura obligatoria antes de editar `tasks.md`

Antes de crear o actualizar cualquier `tasks.md`, el agente debe leer siempre `openspec/config.yaml`.

Además, cuando el cambio toque el área correspondiente, debe revisar:

| Área del cambio | Documentación de referencia |
|---|---|
| Backend, API, Prisma, Auth.js, IA, email, auditoría o seguridad | `docs/technical/backend-standards.md` |
| Frontend, App Router, componentes, SEO, formularios, `/admin`, CWV o accesibilidad | `docs/technical/frontend-standards.md` |
| Modelo de datos, enums, índices, migraciones o seeds | `docs/technical/data-model.md` |
| Documentación técnica o reglas para agentes | `docs/technical/documentation-standards.md` |
| Arquitectura, stack o decisiones transversales | `docs/functional/arquitectura-stack-web-b2b-geoteknia.md` |

Si `openspec/config.yaml` no define reglas específicas para `tasks`, este documento actúa como estándar por defecto del proyecto.

---

## 4. Convenciones de cambio y ramas

### 4.1 Rama obligatoria como paso 0

Todo `tasks.md` debe empezar por el paso 0: crear y verificar una rama de trabajo antes de modificar código.

Formato recomendado:

```text
feature/<area>-<ticket-id>-<slug>
```

Ejemplos:

- `feature/backend-feat-10-leads-presupuesto`
- `feature/frontend-feat-17-formulario-presupuesto`
- `feature/db-db-11-crm-contactos-leads-proyectos`
- `feature/openspec-update-tasks-standard`

Si el cambio no procede de un ticket, usar:

```text
feature/<change-name>
```

La rama debe crearse desde `main` o desde la rama base acordada para el cambio. El agente debe comprobar la rama actual y no debe sobrescribir trabajo no relacionado del usuario.

### 4.2 Estructura del cambio OpenSpec/OPSX

El formato esperado para un cambio es:

```text
openspec/
└── changes/
    └── <change-name>/
        ├── .openspec.yaml         # metadatos del cambio si lo genera OPSX
        ├── proposal.md
        ├── design.md              # si aplica
        ├── tasks.md
        ├── specs/                 # delta specs si aplica
        └── reports/               # evidencias creadas por el agente
```

Los informes de pruebas deben guardarse en:

```text
openspec/changes/<change-name>/reports/
```

Al archivar, OpenSpec mueve el cambio a:

```text
openspec/changes/archive/YYYY-MM-DD-<change-name>/
```

---

## 5. Pasos obligatorios en todo `tasks.md`

Todo `tasks.md` debe incluir, en orden, los siguientes bloques obligatorios. Pueden existir pasos funcionales entre ellos, pero estos bloques no deben faltar.

Esto aplica tanto si `tasks.md` se crea mediante `/opsx:propose`, `/opsx:continue`, `/opsx:ff` o edición manual.

### Paso 0: crear rama de feature (OBLIGATORIO - PRIMER PASO)

Debe ser el primer bloque del archivo.

Debe incluir, como mínimo:

- Crear la rama `feature/<area>-<ticket-id>-<slug>` o `feature/<change-name>`.
- Verificar la rama actual.
- Revisar `git status` para detectar cambios previos del usuario.
- Confirmar que no se revertirá ni pisará trabajo no relacionado.

### Paso N: revisar y actualizar tests existentes (OBLIGATORIO)

Antes de cerrar una implementación, el agente debe revisar los tests existentes y adaptarlos al comportamiento nuevo.

Debe incluir:

- Localizar tests unitarios, de integración o componentes relacionados.
- Actualizar expectativas obsoletas.
- Añadir tests enfocados cuando exista lógica nueva o cambio de contrato.
- Evitar snapshots amplios salvo que ya sea el patrón local.

### Paso N+1: ejecutar tests unitarios y verificar estado de base de datos (OBLIGATORIO - AGENTE DEBE EJECUTAR)

El agente debe ejecutar los tests. No puede delegar este paso al usuario.

Debe incluir:

- Preparar el entorno de test.
- Registrar el comando exacto a ejecutar.
- Capturar estado de base de datos antes de los tests cuando el cambio toque persistencia, Prisma, seeds, formularios que escriben datos, Auth.js, audit log, CRM, contenido o leads.
- Ejecutar primero tests dirigidos al módulo modificado.
- Ejecutar después la suite requerida por `openspec/config.yaml` o, si no existe regla específica, la suite razonable del proyecto (`test`, `test:unit`, `vitest`, `pnpm test`, `npm test` o equivalente disponible).
- Verificar estado de base de datos posterior.
- Restaurar cualquier mutación no esperada.
- Crear un informe en `openspec/changes/<change-name>/reports/`.
- Marcar el paso como completado solo después de que los tests pasen o exista una excepción aprobada y documentada.

Nombre obligatorio del informe:

```text
YYYY-MM-DD-step-N+1-unit-test-and-db-verification.md
```

Plantilla mínima:

```markdown
# Informe Step N+1 - Tests unitarios y verificación de base de datos

- Fecha: YYYY-MM-DD
- Cambio: <change-name>
- Agente: <agent-name>

## Comandos ejecutados
- `<command 1>`
- `<command 2>`

## Resultados de tests
- Tests dirigidos: X passed, Y failed, Z skipped
- Suite requerida/completa: X passed, Y failed, Z skipped
- Duración: <duration>
- Notas: <flaky tests, retries, excepciones>

## Verificación de base de datos
- Línea base previa:
  - <métrica/tabla/check>: <valor>
- Validación posterior:
  - <métrica/tabla/check>: <valor>
- Estado restaurado: Sí/No
- Acciones de restauración: <acciones o ninguna>

## Resultado
- Estado del paso N+1: PASS/FAIL
- Bloqueos: <ninguno o lista>
```

### Paso N+2: pruebas manuales de endpoints con `curl` (OBLIGATORIO si hay endpoints - AGENTE DEBE EJECUTAR)

Este paso aplica a cualquier cambio que cree, modifique o dependa de Route Handlers, webhooks, endpoints internos o endpoints consumidos por formularios.

El agente debe ejecutar los comandos `curl` y verificar las respuestas. No puede pedir al usuario que los ejecute.

Debe cubrir:

- Arrancar o verificar el servidor backend/Next.js si es necesario.
- Confirmar conexión con base de datos cuando el endpoint persista o lea datos.
- Probar endpoints `GET` y validar código HTTP, estructura y contenido.
- Probar endpoints `POST` y limpiar los registros creados.
- Probar endpoints `PUT`/`PATCH` y restaurar valores originales.
- Probar endpoints `DELETE` y recrear o restaurar datos cuando sea necesario.
- Probar errores esperados: validación Zod, recurso inexistente, acceso no autorizado, rate limit o Turnstile si aplica.
- Verificar que el formato de error respeta el contrato del proyecto.
- Documentar comandos, respuestas relevantes, estado de base de datos y limpieza.

Nombre obligatorio del informe:

```text
YYYY-MM-DD-step-N+2-curl-endpoint-verification.md
```

El informe debe guardarse en `openspec/changes/<change-name>/reports/`.

### Paso N+3: pruebas E2E con Playwright MCP (OBLIGATORIO si hay flujo de usuario - AGENTE DEBE EJECUTAR)

Este paso aplica cuando el cambio afecta a:

- Formularios públicos de captación.
- Microconversiones: teléfono, WhatsApp, ubicación, calculadora, descarga de recursos.
- Login, 2FA, RBAC o flujos de `/admin`.
- CMS, flujo editorial, publicación ISR o preview.
- Integración frontend-backend visible para el usuario.
- SEO técnico, accesibilidad o rendimiento de plantillas críticas cuando requiera verificación en navegador.

El agente debe ejecutar las pruebas usando herramientas Playwright MCP disponibles. No puede delegar este paso al usuario.

Debe incluir:

- Revisar las herramientas MCP disponibles antes de usarlas.
- Arrancar o verificar frontend y backend.
- Navegar a la URL de la aplicación con Playwright MCP.
- Capturar snapshot inicial.
- Ejecutar el flujo completo con interacciones reales.
- Validar estados de carga, éxito y error.
- Probar validaciones de formularios y recuperación de errores.
- Verificar persistencia cuando el flujo cree o modifique datos.
- Restaurar datos y cerrar sesiones.
- Documentar escenarios y resultado.

Nombre obligatorio del informe:

```text
YYYY-MM-DD-step-N+3-playwright-e2e-verification.md
```

El informe debe guardarse en `openspec/changes/<change-name>/reports/`.

### Paso N+4: actualizar documentación técnica (OBLIGATORIO)

Todo cambio debe revisar si afecta a documentación.

Debe incluir:

- Actualizar `docs/technical/data-model.md` si cambia Prisma, enums, índices, seeds o persistencia.
- Actualizar `docs/technical/api-spec.yml` si cambia un contrato HTTP.
- Actualizar `docs/technical/backend-standards.md` o `frontend-standards.md` si el cambio introduce una convención nueva.
- Actualizar documentación funcional si cambia comportamiento de producto, alcance o arquitectura.
- Mantener toda la documentación en español.
- Referenciar documentación existente en vez de duplicarla.

---

## 6. Responsabilidad del agente durante la implementación

Cuando el agente implemente tareas desde `tasks.md`, debe ejecutar por sí mismo las verificaciones obligatorias.

El agente debe:

- Crear o verificar la rama de trabajo antes de editar código.
- Ejecutar tests unitarios, integración y suites aplicables.
- Ejecutar `curl` para endpoints nuevos o modificados.
- Ejecutar Playwright MCP para flujos de usuario aplicables.
- Arrancar servidores necesarios cuando el proyecto lo permita.
- Verificar y restaurar el estado de base de datos tras operaciones CREATE, UPDATE o DELETE.
- Crear los informes de evidencia en `openspec/changes/<change-name>/reports/`.
- Marcar tareas como completadas (`[x]`) solo después de ejecutar y documentar la verificación correspondiente.
- Actualizar `proposal.md`, `specs/**/*.md`, `design.md` o `tasks.md` si la implementación descubre una corrección necesaria dentro del mismo alcance.
- Ejecutar `/opsx:verify` antes de archivar cuando el comando esté disponible en el perfil instalado o cuando el cambio tenga riesgo medio/alto.
- Ejecutar `/opsx:sync` antes de `/opsx:archive` cuando se quiera revisar la fusión de delta specs por separado o haya cambios paralelos que dependan de las specs actualizadas.

El agente no debe:

- Pedir al usuario que ejecute `curl`.
- Pedir al usuario que haga pruebas manuales en navegador.
- Marcar una tarea obligatoria como completada sin evidencia.
- Saltarse pruebas manuales porque los tests unitarios pasan.
- Dejar datos de prueba persistidos sin documentar y restaurar.
- Revertir cambios no relacionados del usuario.

Si una prueba no puede ejecutarse por falta de dependencia, credenciales, servicio externo o herramienta MCP, el agente debe dejar el paso sin completar, documentar el bloqueo y explicar qué falta.

---

## 7. Requisitos de restauración de base de datos

La verificación de estado de base de datos es obligatoria cuando el cambio toca:

- `prisma/schema.prisma`, migraciones o seeds.
- Leads, contactos, proyectos, CRM o eventos de conversión.
- Auth.js, sesiones, 2FA, RBAC o audit log.
- Contenido publicable, revisiones, IA o publicación ISR.
- Endpoints o formularios que creen, actualicen o eliminen registros.

La restauración debe seguir este orden:

1. Capturar línea base previa: conteos, identificadores clave, checksums simples, snapshots o consultas relevantes.
2. Ejecutar pruebas.
3. Comparar línea base posterior.
4. Eliminar, revertir o recrear registros de prueba.
5. Documentar cualquier diferencia aceptada.

En pruebas que usen una base efímera o branch de Neon para el cambio, el agente debe documentar igualmente la base usada y el mecanismo de aislamiento.

---

## 8. Checklist antes de finalizar un `tasks.md`

Antes de dar por válido un `tasks.md`, verificar:

- [ ] El archivo se creó o actualizó después de leer `openspec/config.yaml`.
- [ ] Si existe `.openspec.yaml`, el schema del cambio se tuvo en cuenta.
- [ ] Si se añadió una regla estable para tareas, se planteó moverla a `openspec/config.yaml` bajo `rules.tasks`.
- [ ] El paso 0 es el primer bloque.
- [ ] La rama usa `feature/<area>-<ticket-id>-<slug>` o `feature/<change-name>`.
- [ ] Los pasos están numerados de forma secuencial.
- [ ] Todos los pasos obligatorios incluyen la etiqueta `(OBLIGATORIO)`.
- [ ] Los pasos de ejecución manual indican explícitamente `AGENTE DEBE EJECUTAR`.
- [ ] El paso N+1 incluye ruta y nombre del informe de tests unitarios y base de datos.
- [ ] El paso N+2 aparece si hay endpoints Route Handler, webhooks o contratos HTTP.
- [ ] El paso N+3 aparece si hay flujo frontend, `/admin`, formulario, integración UI o verificación de navegador.
- [ ] Los pasos con CREATE/UPDATE/DELETE incluyen restauración de base de datos.
- [ ] El paso N+4 revisa la documentación técnica afectada.
- [ ] No se pide al usuario ejecutar pruebas que el agente puede ejecutar.
- [ ] Si el perfil dispone de `/opsx:verify`, queda previsto ejecutarlo antes del archivo del cambio.

---

## 9. Estructura de ejemplo para Geoteknia

```markdown
## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [ ] 0.1 Revisar `openspec/config.yaml` y documentación técnica aplicable.
- [ ] 0.2 Crear rama `feature/backend-feat-10-leads-presupuesto` desde rama actual.
- [ ] 0.3 Verificar rama actual y `git status`.
- [ ] 0.4 Confirmar que no se sobrescribirá trabajo no relacionado del usuario.

## 1. Backend: contrato y validación del endpoint

- [ ] 1.1 Revisar `docs/technical/backend-standards.md`.
- [ ] 1.2 Definir schema Zod para la entrada.
- [ ] 1.3 Añadir tests dirigidos de validación.

## 2. Backend: caso de uso y persistencia

- [ ] 2.1 Implementar lógica en `/lib/leads`.
- [ ] 2.2 Persistir mediante Prisma con transacción si aplica.
- [ ] 2.3 Registrar audit/conversion event cuando corresponda.

## 3. Backend: Route Handler

- [ ] 3.1 Crear o actualizar `app/api/**/route.ts`.
- [ ] 3.2 Mapear errores de validación, autorización y dominio.
- [ ] 3.3 Evitar exponer PII innecesaria.

## 4. Backend: revisar y actualizar tests existentes (OBLIGATORIO)

- [ ] 4.1 Localizar tests relacionados.
- [ ] 4.2 Actualizar expectativas afectadas.
- [ ] 4.3 Añadir casos nuevos para comportamiento introducido.

## 5. Backend: ejecutar tests unitarios y verificar base de datos (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [ ] 5.1 Capturar línea base de base de datos para entidades impactadas.
- [ ] 5.2 Ejecutar tests dirigidos.
- [ ] 5.3 Ejecutar suite requerida por el proyecto.
- [ ] 5.4 Verificar estado posterior y restaurar si procede.
- [ ] 5.5 Crear informe `openspec/changes/<change-name>/reports/YYYY-MM-DD-step-5-unit-test-and-db-verification.md`.
- [ ] 5.6 Marcar completado solo si tests, verificación y reporte están correctos.

## 6. Backend: pruebas manuales de endpoints con curl (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [ ] 6.1 Arrancar o verificar servidor Next.js.
- [ ] 6.2 Ejecutar `curl` para casos GET/POST/PATCH/DELETE aplicables.
- [ ] 6.3 Probar errores de validación, 404 y autorización.
- [ ] 6.4 Restaurar base de datos tras operaciones de escritura.
- [ ] 6.5 Crear informe `openspec/changes/<change-name>/reports/YYYY-MM-DD-step-6-curl-endpoint-verification.md`.

## 7. Frontend: E2E con Playwright MCP (OBLIGATORIO si aplica - AGENTE DEBE EJECUTAR)

- [ ] 7.1 Arrancar o verificar frontend y backend.
- [ ] 7.2 Navegar con Playwright MCP al flujo afectado.
- [ ] 7.3 Ejecutar el flujo completo y validar resultado.
- [ ] 7.4 Probar escenarios de error.
- [ ] 7.5 Restaurar datos creados por la prueba.
- [ ] 7.6 Crear informe `openspec/changes/<change-name>/reports/YYYY-MM-DD-step-7-playwright-e2e-verification.md`.

## 8. Actualizar documentación técnica (OBLIGATORIO)

- [ ] 8.1 Actualizar `docs/technical/api-spec.yml` si cambia contrato HTTP.
- [ ] 8.2 Actualizar `docs/technical/data-model.md` si cambia persistencia.
- [ ] 8.3 Actualizar estándares técnicos si se introduce una convención nueva.
- [ ] 8.4 Confirmar que toda la documentación está en español.

## 9. Verificación OpenSpec antes de archivar (OBLIGATORIO si el comando está disponible)

- [ ] 9.1 Ejecutar `/opsx:verify <change-name>` o documentar por qué no está disponible.
- [ ] 9.2 Resolver hallazgos críticos antes de archivar.
- [ ] 9.3 Actualizar artefactos si la implementación difiere justificadamente del diseño inicial.
- [ ] 9.4 Ejecutar `/opsx:sync <change-name>` si se quiere revisar la fusión de specs antes del archivo.
- [ ] 9.5 Archivar con `/opsx:archive <change-name>` solo cuando tareas, tests, informes y specs estén coherentes.
```

---

## 10. Criterio de fallo

Un `tasks.md` no es válido si:

- No empieza con el paso 0 de rama.
- No incluye los pasos obligatorios.
- Delega pruebas ejecutables al usuario.
- Marca como completada una prueba no ejecutada por el agente.
- Omite informes de evidencia para tests, `curl` o Playwright MCP cuando aplican.
- No contempla restauración de base de datos tras pruebas con escritura.
- Ignora reglas explícitas de `openspec/config.yaml`.
- Usa terminología legacy (`/openspec:*`, `openspec/project.md`, phase gates) como flujo principal sin justificar compatibilidad.
- No contempla que los artefactos OPSX pueden actualizarse iterativamente durante `/opsx:apply`.

Si alguna obligación no puede cumplirse, debe quedar como tarea pendiente con una explicación concreta del bloqueo.
