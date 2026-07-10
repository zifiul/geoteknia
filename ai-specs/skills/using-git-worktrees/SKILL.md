---
name: using-git-worktrees
description: Úsalo al empezar trabajo de una funcionalidad que necesita aislarse del workspace actual o antes de ejecutar planes de implementación - asegura que existe un workspace aislado mediante herramientas nativas o, en su defecto, git worktree
author: Geoteknia
version: 1.0.0
---

# Usando Git Worktrees

## Visión general

Asegura que el trabajo ocurre en un workspace aislado. Prioriza las herramientas nativas de worktree de tu plataforma. Recurre a git worktree manual solo cuando no haya ninguna herramienta nativa disponible.

**Principio central:** Detecta primero el aislamiento existente. Luego usa herramientas nativas. Luego recurre a git. Nunca luches contra el harness.

**Anuncia al empezar:** "Estoy usando la skill using-git-worktrees para preparar un workspace aislado."

## Paso 0: Detectar aislamiento existente

**Antes de crear nada, comprueba si ya estás en un workspace aislado.**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**Guardia de submódulos:** `GIT_DIR != GIT_COMMON` también es cierto dentro de submódulos de git. Antes de concluir "ya estoy en un worktree", verifica que no estás en un submódulo:

```bash
# Si esto devuelve una ruta, estás en un submódulo, no en un worktree — trátalo como repo normal
git rev-parse --show-superproject-working-tree 2>/dev/null
```

**Si `GIT_DIR != GIT_COMMON` (y no es un submódulo):** Ya estás en un worktree enlazado. Salta al Paso 3 (Configuración del proyecto). NO crees otro worktree.

Informa con el estado de la rama:
- En una rama: "Ya estoy en un workspace aislado en `<path>` en la rama `<name>`."
- HEAD desacoplado (detached HEAD): "Ya estoy en un workspace aislado en `<path>` (detached HEAD, gestionado externamente). Se necesitará crear una rama al finalizar."

**Si `GIT_DIR == GIT_COMMON` (o estás en un submódulo):** Estás en un checkout normal del repo.

¿El usuario ya ha indicado su preferencia sobre worktrees en tus instrucciones? Si no, pide consentimiento antes de crear un worktree:

> "¿Quieres que prepare un worktree aislado? Protege tu rama actual de cambios."

Respeta cualquier preferencia declarada previamente sin volver a preguntar. Si el usuario rechaza el consentimiento, trabaja en el sitio y salta al Paso 3.

## Paso 1: Crear el workspace aislado

**Tienes dos mecanismos. Pruébalos en este orden.**

### 1a. Herramientas nativas de worktree (preferido)

El usuario ha pedido un workspace aislado (consentimiento del Paso 0). ¿Ya tienes una forma de crear un worktree? Puede ser una herramienta con un nombre como `EnterWorktree`, `WorktreeCreate`, un comando `/worktree`, o un flag `--worktree`. Si la tienes, úsala y salta al Paso 3.

Las herramientas nativas gestionan automáticamente la ubicación del directorio, la creación de la rama y la limpieza. Usar `git worktree add` cuando dispones de una herramienta nativa crea un estado fantasma que tu harness no puede ver ni gestionar.

Si el flujo nativo no propaga la configuración de Claude/Cursor y el usuario espera paridad con el checkout principal, copia `.claude/settings.json` y `.claude/settings.local.json` desde el workspace principal usando el mismo bucle que el Paso 1b **después** de que la herramienta nativa termine—solo cuando los ficheros existan en disco.

Solo continúa al Paso 1b si no tienes ninguna herramienta nativa de worktree disponible.

### 1b. Alternativa con Git Worktree

**Usa esto solo si el Paso 1a no aplica** — no tienes ninguna herramienta nativa de worktree disponible. Crea un worktree manualmente con git.

#### Selección del directorio

Usa una única ubicación: `.worktrees/` dentro de la raíz del repositorio.

1. Establece la raíz del repositorio y el directorio base de worktrees:
   ```bash
   SOURCE_ROOT=$(git rev-parse --show-toplevel)
   LOCATION="$SOURCE_ROOT/.worktrees"
   ```

2. Asegúrate de que el directorio existe:
   ```bash
   mkdir -p "$LOCATION"
   ```

3. Crea siempre el worktree en:
   ```bash
   path="$LOCATION/$BRANCH_NAME"
   ```

