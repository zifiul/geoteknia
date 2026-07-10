---
name: db-state-verify
description: Verificación y restauración del estado de la base de datos (Prisma/PostgreSQL en Neon) tras pruebas con escritura en Geoteknia - línea base, comparación posterior y limpieza documentada. Úsala en la fase QA del harness siempre que las pruebas toquen persistencia.
author: Geoteknia
version: 1.0.0
---

# Skill db-state-verify

Garantiza que ninguna prueba deja la base de datos en un estado distinto al de partida sin que quede documentado y restaurado. Complementa a `qa-mandatory-steps` y aplica el estándar `docs/technical/openspec-tasks-mandatory-steps.md` §7.

## Cuándo es obligatoria

Cuando las pruebas (unit con BD real, `curl`, E2E) tocan:

- `prisma/schema.prisma`, migraciones o seeds.
- Leads, contactos, proyectos, CRM o eventos de conversión.
- Auth.js, sesiones, 2FA, RBAC o audit log.
- Contenido publicable, revisiones, IA o publicación ISR.
- Cualquier endpoint/formulario que cree, actualice o elimine registros.

## Flujo

### 1. Línea base (ANTES de las pruebas)

Para cada tabla impactada, captura con Prisma (script/consulta) o SQL de solo lectura:

- Conteo de filas (`count`).
- IDs y campos clave de los registros que las pruebas podrían tocar.
- Para tablas append-only (audit log, conversion events): el último ID/timestamp — ahí la "restauración" consiste en documentar las filas añadidas por la prueba, no en borrarlas si el estándar las considera evidencia legítima; si son ruido de prueba, se eliminan y se anota.

Registra los comandos exactos: la línea base debe ser reproducible.

### 2. Ejecución de las pruebas

Etiqueta los datos de prueba de forma reconocible cuando sea posible (emails `*@test.geoteknia.local`, prefijos en nombres) para poder identificarlos y limpiarlos sin ambigüedad.

### 3. Validación posterior

- Repite las consultas de la línea base y compara.
- Toda diferencia debe explicarse: creada por la prueba (→ restaurar), esperada por el cambio (→ documentar y aceptar) o inesperada (→ investigar antes de continuar; puede ser un bug).

### 4. Restauración

En este orden de preferencia:

1. Eliminar los registros de prueba identificados (respetando FKs: hijos antes que padres).
2. Revertir updates a los valores originales capturados en la línea base.
3. Recrear registros eliminados por pruebas de DELETE.
4. Si se usó una base efímera o branch de Neon para el cambio, documenta la base usada y el mecanismo de aislamiento (no hace falta restaurar, pero sí dejar constancia).

Nunca uses `TRUNCATE`, resets globales ni re-seed completo sobre una base compartida para "limpiar": restauración quirúrgica y documentada.

### 5. Evidencia

La sección "Verificación de base de datos" del informe del paso correspondiente (`qa-mandatory-steps`) incluye: línea base, validación posterior, `Estado restaurado: Sí/No` y acciones de restauración.

## Señales de alerta

- Comparar "a ojo" sin línea base capturada.
- Diferencias posteriores sin explicación aceptada.
- Datos de prueba sin etiqueta reconocible mezclados con datos reales.
- Restaurar con operaciones masivas que afectan a datos ajenos a la prueba.
