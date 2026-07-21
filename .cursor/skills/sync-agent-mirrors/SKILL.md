---
name: sync-agent-mirrors
description: Analiza y sincroniza la exposición de skills entre agentes tras cambios en ai-specs/skills (altas, bajas, renombrados). Úsala cuando se añadan/eliminen skills en ai-specs y haya que mantener alineados .claude/skills y .cursor/skills.
author: Geoteknia
version: 1.0.0
---

# Skill sync-agent-mirrors

Mantiene sincronizadas las estructuras de skills expuestas a cada agente con `ai-specs/skills` como fuente canónica.

Úsala después de cualquier cambio en `ai-specs/skills` (skill nueva, eliminada, renombrada o movida), para evitar que `.claude/skills` y `.cursor/skills` queden desalineados.

## Diferencia con la skill original de Specboot

La skill equivalente de `lidr-specboot` (`sync-agent-symlinks`) asume que `.claude/skills` y `.cursor/skills` son **symlinks** hacia `ai-specs/skills`. **En Geoteknia esto no es así**: los directorios de `.claude/skills/*` y `.cursor/skills/*` son **copias reales**, no symlinks (confirmado en el repositorio: `openspec-apply-change`, `openspec-archive-change`, `openspec-explore`, `openspec-propose` y `openspec-sync-specs` existen como carpetas normales en ambas rutas).

Esta skill adapta el mecanismo a **copia de directorios**, siguiendo la regla ya documentada en `docs/technical/base-standards.md` §8 ("Portabilidad multiagente y artefactos duplicados"):

> "Para skills y comandos, mantener sincronizadas las rutas equivalentes de `.claude` y `.cursor` mientras no exista una carpeta canónica común."

## Alcance y reglas de seguridad

- La fuente canónica es `ai-specs/skills` (y, para agentes, `ai-specs/agents`).
- Los destinos espejo son:
  - `.claude/skills`
  - `.cursor/skills`
- Gestiona solo las skills que ya existen como copia de una skill canónica de `ai-specs/skills` (por nombre de carpeta y por un marcador de origen, ver más abajo).
- No elimines directorios en los destinos espejo que no tengan un origen canónico claro en `ai-specs/skills`, salvo petición explícita del usuario.
- Nunca sobrescribas silenciosamente una skill de destino cuyo contenido diverge del canónico sin avisar; repórtalo como conflicto.

### Marcador de origen

Como los destinos son copias reales (no symlinks), no hay forma automática de distinguir "copia sincronizada desde `ai-specs`" de "skill propia de ese agente". Usa esta heurística:

1. Si el nombre de carpeta coincide exactamente con una skill de `ai-specs/skills/<skill-name>`, trátala como candidata a mirror.
2. Compara el contenido de `SKILL.md` (y ficheros auxiliares) byte a byte o por hash simple contra el canónico.
3. Si coincide → `sincronizada`. Si diverge → `conflicto` (alguien editó la copia directamente en `.claude` o `.cursor` sin pasar por `ai-specs`; repórtalo, no lo sobrescribas sin confirmación).
4. Si existe en un destino pero no en `ai-specs/skills` → `huérfana` (candidata a eliminar, tras confirmación).
5. Si existe en `ai-specs/skills` pero falta en un destino → `pendiente de copiar`.

## Flujo de trabajo

### Paso 1 - Construir inventarios

Recopila tres inventarios:

1. Skills canónicas: `ai-specs/skills/*/SKILL.md` (y ficheros auxiliares de cada carpeta).
2. Entradas en `.claude/skills`.
3. Entradas en `.cursor/skills`.

De las entradas espejo, clasifica cada una según la heurística anterior: `sincronizada`, `conflicto`, `huérfana`, `pendiente de copiar` o `externa` (no relacionada con ninguna skill canónica, no tocar).

### Paso 2 - Calcular el plan de sincronización

Para cada destino:

- `a_copiar`: skills canónicas ausentes en el destino, o marcadas `pendiente de copiar`.
- `a_actualizar`: skills marcadas `sincronizada` cuyo contenido canónico cambió desde la última copia (detectar por diff de contenido).
- `a_revisar`: entradas `conflicto` (reportar, no tocar automáticamente).
- `a_eliminar`: entradas `huérfana` (proponer eliminación, pedir confirmación antes de borrar).
- `a_omitir`: entradas `externa`.

### Paso 3 - Aplicar la sincronización de forma segura

Aplica los cambios en este orden:

1. Copiar skills nuevas (`a_copiar`): duplica la carpeta completa de `ai-specs/skills/<skill-name>` a `.claude/skills/<skill-name>` y `.cursor/skills/<skill-name>`.
2. Actualizar skills desincronizadas (`a_actualizar`): sobrescribe el contenido de la copia con el canónico.
3. Eliminar huérfanas (`a_eliminar`) solo tras confirmación explícita del usuario.

Nunca elimines automáticamente:
- Directorios marcados como `externa`.
- Directorios marcados como `conflicto` sin confirmación.

### Paso 4 - Verificar integridad

Después de los cambios:

- Confirma que cada skill canónica existe en ambos destinos con contenido idéntico, o queda listada explícitamente como conflicto.
- Confirma que no quedan copias `pendiente de copiar` sin resolver.
- Confirma que las entradas `externa` quedan intactas.

### Paso 5 - Informar resultados

Devuelve un informe conciso de sincronización:

- Número de skills canónicas.
- Por cada destino (`.claude/skills`, `.cursor/skills`):
  - copiadas
  - actualizadas
  - eliminadas
  - conflictos
  - entradas externas omitidas
- Bloqueos restantes (si los hay).

## Escenarios de alta/baja

### Escenario A - Skill nueva en ai-specs

Comportamiento esperado:
- Copiar la carpeta completa a `.claude/skills`.
- Copiar la carpeta completa a `.cursor/skills`.
- Verificar que ambas copias coinciden con el canónico.

### Escenario B - Skill eliminada de ai-specs

Comportamiento esperado:
- Marcar la copia correspondiente en `.claude/skills` y `.cursor/skills` como huérfana.
- Proponer su eliminación al usuario; eliminar solo tras confirmación.
- Dejar intactos los directorios no canónicos.

### Escenario C - Skill renombrada en ai-specs

Comportamiento esperado:
- Tratar como baja del nombre antiguo (Escenario B) más alta del nombre nuevo (Escenario A).
- Señalar explícitamente el renombrado en el informe para evitar que se interprete como una skill nueva sin relación.

## Comandos de referencia

Usa comandos equivalentes según tu entorno:

```bash
# listar skills canónicas
ls ai-specs/skills

# inspeccionar destinos espejo
ls .claude/skills
ls .cursor/skills

# copiar una skill nueva a ambos destinos
cp -r ai-specs/skills/<skill-name> .claude/skills/<skill-name>
cp -r ai-specs/skills/<skill-name> .cursor/skills/<skill-name>

# eliminar una copia huérfana (solo tras confirmación)
rm -rf .claude/skills/<skill-name>
rm -rf .cursor/skills/<skill-name>
```

## Señales de alerta

Nunca:
- Trates `ai-specs` como no canónico.
- Elimines automáticamente directorios reales en los destinos sin confirmación.
- Dejes una skill canónica sin copiar en algún destino tras finalizar la sincronización.
- Omitas en silencio un conflicto sin reportarlo.

Siempre:
- Analiza antes de cambiar.
- Aplica los cambios mínimos seguros.
- Conserva las entradas no canónicas (`externa`).
- Da un informe final de sincronización con los bloqueos pendientes.
