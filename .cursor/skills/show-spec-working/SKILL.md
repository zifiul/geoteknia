---
name: show-spec-working
description: Úsala cuando el usuario pida "enséñame X", "haz una demo de X", "muéstrame cómo funciona X" o solicite una demostración en vivo de una spec, feature o ticket de Geoteknia.
author: Geoteknia
version: 1.0.0
---

# Skill show-spec-working

Demuestra una spec de forma ejecutable.

Si el usuario no aporta contexto explícito, usa la spec/cambio OpenSpec que se esté trabajando actualmente en esta sesión.

Termina siempre informando de la finalización en el chat.

## Frases disparadoras (alta prioridad)

Trata estas expresiones como órdenes de ejecución, no como peticiones de análisis:

- `enséñame X`
- `haz una demo de X`
- `muéstrame cómo funciona X`
- `demuestra que X funciona`

Cuando aparezca cualquiera de estas, ejecuta directamente el flujo de demostración. No te detengas en un resumen de la funcionalidad ni en un informe rápido.

## Entradas

- Contexto opcional de spec aportado por el usuario:
  - ID de ticket directo en el texto (por ejemplo: `FEAT-17`, `DB-05`)
  - Nombre de la feature o del cambio OpenSpec
  - Endpoint (por ejemplo `/api/leads/presupuesto`)
  - Ruta frontend (por ejemplo `/servicios/[slug]` o el formulario multipaso de presupuesto)
- Si falta, infiérelo del contexto de sesión y del trabajo activo actual (`openspec/changes/<change-name>/`).

## Flujo de trabajo

### Paso 1 - Resolver spec y alcance objetivo

1. Identifica la spec/cambio objetivo:
   - Prioriza el contexto explícito dado por el usuario.
   - Si el texto contiene un patrón de ticket como `[A-Z]+-[0-9]+` (`FEAT-17`, `DB-05`), úsalo como contexto principal.
   - Si no, infiere la spec que se esté trabajando actualmente.
2. Determina la modalidad:
   - `frontend` cuando la spec incluye comportamiento de UI.
   - `solo-backend` cuando solo define comportamiento de API.
   - `mixta` cuando existen ambos.
3. Lista los escenarios concretos a demostrar a partir de los criterios de aceptación de la spec (`openspec/changes/<change-name>/specs/**/*.md` o `proposal.md`).

### Paso 1.1 - Salvaguarda anti-informe

Antes de continuar, aplica esta regla:

- Nunca termines habiendo analizado solo los requisitos.
- Nunca devuelvas solo un informe rápido cuando el usuario pidió "enseñar" o "hacer una demo".
- Si la ejecución está bloqueada, informa explícitamente del bloqueo y pide exactamente qué hace falta para continuar la demo en vivo.

### Paso 2 - Camino de demostración frontend

Ejecuta este camino cuando la modalidad sea `frontend` o `mixta`.

1. Arranca los servicios locales necesarios si hace falta (Next.js dev server).
2. Usa Playwright MCP para abrir la app y navegar hasta la funcionalidad objetivo. Antes de llamar a cualquier herramienta MCP de navegador, lee su descriptor y sigue las instrucciones del servidor sobre snapshots.
3. Demuestra el comportamiento de la spec, una interacción a la vez.
   - Ejemplo para el formulario multipaso de presupuesto:
     - Abrir la landing de servicio o zona.
     - Rellenar el paso 1 (servicio/zona).
     - Rellenar el paso 2 (datos del proyecto).
     - Rellenar el paso 3 (contacto) y enviar.
     - Verificar confirmación con referencia y evento `generate_lead`.
4. Tras cada acción relevante, verifica que el resultado visible coincide con lo esperado en la spec.
5. Detente en un estado final estable y deja que el usuario continúe explorando manualmente o pida cerrar la ventana.
6. Mantén el navegador abierto salvo que el usuario pida cerrarlo.

### Paso 3 - Camino de demostración de API backend

Ejecuta este camino cuando la modalidad sea `solo-backend` o `mixta`.

1. Identifica el/los endpoint(s) y payload(s) de ejemplo definidos por la spec (por ejemplo `POST /api/leads/presupuesto`, `POST /api/conversion-events`).
2. Ejecuta comandos `curl` reales que muestren el comportamiento de respuesta.
3. Si alguna llamada cambia el estado de datos (CREATE/UPDATE/DELETE):
   - Ejecuta inmediatamente después el comando de restauración/limpieza equivalente, siguiendo el proceso obligatorio de `docs/technical/openspec-tasks-mandatory-steps.md` §7.
4. Confirma el estado restaurado para que las demos repetidas sigan siendo deterministas.
5. Incluye el comando y la evidencia clave de la respuesta en el chat (de forma concisa).

## Requisitos de la demo de API

- Usa comandos `curl` explícitos (no pseudocódigo) siempre que haya datos de entorno disponibles.
- Enmascara valores sensibles en la salida del chat.
- Mantén los comandos idempotentes cuando sea posible.
- Incluye comandos de restauración para cualquier operación que cambie estado.

## Contrato de finalización

Envía siempre un mensaje final en el chat con:

1. Spec/cambio demostrado.
2. Qué se ejecutó:
   - Flujos frontend mostrados.
   - Comandos `curl` backend ejecutados.
3. Resultado de verificación por escenario demostrado (pass/fail con nota breve).
4. Estado de restauración de datos (si aplica).
5. Cierre final:
   - "Demo completada. Puedes seguir revisando en la ventana del navegador abierta o pedirme que la cierre."

## Formato de salida

Usa esta estructura concisa en la respuesta final del chat:

```markdown
Demo de spec completada para: <spec/cambio>

Recorrido frontend:
- <paso/resultado>

Recorrido de API backend:
- <curl + nota clave de respuesta>

Restauración de datos:
- <restaurada / no necesaria / fallida + motivo>

Siguiente paso:
- Puedes seguir en la ventana del navegador abierta, o pedirme que la cierre.
```
