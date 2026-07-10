---
name: update-docs
description: Identifica y actualiza la documentación técnica necesaria a partir de los cambios implementados.
author: Geoteknia
version: 1.0.0
---
# Skill update-docs

Úsala cuando este flujo sea necesario en el proyecto.

## Instrucciones

Usa `docs/technical/documentation-standards.md` para actualizar la documentación que corresponda según los cambios realizados.

En Geoteknia, revisa en particular la tabla de `documentation-standards.md` §3.1 para decidir qué documento actualizar:

- Cambios en modelos Prisma o base de datos → `docs/technical/data-model.md`.
- Cambios de stack, dependencias o instalación → `docs/technical/base-standards.md`, `backend-standards.md` o `frontend-standards.md` según corresponda.
- Cambios en la API → `docs/technical/api-spec.yml`.
- Nueva convención de código o arquitectura → el `*-standards.md` correspondiente.

Escribe siempre en español, mantén el estilo existente (tablas, cabeceras numeradas, bloques de código con lenguaje) y no dupliques contenido: referencia el documento fuente en vez de copiarlo.
