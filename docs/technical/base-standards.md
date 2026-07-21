# Estándares Base — Geoteknia

> Reglas transversales de desarrollo para el proyecto Geoteknia. Aplican a todos los agentes de IA y a cualquier cambio de código, documentación, especificaciones, tickets o configuración.

---

## 1. Principios generales

- **Trabajar en pasos pequeños:** abordar una tarea cada vez, validar el contexto antes de avanzar y evitar cambios grandes sin una razón clara.
- **Cambios incrementales:** preferir modificaciones enfocadas, revisables y alineadas con el alcance solicitado.
- **Desarrollo guiado por pruebas:** para funcionalidad nueva o cambios de comportamiento, empezar por pruebas que describan el resultado esperado cuando el alcance lo permita. Si no existe infraestructura de tests para el área, documentar la brecha y añadir la cobertura mínima razonable.
- **TypeScript estricto:** todo el código de aplicación debe estar tipado. Evitar `any` salvo justificación explícita y localizada.
- **Validación runtime:** validar entradas externas con Zod o con los esquemas ya definidos en el módulo correspondiente.
- **Nombres claros:** usar nombres descriptivos para variables, funciones, componentes, acciones, rutas, modelos y tests.
- **Cuestionar supuestos:** comprobar datos, contratos y restricciones antes de inferir comportamiento no documentado.
- **Detectar patrones repetidos:** señalar duplicación relevante y extraer abstracciones solo cuando reduzcan complejidad real o sigan un patrón ya establecido.
- **Respetar cambios existentes:** no revertir cambios no realizados por el agente salvo petición explícita del usuario.

---

## 2. Contexto técnico del proyecto

Geoteknia es una web B2B para captación de leads de una ingeniería geotécnica española. La arquitectura objetivo es un **monolito modular Next.js full-stack** con un único despliegue y fronteras de dominio en `/lib`.

Stack base:

- **Frontend y backend:** Next.js 15 App Router, React 19 y TypeScript estricto.
- **Backend:** Route Handlers en `app/api/**/route.ts`, Server Actions cuando proceda y lógica de negocio fuera de los handlers.
- **Base de datos:** PostgreSQL gestionado en Neon, región EU, con Prisma.
- **Validación:** Zod para contratos compartidos entre frontend y backend.
- **Autenticación:** Auth.js v5 con credenciales, TOTP 2FA, RBAC y audit log para `/admin`.
- **IA:** SDK oficial de Anthropic solo server-side. Nunca exponer claves ni PII al cliente.
- **Email y anti-spam:** Resend, React Email y Cloudflare Turnstile.
- **Infraestructura:** Vercel, Neon y Cloudflare.
- **Testing:** Vitest para unidad/integración, Playwright para E2E y Lighthouse CI para Core Web Vitals cuando afecte a plantillas públicas.

Prioridades que deben proteger todas las decisiones:

1. SEO/ISR: SSG, ISR on-demand, JSON-LD, sitemap y Core Web Vitals en verde.
2. Captación y medición de leads cualificados por servicio, zona, canal y origen.
3. RGPD/LOPDGDD y seguridad de `/admin`: RBAC, 2FA, argon2, auditoría y Consent Mode v2.

---

## 3. Idioma del proyecto

El idioma de trabajo del proyecto es **español**.

Debe escribirse en español:

- Documentación en `docs/`.
- Tickets, propuestas, specs, diseños y tareas OpenSpec.
- Comentarios en código cuando sean necesarios.
- Mensajes de error orientados a usuario.
- Mensajes de commit.
- Descripciones de campos y notas funcionales.

Excepciones permitidas:

- Código fuente, nombres de variables, funciones, clases, tipos, componentes, rutas internas, tablas, columnas, enums y scripts deben seguir las convenciones técnicas del stack. En general, usar inglés técnico cuando sea el patrón natural del ecosistema o del código existente.
- Textos de librerías, APIs externas, schemas de terceros y claves de configuración deben respetar el nombre requerido por la herramienta.
- Mensajes internos de log pueden usar inglés técnico si mejora la integración con observabilidad o herramientas externas, pero deben ser consistentes.

