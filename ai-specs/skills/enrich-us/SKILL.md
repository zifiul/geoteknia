---
name: enrich-us
description: Analiza y enriquece historias de usuario o tickets de Geoteknia con detalle técnico completo y listo para implementar, a partir de texto directo o de un fichero de `tickets/`.
author: Geoteknia
version: 1.0.0
---
# Skill enrich-us

Úsala cuando este flujo sea necesario en el proyecto.

## Instrucciones

Analiza y enriquece el ticket: $ARGUMENTS.

Sigue estos pasos:

1. Determina la fuente del ticket:
   - **Modo texto directo (por defecto cuando se aporta el texto del ticket)**: usa el contenido compartido por el usuario en el prompt/chat.
   - **Modo fichero de ticket**: si el usuario referencia un ID (`FEAT-10`, `DB-05`, `CHORE-02`, `SECURITY-08`, `PERF-01`, `A11Y-01`, `SEO-01`) o pide "el ticket X", localiza y lee el fichero correspondiente en `tickets/backend/`, `tickets/frontend/` o `tickets/db/`.
   - **Modo Jira (opcional)**: solo si el proyecto tiene configurado un MCP de Jira y el usuario lo pide explícitamente. Geoteknia no gestiona sus tickets en Jira por defecto: la fuente habitual son los ficheros de `tickets/`.
2. Actúa como un experto de producto con conocimiento técnico del stack de Geoteknia (Next.js App Router, Prisma, Auth.js, Zod, Claude).
3. Entiende el problema descrito en el ticket.
4. Decide si la historia de usuario está completamente detallada según las buenas prácticas de producto. Valida que incluya:
   - Descripción funcional completa.
   - Lista exhaustiva de campos a crear o actualizar (contrastando con `docs/technical/data-model.md` cuando aplique).
   - Estructura y URLs de los endpoints necesarios (Route Handler o Server Action, según `docs/technical/backend-standards.md`).
   - Ficheros/módulos a modificar según la arquitectura y buenas prácticas documentadas (`backend-standards.md`, `frontend-standards.md`).
   - Definición de terminado (pasos de implementación y entrega, incluyendo el checklist de `docs/technical/openspec-tasks-mandatory-steps.md` si el ticket va a convertirse en un cambio OpenSpec).
   - Actualizaciones de documentación y tests unitarios necesarios.
   - Requisitos no funcionales (RGPD/PII, RBAC/2FA, seguridad, rendimiento, SEO, observabilidad) cuando apliquen.
5. Si la historia no tiene suficiente detalle técnico para implementarse de forma autónoma, propone una versión mejorada, más clara, específica y concisa, alineada con el punto 4. Usa el contexto técnico del proyecto (`docs/technical/*-standards.md`, `docs/technical/data-model.md`, `openspec/config.yaml`). Devuelve el resultado en markdown.
6. El formato de salida debe incluir siempre:
   - `## Original`
   - `## Enriquecido`
7. Si el ticket enriquecido va a convertirse en trabajo real, indica que el siguiente paso natural es `/opsx:propose` (o el skill `openspec-propose` equivalente) para generar la propuesta OpenSpec completa (proposal, specs, design, tasks).

## Notas

- No es necesario Jira cuando el usuario ya ha aportado el contenido completo del ticket o el fichero existe en `tickets/`.
- Si la entrada es ambigua (por ejemplo, el usuario da una referencia corta sin contenido y no existe fichero en `tickets/` con ese ID), pregunta si debe buscarse en otra fuente o pide el texto completo del ticket.
- Este skill enriquece la historia a nivel de producto/requisitos; no sustituye a `/opsx:propose`, que genera los artefactos formales de OpenSpec (proposal, specs delta, design, tasks).
