---
name: commit
description: Crea commits enfocados y Pull Requests siguiendo los estándares del repositorio de Geoteknia.
author: Geoteknia
version: 1.0.0
---
# Skill commit

Úsala cuando este flujo sea necesario en el proyecto.

## Instrucciones

# Rol

Eres un experto en control de versiones y flujos de release. Creas commits y Pull Requests claros y completos que se alinean con los estándares del proyecto y facilitan la revisión y la trazabilidad.

# Argumentos

**Opcional.** `$ARGUMENTS` puede contener:

- **Nada (vacío)**: preparar (stage) y commitear todos los cambios relevantes del árbol de trabajo, y abrir un único PR.
- **Identificadores de ticket o feature**: por ejemplo IDs de ticket (`FEAT-10`, `DB-05`, `CHORE-02`), nombres de rama o etiquetas cortas de feature. Cuando se proporcionen, preparar y meter en el PR **solo** los cambios que pertenezcan a esas features; dejar el resto sin preparar ni commitear.
- **Modo solo-descripción / sin git**: si el usuario dice explícitamente algo como "sin PR", "solo commit" (es decir, solo generar el texto del commit), "solo la descripción", "no toques git" o "dry run", no ejecutes ningún comando git ni crees un PR. Solo determina el alcance, lista qué se prepararía y muestra el mensaje de commit propuesto (asunto + cuerpo). El usuario puede copiar y ejecutar los comandos por su cuenta.

# Objetivo

1. Producir un **único commit completo** que describa con precisión los cambios relevantes.
2. **Empujar (push)** la rama y **crear (o actualizar) un Pull Request** para revisión.
3. Si se dieron argumentos: **preparar y commitear solo** los cambios ligados a esas features; no tocar el resto de ficheros modificados.

# Proceso y reglas

## 0. Modo solo-descripción / sin git (comprobar primero)

Si el usuario ha pedido explícitamente no realizar operaciones git ("sin PR", "solo commit", "solo descripción", "no toques git", "dry run"):

- Realiza **solo** los pasos 1–3: inspeccionar el estado, resolver el alcance (qué ficheros/hunks se prepararían) y escribir el mensaje de commit completo (asunto + cuerpo).
- **No** ejecutes `git add`, `git commit`, `git push` ni `gh pr create`. No modifiques el repositorio de ninguna forma.
- Muestra al usuario:
  1. La lista de ficheros (y hunks, si es parcial) que se prepararían.
  2. El mensaje de commit propuesto en un bloque copiable.
- Después detente; omite los pasos 4, 5 y 6.

## 1. Inspeccionar el estado actual

- Ejecuta `git status` y `git diff` (y `git diff --staged` si hace falta) para listar todos los ficheros modificados, añadidos y eliminados.
- Identifica la rama actual. Si no estás en una rama de feature, decide si crear una nueva desde la rama base (normalmente `main`) siguiendo el formato `feature/<area>-<ticket-id>-<slug>` o `feature/<change-name>` de `docs/technical/openspec-tasks-mandatory-steps.md` §4.1.

## 2. Resolver alcance: commit completo vs. commit por feature

- **Si `$ARGUMENTS` está vacío o no se ha proporcionado**
  - Trata todos los cambios relevantes (excluyendo lo que no debe commitearse, por ejemplo `.env`, artefactos de build, config local) como el alcance de este commit.
  - Prepara todos esos cambios y continúa en el paso 3.

- **Si `$ARGUMENTS` incluye IDs de ticket o nombres de feature**
  - Relaciona cada argumento con los cambios que claramente le pertenecen (por ruta, por ID de ticket en el nombre de rama, o por contexto del diff).
  - Prepara **solo** los ficheros/hunks que pertenecen a esas features.
  - Deja el resto de ficheros modificados **sin preparar** y no los incluyas en el commit.
  - Si un fichero mezcla cambios de la feature solicitada con otros no relacionados, usa `git add -p` (o equivalente) para preparar solo los hunks correspondientes.
  - Si ningún cambio coincide claramente con los argumentos dados, infórmalo y no commitees.

## 3. Mensaje de commit

- Escribe el mensaje de commit **en español**, según `docs/technical/base-standards.md` §3 (todo el proyecto documenta y commitea en español).
- Hazlo **descriptivo**, según el flujo de trabajo de `docs/technical/backend-standards.md` §15.3 y `docs/technical/frontend-standards.md` §15.
- Estructura:
  - **Línea de asunto**: resumen corto en modo imperativo (por ejemplo, "Añadir filtros de leads al pipeline CRM", "Corregir validación del formulario de presupuesto"). Opcionalmente prefija con el ID de ticket (`FEAT-16: Añadir filtros de leads al pipeline CRM`).
  - **Cuerpo** (si hace falta): puntos o párrafos cortos describiendo qué cambió y por qué (áreas tocadas, comportamiento nuevo, fixes). Referencia el ID de ticket aquí si aplica.
- No commitees secretos, `.env` ni artefactos generados o sensibles.

## 4. Commit y push

- Crea el commit con el mensaje del paso 3.
- Empuja la rama actual al remoto (`git push origin <branch>`). Si la rama no existe en remoto, usa `-u` para fijar el upstream.

## 5. Pull Request

- Usa **GitHub CLI (`gh`)** para todas las operaciones de GitHub.
- Crea o actualiza el PR de la rama actual:
  - **Título**: claro, alineado con el commit (incluye el ID de ticket si aplica: `[FEAT-16] Añadir filtros de leads al pipeline CRM`).
  - **Descripción**: resume el conjunto de cambios, enlaza el ticket si procede, y anota pruebas realizadas o seguimientos pendientes.
- Si el repositorio usa protección de rama o checks obligatorios, menciona que el PR queda listo para revisión en cuanto pasen.

## 6. Resumen para el usuario

- Informa qué se ha commiteado (ficheros y alcance).
- Si se dieron argumentos: confirma qué features/tickets se incluyeron y que el resto quedó sin preparar.
- Da la URL del PR (de la salida de `gh`).

# Referencias

- `docs/technical/base-standards.md`: idioma español para commits y artefactos técnicos.
- `docs/technical/backend-standards.md` y `docs/technical/frontend-standards.md`: flujo git (ramas de feature, commits descriptivos, ramas pequeñas y enfocadas).
- `docs/technical/openspec-tasks-mandatory-steps.md` §4.1: convención de nombres de rama.

# Notas

- **Solo descripción**: cuando el usuario pida no crear PR o solo el texto del commit, muestra solo el plan de staging y el mensaje; no ejecutes ningún comando git ni `gh`.
- No ejecutes comandos git destructivos (por ejemplo `git push --force`) sin petición explícita del usuario.
- Si hay conflictos o el push es rechazado, informa la situación y sugiere próximos pasos (pull/rebase y luego push), pero no hagas force-push salvo que el usuario lo pida.
- Cuando se dan argumentos, **solo** los cambios ligados a esas features se preparan y commitean; el resto queda en el árbol de trabajo para un commit o PR aparte.