Cuando haya duda, priorizar la coherencia con el documento o módulo existente.

---

## 4. Estándares específicos

Para reglas detalladas por área, consultar y seguir:

- [Backend Standards](./backend-standards.md): API, Route Handlers, Server Actions, Prisma, Auth.js, seguridad, auditoría, IA server-side y testing backend.
- [Frontend Standards](./frontend-standards.md): App Router, componentes React, SEO, JSON-LD, formularios, accesibilidad, `/admin` y rendimiento.
- [Documentation Standards](./documentation-standards.md): estructura, estilo y mantenimiento de documentación técnica y especificaciones para agentes.
- [OpenSpec Tasks Mandatory Steps](./openspec-tasks-mandatory-steps.md): checklist obligatorio y reglas de ejecución para `tasks.md`.
- [Data Model](./data-model.md): modelo relacional, enums, bloques reutilizables, índices y convenciones Prisma.
- [API Spec](./api-spec.yml): contratos de API cuando existan o se actualicen endpoints.
- [Arquitectura Stack Web B2B](../functional/arquitectura-stack-web-b2b-geoteknia.md): decisiones funcionales y técnicas transversales.

No duplicar contenido entre documentos. Si una regla ya vive en un documento específico, referenciarla desde el lugar nuevo en vez de copiarla salvo que sea imprescindible para comprensión local.

---

## 5. Modelo de trabajo con agentes y skills

- Los agentes deben revisar el contexto del proyecto antes de editar: documentación técnica aplicable, `openspec/config.yaml` y archivos cercanos al cambio.
- Cuando exista una skill relevante para la petición, el agente debe cargar y seguir su `SKILL.md` antes de continuar.
- Las skills del proyecto están expuestas actualmente en rutas específicas de agente, principalmente `.claude/skills/**/SKILL.md` y `.cursor/skills/**/SKILL.md`.
- Los comandos de agente relacionados con OPSX/OpenSpec viven en `.claude/commands/opsx/` y `.cursor/commands/`.
- Si una skill referencia archivos auxiliares, por ejemplo `references/*.md`, el agente debe leerlos cuando la propia skill lo requiera.
- Los agentes no deben inventar flujos alternativos cuando ya exista un comando, skill o estándar local para la tarea.

---

## 6. OpenSpec/OPSX como fuente de verdad

El proyecto usa OpenSpec con schema `spec-driven`, configurado en `openspec/config.yaml`.

Flujo principal:

- `/opsx:explore`: investigar y aclarar ideas antes de crear artefactos.
- `/opsx:propose`: crear una propuesta con specs, diseño y tareas cuando aplique.
- `/opsx:apply`: implementar las tareas de `tasks.md`.
- `/opsx:sync`: sincronizar delta specs hacia specs principales sin archivar.
- `/opsx:archive`: archivar cambios completados.

Reglas obligatorias:

- Antes de crear o actualizar `tasks.md`, leer `openspec/config.yaml` y `docs/technical/openspec-tasks-mandatory-steps.md`.
- Las propuestas, specs, diseños y tareas deben escribirse en español.
- Las delta specs deben usar `ADDED`, `MODIFIED`, `REMOVED` o `RENAMED` y escenarios Given/When/Then verificables.
- Las tareas deben incluir preparación, tests, verificación de base de datos, comprobaciones manuales ejecutadas por el agente cuando aplique y actualización documental.
- Si durante `/opsx:apply` aparece nueva información que cambia el alcance, actualizar primero los artefactos OpenSpec afectados y después implementar.

---

## 7. Cambios posteriores a `/opsx:apply`

Cuando aparezca una nueva petición de ajuste después de `/opsx:apply` y antes de `/opsx:archive`, tratarla como una actualización de especificación, no como un arreglo informal.