No deben usarse alternativas globales o hermanas al repo salvo que el usuario lo indique explícitamente para una tarea puntual.

#### Verificación de seguridad

**DEBES verificar que `.worktrees/` está ignorado antes de crear el worktree:**

```bash
git check-ignore -q .worktrees 2>/dev/null
```

**Si NO está ignorado:** Añade `.worktrees/` a `.gitignore`, haz commit del cambio, y luego procede.

**Por qué es crítico:** Evita hacer commit accidentalmente del contenido del worktree al repositorio.

#### Crear el worktree

**Captura la raíz del checkout principal antes de `git worktree add`.** Tras hacer `cd` al nuevo worktree, `git rev-parse --show-toplevel` apunta al directorio del worktree, no al checkout donde normalmente viven `.claude/settings*.json`.

```bash
project=$(basename "$(git rev-parse --show-toplevel)")
SOURCE_ROOT=$(git rev-parse --show-toplevel)

# La ruta siempre está dentro de .worktrees/ local al repo
path="$LOCATION/$BRANCH_NAME"

git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

**Alternativa por sandbox:** Si `git worktree add` falla con un error de permisos (denegación del sandbox), avisa al usuario de que el sandbox bloqueó la creación del worktree y que trabajarás en el directorio actual en su lugar. Luego ejecuta la configuración y las pruebas de referencia en el sitio.

#### Copiar la configuración de Claude (solo Paso 1b)

Tras crear el worktree con git (Paso 1b), copia la configuración local de Claude desde el **checkout principal** para que el comportamiento de Cursor/Claude CLI coincida con el del workspace principal. Estos ficheros a menudo no están versionados.

**No** los copies si el usuario lo rechaza o si una herramienta nativa (Paso 1a) ya propaga la configuración—respeta el harness.

Ejecuta esto **después** de `cd "$path"` (usando todavía el `SOURCE_ROOT` capturado antes):

```bash
copied_claude_settings=false
for claude_settings in ".claude/settings.json" ".claude/settings.local.json"; do
    if [ -f "$SOURCE_ROOT/$claude_settings" ]; then
        mkdir -p ".claude"
        cp -p "$SOURCE_ROOT/$claude_settings" "./$claude_settings"
        echo "Copied $claude_settings to worktree"
        copied_claude_settings=true
    fi
done

if [ "$copied_claude_settings" = false ]; then
    echo "No local Claude settings found (.claude/settings.json or .claude/settings.local.json)"
fi
```

**Symlinks:** Si el árbol origen usa symlinks para `.claude` (p. ej. `.claude/skills` → `../../ai-specs/skills`), copiar solo estos ficheros JSON no recrea los destinos de los symlinks. O bien replica el mismo esquema de symlinks en el worktree, o confía en rutas relativas al proyecto dentro de `settings.json`.

## Paso 3: Configuración del proyecto

Autodetecta y ejecuta la configuración adecuada:

```bash
# Node.js
if [ -f package.json ]; then npm install; fi
if [ -f prisma/schema.prisma ]; then npx prisma generate; fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

## Paso 4: Verificar una base limpia

Ejecuta las pruebas para asegurarte de que el workspace arranca limpio:

```bash
# Usa el comando apropiado al proyecto
npm test / cargo test / pytest / go test ./...
```

**Si las pruebas fallan:** Informa de los fallos, pregunta si continuar o investigar.

**Si las pruebas pasan:** Informa de que está listo.

### Informe

```
Worktree listo en <full-path>
Configuración de Claude copiada (o ninguna encontrada / omitida según el harness)
Pruebas pasando (<N> pruebas, 0 fallos)
Listo para implementar <feature-name>
```

## Paso 5: Limpieza — Eliminar el worktree al terminar

**Ejecuta la limpieza una vez el trabajo esté completo.** "Completo" significa: la rama se ha fusionado, el PR está cerrado, el experimento se descartó, o el usuario ha confirmado explícitamente que ya no necesita el workspace aislado. Nunca elimines un worktree que aún contenga cambios sin commitear, sin subir, o sin fusionar que el usuario pueda querer.

