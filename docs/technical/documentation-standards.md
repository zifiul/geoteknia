# Estándares de Documentación — Geoteknia

> Referencia de normas para documentación técnica y especificaciones de IA en el proyecto. Aplica a toda la documentación que describe la estructura, funcionamiento y operación del sistema.

---

## 1. Introducción

La **documentación técnica** abarca todos los documentos relativos al proyecto: modelo de datos, README, especificaciones de API, estándares de desarrollo y cualquier documento Markdown que describa cómo está estructurado, desplegado y operado el sistema.

Las **especificaciones de IA** son los documentos que instruyen a los agentes de IA sobre cómo comportarse, documentar, planificar y escribir código. Incluyen acuerdos de equipo, estándares y convenciones.

---

## 2. Reglas generales

- **Escribir siempre en español**, tanto en documentación nueva como al actualizar la existente. Esto aplica a los archivos de `docs/`, los comentarios en el código fuente, las descripciones de campos en `schema.prisma`, los mensajes de commit y cualquier explicación dentro del código.
- Mantener consistencia de estilo con los documentos existentes (tablas, cabeceras numeradas, bloques de código con etiqueta de lenguaje).
- No duplicar información entre documentos: si un dato ya existe en `data-model.md`, `arquitectura-stack-web-b2b-geoteknia.md` o en los tickets de `/tickets`, referenciar en lugar de copiar.

---

## 3. Documentación técnica

### 3.1 Cuándo actualizar

Antes de cualquier commit, `git push` o cuando se pida documentar un cambio, revisar qué documentación debe actualizarse. Casos habituales en este proyecto:

| Tipo de cambio | Documento a actualizar |
|---|---|
| Cambio en modelos Prisma o BD | `docs/technical/data-model.md` |
| Cambio en el stack, dependencias o proceso de instalación | `docs/technical/base-standards.md`, `docs/technical/backend-standards.md` o `docs/technical/frontend-standards.md` según corresponda |
| Cambio en la API | `docs/texhnical/api-spec.yml` |
| Para cambios en bibliotecas, migraciones de base de datos o cualquier aspecto que modifique el proceso de instalación | `docs/technical/*-standards.md` |

### 3.2 Proceso de actualización

Al actualizar documentación:

1. Revisar todos los cambios recientes en el código base.
2. Identificar qué archivos de documentación se ven afectados según la tabla anterior.
3. Actualizar cada archivo afectado en español, manteniendo coherencia con el estilo existente.
4. Asegurarse de que el formato es correcto: tablas alineadas, cabeceras numeradas, ejemplos de código con etiqueta de lenguaje.
5. Verificar que todos los cambios quedan reflejados con precisión.
6. Informar al usuario qué archivos se actualizaron y qué se modificó en cada uno.

### 3.3 Archivos de referencia del proyecto

| Archivo | Propósito |
|---|---|
| `docs/technical/data-model.md` | Modelo relacional completo: entidades, bloques reutilizables, enums, índices |
| `docs/technical/base-standards.md` | Estándares transversales del proyecto |
| `docs/technical/backend-standards.md` | Convenciones de Route Handlers, Server Actions, Prisma y Auth.js |
| `docs/technical/frontend-standards.md` | Convenciones de Next.js App Router, componentes, SEO y JSON-LD |
| `docs/technical/api-spec.yml` | Especificaciones de la API |
| `openspec/config.yaml` | Configuración del flujo OpenSpec de tickets y cambios |

---

## 4. Especificaciones de IA (AI Specs)

Este apartado establece el proceso obligatorio para que la IA:

- Aprenda del feedback, orientaciones y sugerencias del usuario durante las interacciones.
- Identifique proactivamente oportunidades de mejora en las reglas de desarrollo existentes a partir de esos aprendizajes.
- Mantenga la asistencia alineada con las necesidades cambiantes del proyecto y las expectativas del usuario.
- Incorpore el feedback del usuario en su marco operativo para maximizar su valor.

Este proceso aplica tras cualquier interacción en la que el usuario aporte feedback explícito o implícito, sugerencias, correcciones, información nueva o exprese preferencias. **La IA debe analizar activamente todas las interacciones en busca de oportunidades de aprendizaje, sin esperar a recibir feedback directo, para refinar de forma proactiva su comprensión y las buenas prácticas del proyecto.**

### 4.1 Errores comunes que la IA debe evitar

- **Saltarse el proceso de aprobación:** aplicar modificaciones a las reglas sin obtener primero la revisión y aprobación explícita del usuario.
- **Propuestas sin anclaje:** proponer cambios de reglas sin conectarlos claramente con el feedback específico o los aprendizajes obtenidos en la interacción.
- **Modificaciones imprecisas:** sugerir cambios sin identificar exactamente qué regla o sección concreta debe modificarse.
- **Feedback ignorado:** no iniciar el proceso de aprendizaje y revisión cuando el usuario aporta feedback relevante para mejorar las reglas.
- **Scope creep:** actualizar múltiples reglas no relacionadas a la vez o hacer cambios que excedan el alcance del feedback recibido.
- **Cambios no reactivos:** modificar reglas de forma proactiva sin conexión directa con feedback del usuario o una oportunidad de aprendizaje identificada. Las actualizaciones de reglas deben ser reactivas y estar dirigidas por el feedback.
- **Falta de confirmación:** no notificar al usuario tras implementar una modificación de una regla con su aprobación previa.
