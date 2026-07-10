---
name: us-traceability
description: Trazabilidad bidireccional entre User Stories de Linear, changes OpenSpec y specs vivas de Geoteknia - convención de nombres, enlaces cruzados y actualización de estado en Linear. Úsala al abrir un change desde una US (fase SDD) y al archivarlo (fase Archive).
author: Geoteknia
version: 1.0.0
---

# Skill us-traceability

Garantiza que cualquier persona (o agente) pueda navegar de una US de Linear a su change OpenSpec, sus specs, su PR y viceversa, sin arqueología.

## Convención de nombres

El change OpenSpec derivado de una US se nombra:

```text
<linear-id-en-minusculas>-<slug-corto>
```

Ejemplos: `geo-42-formulario-presupuesto`, `geo-7-login-2fa`.

La feature branch sigue el estándar del proyecto (`docs/technical/openspec-tasks-mandatory-steps.md` §4.1):

```text
feature/<area>-<linear-id>-<slug>     # p. ej. feature/backend-geo-42-formulario-presupuesto
```

## Enlaces obligatorios (al abrir el change, fase 1)

1. **En `proposal.md`**, sección de cabecera con:
   - `US: <LINEAR-ID> — <título>` con la URL de la issue de Linear.
   - Dependencias de la US (issues bloqueantes) si existen.
2. **En la issue de Linear** (vía MCP, `save_comment`): comentario con la ruta del change (`openspec/changes/<change-name>/`) y la branch creada.
3. **Estado en Linear:** mover la issue a "In Progress" (usa `list_issue_statuses` para obtener el estado equivalente del equipo).

## Durante el ciclo

- Cada delta spec del change menciona el `LINEAR-ID` en su encabezado, de modo que al promoverse a `openspec/specs/` la spec viva conserve de qué US procede cada requisito.
- Si el alcance cambia respecto a la US (descubrimiento durante implementación), se comenta en la issue de Linear además de actualizar `proposal.md`.

## Al cerrar (fase 8, Archive + PR)

1. Comentario final en la issue de Linear con: ruta del archive (`openspec/changes/archive/YYYY-MM-DD-<change-name>/`), URL del PR y resumen de 3-5 líneas.
2. Mover la issue al estado de revisión/hecho que corresponda al flujo del equipo (el merge del PR puede ser quien la cierre definitivamente; no la marques "Done" si el equipo cierra por merge).
3. El título o descripción del PR referencia el `LINEAR-ID` para que Linear vincule automáticamente el PR.

## Señales de alerta

- Un change activo cuyo nombre no permita identificar la US de origen.
- Issues de Linear en "In Progress" sin change asociado (o viceversa).
- Specs promovidas sin rastro de qué US introdujo cada requisito.
- Cerrar la US en Linear antes del OK humano del Gate 2.