### 5.0 Detectar el modo de limpieza

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
```

- **Si `GIT_DIR == GIT_COMMON`:** Nunca estuviste en un worktree enlazado (el Paso 0 te llevó directamente al Paso 3). No hay nada que limpiar — omite el Paso 5 por completo.
- **Si `GIT_DIR != GIT_COMMON`:** Estás dentro de un worktree enlazado. Continúa con la limpieza.

### 5.1 Verificar que el trabajo está guardado

Antes de eliminar nada, confirma que no hay trabajo que perder:

```bash
git status --porcelain                 # Debe estar vacío (sin cambios sin commitear)
git log @{u}.. 2>/dev/null             # Debe estar vacío (sin commits sin subir)
```

**Si alguno de los comandos devuelve resultado:** Detente. Informa al usuario del trabajo no guardado y pregunta cómo proceder (commit/push, stash, o descarte forzado). Nunca elimines un worktree con trabajo no guardado sin confirmación explícita del usuario.

Captura la ruta del worktree y el nombre de la rama antes de salir del directorio:

```bash
WORKTREE_PATH=$(git rev-parse --show-toplevel)
BRANCH_NAME=$(git branch --show-current)
```

### 5.2 Herramientas nativas de worktree (preferido)

Si usaste una herramienta nativa de worktree en el Paso 1a (`EnterWorktree`, `WorktreeCreate`, `/worktree`, etc.), usa el comando nativo correspondiente para eliminar el worktree (p. ej. `LeaveWorktree`, `WorktreeRemove`, `/worktree remove`). Las herramientas nativas limpian directorios, ramas y estado del harness de forma consistente.

Solo continúa al 5.3 si no hay ninguna herramienta nativa de limpieza disponible.

### 5.3 Alternativa de limpieza con Git Worktree

**Usa esto solo si el Paso 5.2 no aplica** — creaste el worktree manualmente en el Paso 1b.

```bash
# 1. Sal del worktree antes de eliminarlo
cd "$GIT_COMMON/.."   # o cualquier ruta dentro del checkout principal

# 2. Elimina el worktree
git worktree remove "$WORKTREE_PATH"

# 3. Si aún quedan ficheros (p. ej. artefactos ignorados que bloquean la eliminación),
#    confirma con el usuario, y luego fuerza la eliminación
git worktree remove --force "$WORKTREE_PATH"

# 4. Elimina la rama local solo si se creó para este worktree
#    Y ya se ha fusionado o ya no es necesaria
git branch -d "$BRANCH_NAME"            # eliminación segura (rechaza si no está fusionada)
git branch -D "$BRANCH_NAME"            # eliminación forzada (solo con confirmación del usuario)

