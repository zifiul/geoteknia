---
name: code-auditing
description: Skill de proyecto orientada a tareas de auditoría sistemática de calidad de código, adaptada al stack de Geoteknia (Next.js 15 App Router, React 19, TypeScript estricto, Prisma/PostgreSQL, Zod, Auth.js v5).
version: 1.0.0
author: Geoteknia
---
# Skill de Auditoría de Código

Metodología integral para auditorías sistemáticas de calidad de código.

## Cuándo Usarla

- Auditorías integrales de calidad de código
- Evaluaciones de vulnerabilidades de seguridad
- Identificación de deuda técnica
- Revisiones de código previas a un release
- Verificación de buenas prácticas
- Auditorías de librerías y dependencias

## Fases de la Auditoría

### Fase 0: Preparación Previa al Análisis
1. Comprobar los ficheros de configuración del proyecto (package.json, tsconfig.json, etc.)
2. Identificar el stack tecnológico y las librerías principales
3. Comprobar las configuraciones de linting/formato
4. Ejecutar los comandos de linting/testing existentes como línea base
5. Cargar documentación de las librerías principales identificadas

### Fase 1: Descubrimiento
1. Encontrar todos los ficheros de código por tipo
2. Crear una lista de seguimiento para cada fichero
3. Agrupar ficheros por módulo/funcionalidad para un análisis contextual

### Fase 2: Análisis Fichero a Fichero
Para cada fichero, analizar:
- Código muerto (funciones, variables, imports sin usar)
- Code smells y anti-patrones
- Implementaciones a medida que podrían usar librerías consolidadas
- Vulnerabilidades de seguridad
- Problemas de rendimiento
- Patrones obsoletos o APIs deprecadas
- Manejo de errores ausente
- Funciones excesivamente complejas
- Código duplicado

### Fase 3: Verificación de Buenas Prácticas
Para cada librería y framework:
1. Obtener la documentación oficial
2. Comparar la implementación con los patrones oficiales
3. Identificar desviaciones respecto a las recomendaciones
4. Anotar patrones de uso obsoletos
5. Señalar anti-patrones desaconsejados

### Fase 4: Detección de Patrones
Buscar problemas recurrentes:
- Anti-patrones comunes repetidos en varios ficheros
- Lógica duplicada que podría abstraerse
- Estilos de código inconsistentes
- Patrones de manejo de errores ausentes

### Fase 5: Recomendaciones de Librerías
Para implementaciones a medida:
1. Comprobar si las librerías actuales ya ofrecen la funcionalidad
2. Buscar paquetes maduros del ecosistema
3. Verificar la salud de la librería (commits, issues, actividad)
4. Comprobar la compatibilidad con la configuración del proyecto

### Fase 6: Informe Integral
Generar un informe detallado con:
- Resumen ejecutivo
- Problemas críticos que requieren atención inmediata
- Hallazgos fichero a fichero
- Plan de acción priorizado
- Estimaciones de esfuerzo
- Recomendaciones de librerías

## Niveles de Prioridad de Hallazgos

- **Crítico** - Vulnerabilidades de seguridad, funcionalidad rota
- **Alta Prioridad** - Cuellos de botella de rendimiento, código inmantenible
- **Prioridad Media** - Calidad de código, desviaciones de buenas prácticas
- **Baja Prioridad** - Estilo, mejoras menores
- **Quick Wins** - Menos de 30 minutos de arreglo

## Categorías de Análisis

### Seguridad
- Secretos hardcodeados
- Riesgos de SQL injection
- Vulnerabilidades XSS
- Validación de entrada ausente
- Datos sensibles expuestos
- Fuga de PII hacia prompts de Claude o hacia `ai_generations.input_params`/`rendered_prompt`
- PII en logs o en `dataLayer`/analítica

> Nota: revisar también que el RBAC y el 2FA se apliquen en servidor (no solo ocultando UI) y que las acciones críticas generen audit log, en línea con `docs/technical/backend-standards.md` §8.

### Rendimiento
- Algoritmos ineficientes
- Operaciones bloqueantes
- Fugas de memoria
- Oportunidades de caché ausentes
- Patrones N+1 en consultas

### TypeScript/Seguridad de Tipos
- Anotaciones de tipos ausentes
- Uso del tipo `any`
- Tipos a medida que duplican tipos oficiales
- Paquetes @types ausentes
- Tipos duplicados que ya podrían derivarse de Zod (`z.infer`) o de los modelos Prisma generados

### Problemas de Async/Promesas
- Palabras clave `await` ausentes
- Rechazos de promesas sin gestionar
- Callback hell

### Código Muerto
- Imports y exports sin usar
- Funciones, clases y métodos sin usar
- Variables y tipos sin usar
- Bloques de código inalcanzables
- Ficheros sin usar (no importados en ningún sitio)
- Dependencias sin usar

**Herramientas:**
- JavaScript/TypeScript: `npx knip --reporter json`
- Python: `deadcode . --dry`

**Importante:** Verificar siempre los hallazgos de la herramienta antes de reportarlos. Comprobar:
- Imports dinámicos (`import(variable)`)
- Patrones de framework (componentes React, decoradores)
- Re-exports para API pública
- Puntos de entrada (scripts CLI, handlers serverless)
- En Next.js App Router, comprobar además `page.tsx`, `route.ts`, `layout.tsx`, Server Actions y componentes usados solo vía JSX antes de marcarlos como código muerto

## Recursos

Consulta los documentos de referencia para las metodologías completas:

- `references/audit-methodology.md` - Proceso completo de auditoría en 6 fases con checklists detallados
- `references/dead-code-methodology.md` - Herramientas de detección de código muerto, verificación y flujos de limpieza

## Referencia Rápida

### Antes de Empezar
- [ ] Leer los ficheros de configuración del proyecto
- [ ] Identificar el stack tecnológico y las librerías
- [ ] Ejecutar los linters existentes como línea base
- [ ] Crear la lista de seguimiento de ficheros

### Durante la Auditoría
- [ ] Marcar ficheros como en progreso
- [ ] Analizar cada categoría sistemáticamente
- [ ] Anotar números de línea concretos
- [ ] Documentar ejemplos de antes/después
- [ ] Marcar ficheros como completados

### Después de la Auditoría
- [ ] Categorizar todos los hallazgos por prioridad
- [ ] Generar el informe integral
- [ ] Guardar el informe en la raíz del proyecto
- [ ] Proporcionar un breve resumen en consola
