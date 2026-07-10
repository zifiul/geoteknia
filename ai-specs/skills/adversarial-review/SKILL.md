---
name: adversarial-review
description: Úsala cuando el usuario pida una revisión adversarial, revisión red-team, un chequeo devil's advocate o una verificación independiente antes de archivar un cambio OpenSpec en Geoteknia.
author: Geoteknia
version: 1.0.0
---

# Skill adversarial-review

Actúa como un **revisor adversarial independiente**: asume que pueden existir huecos, fallos o comportamiento inseguro hasta que hayas argumentado en contra con evidencia.

Esta skill está pensada para la **ventana de verificación** del desarrollo guiado por especificaciones (después de implementar, **antes** de archivar con `/opsx:archive`), preferiblemente ejecutada por el humano en una **sesión o agente distinto** del que implementó el cambio.

No prescribas qué agente, modelo o IDE usar. Esa elección es del humano.

## Entradas

- Contexto opcional aportado por el usuario (mismo estilo que `show-spec-working`):
  - ID de ticket directo en el texto (por ejemplo: `FEAT-10`, `DB-05`)
  - Nombre de la feature o del cambio OpenSpec (`<change-name>`)
  - Endpoint(s) afectados
  - Ruta(s) frontend afectadas
  - **Pull request**: URL, o `owner/repo` y número (por ejemplo `https://github.com/org/repo/pull/42` o `owner/repo#42`)
- Si falta, infiere del contexto de la sesión actual (cambio activo, rama o carpeta OpenSpec).

Resuelve el alcance en este orden: ticket o nombre de cambio explícito → PR si se indica → trabajo activo actual.

## Mentalidad (revisión adversarial)

- **Intenta romper el sistema**, no solo confirmar los caminos felices.
- **Busca supuestos incorrectos** sobre forma de los datos, timing, orden, autorización, idempotencia y manejo de errores.
- **Rastrea riesgos de composición y de frontera**: piezas que por separado parecen correctas pero fallan juntas (varios ficheros, API + UI, reintentos + efectos secundarios).
- **Trata el diff como contexto incompleto**: tests ausentes, caminos negativos ausentes o desviación de la spec pueden esconder problemas.
- **Calibra la profundidad al riesgo**: auth, PII, RBAC/2FA, integración con Claude y mutación de datos merecen escrutinio más estricto en Geoteknia.

## Flujo de trabajo

### Paso 1 — Cargar primero el lado de la especificación

1. Identifica la carpeta del cambio OpenSpec (`openspec/changes/<change-name>/`) y lee los artefactos relevantes (`proposal.md`, `design.md`, `specs/**/*.md`, `tasks.md`).
2. Extrae los **criterios de aceptación y los no-objetivos explícitos**. Lista qué debe cumplirse para considerarlo "terminado".
3. Anota cualquier cosa **infra-especificada** (aceptación ambigua, casos de error ausentes, restricciones de seguridad o RGPD/PII ausentes).

### Paso 2 — Cargar el lado de la implementación

1. Si se dio una **PR**, trátala como la superficie principal de implementación:
   - Lee la descripción del PR y revisa el diff completo (no solo el orden por defecto de ficheros).
   - Mapea **ficheros y cambios** contra secciones de la spec y tareas de `tasks.md`.
2. Si no hay PR: usa `git diff` contra la base de la rama o la rama asociada al cambio, según la convención del proyecto.

### Paso 3 — Pasada adversarial (refutar, no dar el visto bueno de forma automática)

Para cada criterio de aceptación o escenario:

1. Indica cómo la implementación **podría fallar igualmente** aunque el autor creyera que pasa (input incorrecto, fallo parcial, doble envío, caché obsoleta, rol incorrecto, race condition, estado vacío, payload sobredimensionado).
2. Comprueba **casos negativos y de abuso** cuando aplique (bypass de validación Zod, patrones tipo IDOR sobre leads/proyectos, replay, conflictos de estado).
3. Comprueba **tests y evidencias de verificación**: ¿prueban realmente el criterio, o solo el camino feliz? Revisa si existen los informes de `openspec/changes/<change-name>/reports/` exigidos por `docs/technical/openspec-tasks-mandatory-steps.md` (tests + BD, `curl`, Playwright MCP).
4. Registra como hallazgo de primer nivel cualquier **desajuste spec vs código** (la spec dice X, el código hace Y).
5. Presta especial atención a: fuga de PII hacia Claude/logs/analítica, checks de RBAC/2FA en servidor (no solo ocultar UI), generación de audit log en acciones críticas, control de coste de IA, y restauración correcta del estado de base de datos tras operaciones de escritura.

### Paso 4 — Severidad y recomendaciones

Clasifica cada hallazgo:

- **Bloqueante**: comportamiento incorrecto, problema de seguridad/RGPD o violación de la spec que debería detener el archivado.
- **Mayor**: bug probable o hueco significativo; requiere fix o actualización de la spec antes de archivar.
- **Menor**: claridad, mantenibilidad o hueco de bajo riesgo; puede quedar como seguimiento.
- **Pregunta / supuesto**: necesita confirmación humana o del autor.

Para cada hallazgo, indica si el fix pertenece a **código**, **tests**, **artefactos OpenSpec** (specs, tasks, design) o **documentación**.

### Paso 5 — Veredicto

Termina con un veredicto claro:

- **PASS (adversarial)**: sin bloqueantes ni mayores; menores listados opcionalmente.
- **PASS CON HUECOS**: solo menores, pero registrados.
- **FAIL**: al menos un bloqueante o mayor pendiente.

## Formato de salida

Usa esta estructura en el chat:

```markdown
## Revisión adversarial

**Alcance**: <ticket / cambio / PR>
**Fuentes**: <rutas de spec + PR o referencia de diff>

### Alineación spec y tareas
- ...

### Hallazgos

| Severidad | Área | Hallazgo | Evidencia | Fix sugerido (código / spec / tests) |
|----------|------|---------|----------|--------------------------------------|
| Bloqueante / Mayor / Menor | | | | |

### Veredicto
PASS | PASS CON HUECOS | FAIL

### Próximos pasos recomendados (antes de archivar)
- ...
```

## Salvaguardas

- **No** elogies la implementación para "equilibrar" la crítica salvo que una fortaleza **mitigue directamente un riesgo documentado**.
- **No** te saltes la lectura de los artefactos OpenSpec cuando existan en el repositorio.
- Si no puedes acceder a la PR o al diff, dilo explícitamente y lista qué necesitas para continuar.

## Cierre

Termina siempre con el veredicto y si archivar con `/opsx:archive` es **aconsejable** en el estado actual.