# 5. Elimina metadatos obsoletos del worktree si el directorio se borró manualmente
git worktree prune
```

**Alternativa por sandbox:** Si la eliminación falla por permisos, informa del fallo y de la ruta que necesita limpieza manual. No reintentes de forma destructiva.

### 5.4 Verificar la limpieza

```bash
git worktree list                      # WORKTREE_PATH ya no debe aparecer
ls -d "$WORKTREE_PATH" 2>/dev/null     # No debe devolver nada
```

### Informe

```
Worktree eliminado: <full-path>
Rama <name> eliminada (o conservada, si aún se necesita)
Checkout principal intacto
```

## Referencia rápida

| Situación | Acción |
|-----------|--------|
| Ya en un worktree enlazado | Omitir la creación (Paso 0) |
| En un submódulo | Tratar como repo normal (guardia del Paso 0) |
| Herramienta nativa de worktree disponible | Usarla (Paso 1a) |
| Sin herramienta nativa | Alternativa con git worktree (Paso 1b) |
| Necesitas una ubicación de worktree | Usar `<repo>/.worktrees/<branch>` |
| Directorio no ignorado | Añadir a .gitignore + commit |
| Error de permisos al crear | Alternativa por sandbox, trabajar en el sitio |
| Las pruebas fallan durante la base | Informar de fallos + preguntar |
| Sin package.json/Cargo.toml | Omitir instalación de dependencias |
| Trabajo completo, en worktree enlazado | Ejecutar limpieza del Paso 5 |
| Nunca se creó un worktree | Omitir el Paso 5 |
| Cambios sin commitear/subir en la limpieza | Detenerse y preguntar al usuario |
| Herramienta nativa de limpieza disponible | Usarla (Paso 5.2) |
| Sin herramienta nativa de limpieza | `git worktree remove` (Paso 5.3) |
| Directorio del worktree borrado manualmente | `git worktree prune` |
| Alternativa git: clonar el comportamiento de Claude en el worktree | Copiar `.claude/settings*.json` desde `SOURCE_ROOT` (Paso 1b) |
| El repo usa symlinks de `.claude` | Copiar solo el JSON no es suficiente—recrear symlinks o rutas |

## Errores comunes

### Luchar contra el harness

- **Problema:** Usar `git worktree add` cuando la plataforma ya proporciona aislamiento
- **Solución:** El Paso 0 detecta el aislamiento existente. El Paso 1a prioriza las herramientas nativas.

### Omitir la detección

- **Problema:** Crear un worktree anidado dentro de uno ya existente
- **Solución:** Ejecutar siempre el Paso 0 antes de crear nada

### Omitir la verificación de ignorados

- **Problema:** El contenido del worktree se acaba versionando, contaminando el git status
- **Solución:** Usar siempre `git check-ignore` antes de crear un worktree local al proyecto

### Asumir la ubicación del directorio

- **Problema:** Crea inconsistencias, viola las convenciones del proyecto
- **Solución:** Usar siempre `<repo>/.worktrees/<branch>` salvo que el usuario lo anule explícitamente para una tarea puntual

### Continuar con pruebas fallando

- **Problema:** No se puede distinguir entre bugs nuevos y problemas preexistentes
- **Solución:** Informar de los fallos, obtener permiso explícito para continuar

### Eliminar un worktree con trabajo sin guardar

- **Problema:** `git worktree remove --force` descarta silenciosamente cambios sin commitear/subir
- **Solución:** Ejecutar siempre `git status --porcelain` y `git log @{u}..` antes de eliminar; detenerse y preguntar si alguno no está vacío

### Eliminar la rama antes de que esté fusionada

- **Problema:** `git branch -D` destruye commits que nunca se fusionaron ni se subieron
- **Solución:** Preferir `git branch -d` (eliminación segura); solo forzar la eliminación tras confirmación explícita del usuario

### Mezclar limpieza nativa y manual

- **Problema:** Ejecutar `git worktree remove` sobre un worktree creado por una herramienta nativa deja estado fantasma en el harness
- **Solución:** Lo que creó el worktree debe eliminarlo (herramienta nativa ↔ herramienta nativa, git ↔ git)

### Copiar la configuración de Claude desde el directorio equivocado

- **Problema:** Usar `git rev-parse --show-toplevel` tras hacer `cd` al nuevo worktree resuelve a la ruta del worktree, así que las copias no encuentran configuración o copian desde el lugar equivocado
- **Solución:** Establecer `SOURCE_ROOT=$(git rev-parse --show-toplevel)` en el checkout principal **antes** de `git worktree add`, y luego usar `$SOURCE_ROOT` en el bucle de copia

## Señales de alarma

**Nunca:**
- Crear un worktree cuando el Paso 0 detecta aislamiento existente
- Usar `git worktree add` cuando dispones de una herramienta nativa de worktree (p. ej. `EnterWorktree`). Este es el error #1 — si la tienes, úsala.
- Omitir el Paso 1a saltando directamente a los comandos git del Paso 1b
- Crear un worktree sin verificar que está ignorado (local al proyecto)
- Omitir la verificación de la base de pruebas
- Continuar con pruebas fallando sin preguntar
- Eliminar un worktree que aún tenga trabajo sin commitear, sin subir, o sin fusionar sin confirmación explícita del usuario
- Forzar la eliminación de una rama (`git branch -D`) sin confirmar que está fusionada o que ya no es necesaria
- Ejecutar `git worktree remove` sobre un worktree creado por una herramienta nativa

**Siempre:**
- Ejecutar primero la detección del Paso 0
- Priorizar las herramientas nativas sobre la alternativa con git
- Usar `<repo>/.worktrees/<branch>` como ubicación estándar
- Verificar que el directorio está ignorado si es local al proyecto
- Autodetectar y ejecutar la configuración del proyecto
- Verificar una base de pruebas limpia
- Ejecutar la limpieza del Paso 5 una vez completado el trabajo, usando el mismo mecanismo que creó el worktree
- Verificar que no hay nada que perder antes de eliminar un worktree (`git status --porcelain`, `git log @{u}..`)
- Confirmar con `git worktree list` y una comprobación del directorio que la limpieza realmente se completó
- Tras el Paso 1b (alternativa con git), copiar `.claude/settings.json` y `.claude/settings.local.json` desde `SOURCE_ROOT` capturado antes de `git worktree add`