Orden obligatorio:

1. Actualizar los artefactos OpenSpec afectados: requisitos, escenarios, diseño o `tasks.md`.
2. Si hace falta regenerar artefactos, ejecutar el paso OPSX correspondiente: `/opsx:continue`, `/opsx:ff`, `/opsx:sync` o equivalente.
3. Implementar código solo después de que los artefactos reflejen la nueva petición.
4. Repetir la verificación contra los artefactos actualizados antes de archivar.

No aplicar cambios directos de código en esta ventana si dejan OpenSpec desactualizado.

---

## 8. Portabilidad multiagente y artefactos duplicados

El proyecto mantiene integración con varios agentes. Para evitar divergencias:

- **Fuente canónica:** definir explícitamente cuál es el origen de verdad de cada artefacto reutilizable. Para reglas técnicas, la fuente canónica debe estar en `docs/technical/` u `openspec/config.yaml`. Para skills y comandos, mantener sincronizadas las rutas equivalentes de `.claude` y `.cursor` mientras no exista una carpeta canónica común.
- **Cambios pareados:** cuando se modifique una skill o comando que exista para más de un agente, revisar la ruta equivalente y actualizarla si representa el mismo comportamiento.
- **Renombrados seguros:** cuando un archivo se renombre, mueva o cambie de sufijo, comprobar referencias, enlaces relativos, comandos y posibles symlinks antes de dar el cambio por terminado.
- **Nuevos artefactos:** si se crea una nueva skill, comando o regla que deba estar disponible para varios agentes, crear también la exposición correspondiente en cada ruta esperada o documentar por qué solo aplica a un agente.
- **Sin duplicación silenciosa:** no mantener dos copias divergentes del mismo estándar sin declarar cuál manda.
- **Puerta de cierre:** un cambio está incompleto si deja enlaces rotos, rutas obsoletas, referencias stale o artefactos equivalentes con comportamientos contradictorios.

---

## 9. Seguridad, privacidad y datos

- No enviar PII de contactos, leads o proyectos a prompts de Claude ni guardarla en `ai_generations`.
- Mantener datos personales y operativos en región EU.
- Nunca exponer secretos, tokens, claves API ni variables sensibles en cliente, logs públicos, documentación o commits.
- Aislar `/admin` del frontal público y marcarlo como `noindex`.
- Proteger acciones administrativas con RBAC, 2FA y auditoría cuando aplique.
- Usar argon2 para credenciales según los estándares backend del proyecto.
- Aplicar RGPD/LOPDGDD y Consent Mode v2 en flujos de tracking, analítica, formularios y conversión.

---

## 10. Modelo de datos y persistencia

- Usar UUID como identificador base salvo decisión documentada.
- Mantener tablas y columnas en `snake_case` mediante `@@map` y `@map` en Prisma.
- Reutilizar enums, bloques y entidades de `docs/technical/data-model.md` antes de crear nuevos.
- Aplicar `deleted_at` solo donde el modelo defina soft delete selectivo.
- No añadir `deleted_at` en tablas append-only.
- Usar transacciones Prisma cuando un caso de uso modifique varias entidades relacionadas.
- Documentar migraciones, seeds e índices cuando cambien el modelo o el rendimiento esperado.

---

## 11. Verificación y cierre

Antes de dar una tarea por completada, el agente debe:

1. Ejecutar las pruebas razonables para el área afectada.
2. Revisar errores de lint o tipos en archivos modificados cuando la herramienta esté disponible.
3. Verificar endpoints con `curl` o cliente equivalente cuando se hayan tocado APIs.
4. Ejecutar Playwright o una comprobación E2E cuando el cambio afecte a flujos críticos.
5. Comprobar impacto documental y actualizar los documentos necesarios.
6. Informar qué se cambió, qué se verificó y qué riesgo o cobertura pendiente queda.

Si una verificación no puede ejecutarse, explicar el motivo y el riesgo residual.
