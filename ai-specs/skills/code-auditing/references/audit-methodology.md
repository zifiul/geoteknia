# Metodología de Auditoría de Código

Este documento proporciona un enfoque integral y sistemático para la auditoría de calidad de código. Sigue estas fases para un análisis exhaustivo.

## Fase 0: Preparación Previa al Análisis

Antes de analizar el código, establece el contexto:

### 1. Configuración del Proyecto
- **Ficheros de paquetes**: package.json, tsconfig.json, prisma/schema.prisma, etc.
- **Stack tecnológico**: identificar lenguajes, frameworks y librerías principales
- **Configuraciones de linting**: eslint, prettier, etc.
- **Documentación del proyecto**: `docs/technical/base-standards.md`, `docs/technical/backend-standards.md`, `docs/technical/frontend-standards.md` para las directrices específicas del proyecto

### 2. Comprobaciones de Línea Base
Ejecuta el linting y testing existentes. En Geoteknia, estos son los comandos reales del proyecto (los mismos documentados en `docs/technical/backend-standards.md` §15.1):
```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run lighthouse
npx prisma migrate deploy
```

Documenta los errores/warnings existentes como línea base.

> Referencia genérica secundaria (otros stacks, no aplican directamente a Geoteknia pero pueden servir de referencia si se audita una dependencia externa en otro lenguaje):
> ```bash
> # Python
> black --check .
> flake8
> pytest
>
> # Go
> go vet ./...
> golint ./...
> ```

### 3. Carga de Documentación
Usa Context7 para precargar documentación de las librerías principales identificadas:
```
mcp__context7__resolve-library-id  → Obtener el ID de la librería
mcp__context7__query-docs    → Cargar las buenas prácticas actuales
```

## Fase 1: Descubrimiento

### Identificación de Ficheros
Encuentra todos los ficheros de código por tipo. En Geoteknia, principalmente:
```
*.ts, *.tsx  (TypeScript/React, App Router)
prisma/schema.prisma  (modelo de datos)
```

### Organización
- Agrupa los ficheros por módulo/funcionalidad para un análisis contextual
- Crea una lista de seguimiento para un progreso sistemático
- Prioriza la lógica de negocio principal sobre las utilidades

## Fase 2: Análisis Fichero a Fichero

Para cada fichero, analiza las siguientes categorías:

### Código Muerto
- Funciones y métodos sin usar
- Variables e imports sin usar
- Bloques de código inalcanzables
- Código comentado
- Funcionalidades deprecadas todavía presentes

### Code Smells y Anti-Patrones
- Funciones de más de 50 líneas
- Complejidad ciclomática alta (> 10)
- Condicionales anidados en profundidad (> 3 niveles)
- Números mágicos sin constantes
- Duplicación de código por copiar y pegar
- Objetos/funciones "dios" que hacen demasiado
- Listas de parámetros largas (> 5 parámetros)

### Vulnerabilidades de Seguridad
- Secretos, claves de API y contraseñas hardcodeadas
- Vulnerabilidades de SQL injection
- Riesgos de XSS (Cross-Site Scripting)
- Riesgos de command injection
- Deserialización insegura
- Validación de entrada ausente
- Divulgación de información en errores
- Fuga de PII hacia prompts de Claude o hacia `ai_generations.input_params`/`rendered_prompt`
- PII en logs o en `dataLayer`/analítica, en contra de lo indicado en `docs/technical/backend-standards.md` §8.2

> Nota: comprobar además que RBAC y 2FA se validen en servidor (no solo ocultando UI) y que las acciones críticas (login, cambio de rol, publicación, aprobación, generación IA, exportación) generen audit log, según `docs/technical/backend-standards.md` §8.3.

### Problemas de Rendimiento
- Algoritmos O(n²) o peores en rutas críticas
- Índices de base de datos ausentes
- Patrones N+1 en consultas
- Operaciones síncronas innecesarias
- Caché ausente para operaciones costosas
- Asignaciones de memoria grandes dentro de bucles
- I/O bloqueante en contextos asíncronos

### Problemas de TypeScript/Seguridad de Tipos
- Anotaciones de tipos ausentes
- Uso excesivo del tipo `any`
- Aserciones de tipo evitables
- Tipos a medida que duplican paquetes oficiales `@types/*`
- Tipos duplicados que ya podrían derivarse de Zod (`z.infer`) o de los modelos Prisma generados en lugar de redefinirse manualmente
- Comprobaciones de null/undefined ausentes

### Problemas de Async/Promesas
- Palabras clave `await` ausentes
- Rechazos de promesas sin gestionar
- Callback hell que debería usar async/await
- Promesas "fire-and-forget" sin manejo de errores

### Fugas de Memoria
- Event listeners no eliminados en la limpieza
- Timers (setInterval, setTimeout) no cancelados
- Objetos grandes retenidos innecesariamente
- Closures que mantienen referencias demasiado tiempo
- Referencias al DOM conservadas tras eliminar el elemento

### Manejo de Errores
- Bloques catch vacíos
- Patrones de "capturar e ignorar"
- Try/catch ausente en código async
- Tipos de error inconsistentes
- Mensajes de error genéricos que ocultan la causa raíz

## Fase 3: Verificación de Buenas Prácticas

### Comprobación de Documentación con Context7
Para cada librería principal identificada:

1. **Resolver el ID de la librería**:
   ```
   mcp__context7__resolve-library-id: "react"
   ```

2. **Obtener las buenas prácticas actuales**:
   ```
   mcp__context7__query-docs: {
     "context7CompatibleLibraryID": "/facebook/react",
     "topic": "hooks best practices"
   }
   ```

3. **Áreas de foco**:
   - Guías de migración entre versiones
   - Funcionalidades deprecadas y sus reemplazos
   - Buenas prácticas de rendimiento
   - Consideraciones de seguridad
   - Errores comunes y anti-patrones

### Investigación en GitHub
Usa la CLI `gh` para investigar el uso real:

```bash
# Buscar patrones
gh search code "useEffect cleanup" --language=typescript

# Comprobar la salud del repositorio
gh repo view [library] --json stargazersCount,updatedAt,openIssues

# Buscar avisos de seguridad
gh api /repos/{owner}/{repo}/security-advisories
```

### Comparación de Hallazgos
- Compara la implementación real frente a la documentación oficial
- Identifica desviaciones respecto a los patrones recomendados
- Anota patrones obsoletos que necesiten modernizarse
- Señala anti-patrones explícitamente desaconsejados en la documentación

## Fase 3.5: Verificación de Tipos TypeScript

Para proyectos TypeScript, realiza un análisis de tipos adicional:

### Comprobar Tipos Duplicados
Busca interfaces a medida que reflejen tipos oficiales:
- Tipos de React (React.FC, React.Component, tipos de eventos)
- Tipos de Node.js (Buffer, Process, Global)
- Tipos del DOM (HTMLElement, tipos de Event)
- Tipos de librerías populares (zod, prisma, etc.)
- Tipos que ya podrían inferirse con `z.infer<typeof schema>` a partir de esquemas Zod
- Tipos que ya generan los modelos de Prisma (`Prisma.ProjectGetPayload`, tipos de modelo generados) en lugar de redefinirse a mano

### Verificar Paquetes @types
```bash
# Comprobar si existen tipos oficiales
npm view @types/[library] types

# Verificar versiones instaladas de @types
npm ls @types/*
```

### Problemas Comunes
- Un `IRequest` a medida cuando ya existe un tipo equivalente en el ecosistema
- Tipos de eventos a medida cuando React ya los proporciona
- Duplicar tipos generados por Prisma o inferidos por Zod en lugar de reutilizarlos

## Fase 4: Detección de Patrones

Busca problemas recurrentes en todo el código:

### Patrones Transversales
- El mismo anti-patrón repetido en varios ficheros
- Funciones de utilidad duplicadas
- Enfoques de manejo de errores inconsistentes
- Estilos de código distintos en distintos módulos

### Oportunidades de Abstracción
- Código repetido que podría ser una función de utilidad
- Patrones comunes que podrían ser hooks (React)
- Preocupaciones transversales que necesitan middleware

### Inconsistencias
- Estilos async mixtos (callbacks, promesas, async/await)
- Convenciones de nombres inconsistentes
- Estrategias de manejo de errores distintas
- Patrones de organización de código variables

## Fase 5: Recomendaciones de Librerías

Para implementaciones a medida, busca reemplazos maduros:

### Proceso de Descubrimiento
1. **Comprobar primero las librerías existentes** - usa Context7 para ver si las librerías actuales ya ofrecen la funcionalidad necesaria
2. **Buscar en registros de paquetes** - npm principalmente
3. **Verificar la salud de la librería**:
   - Commits recientes (desarrollo activo)
   - Issues abiertas (capacidad de respuesta)
   - Estadísticas de descargas (adopción de la comunidad)
   - Avisos de seguridad (historial de vulnerabilidades)

### Criterios de Evaluación
- **Mantenimiento**: último commit < 6 meses
- **Adopción**: número significativo de descargas/estrellas
- **Seguridad**: sin vulnerabilidades sin resolver
- **Tamaño del bundle**: importante para código frontend
- **Estabilidad de la API**: versionado semántico, guías de migración
- **Documentación**: ejemplos y documentación de API claros

### Reemplazos Comunes
| Implementación a Medida | Librería Recomendada |
|----------------------|---------------------|
| Manipulación de fechas | date-fns, dayjs |
| Cliente HTTP | fetch nativo, ky |
| Validación de formularios | zod |
| Gestión de estado | zustand, jotai |
| Clonado profundo | structuredClone |
| Generación de UUID | uuid, nanoid |
| Lógica de reintentos | p-retry, async-retry |

## Fase 6: Generación del Informe

### Estructura del Informe

#### Resumen Ejecutivo (2-3 párrafos)
- Total de ficheros analizados
- Visión general de los hallazgos de alto nivel
- Riesgos clave y recomendaciones

#### Problemas Críticos (Acción Inmediata)
Para cada uno:
- Ruta del fichero y número de línea
- Descripción del problema
- Impacto en seguridad/estabilidad
- Ejemplo de corrección
- Estimación de esfuerzo

#### Problemas de Alta Prioridad
- Cuellos de botella de rendimiento
- Problemas de mantenibilidad
- Manejo de errores ausente

#### Problemas de Prioridad Media
- Incumplimientos de buenas prácticas
- Aspectos de calidad de código
- Mejoras de seguridad de tipos

#### Problemas de Baja Prioridad
- Inconsistencias de estilo
- Mejoras menores
- Huecos de documentación

#### Recomendaciones de Librerías
Para cada reemplazo sugerido:
- Ubicación del código a medida actual
- Librería recomendada
- Esfuerzo de migración
- Impacto en el tamaño del bundle

#### Quick Wins
Arreglos de bajo esfuerzo y alto valor:
- < 30 minutos de implementación
- Alto impacto en calidad/seguridad

#### Plan de Acción
Pasos priorizados con:
- Estimaciones de esfuerzo (S/M/L/XL)
- Dependencias entre tareas
- Asignación de sprint sugerida

### Requisitos de Formato del Informe

Cada problema debe incluir:
```markdown
### [PRIORIDAD] Título del Problema
**Ubicación:** `src/auth/login.ts:42`

**Problema:**
Descripción del problema y por qué importa.

**Antes:**
```typescript
// código problemático
```

**Después:**
```typescript
// código corregido
```

**Esfuerzo:** S (< 30 min) | M (1-4 horas) | L (4-8 horas) | XL (> 8 horas)
```

## Referencia de Uso de Herramientas

### Context7
```
# Resolver primero el ID de la librería
mcp__context7__resolve-library-id: "express"

# Después obtener la documentación
mcp__context7__query-docs: {
  "context7CompatibleLibraryID": "/expressjs/express",
  "topic": "middleware"
}
```

### GitHub CLI
```bash
# Salud del repositorio
gh repo view owner/repo --json stargazersCount,updatedAt

# Búsqueda de código
gh search code "pattern" --language=typescript

# Búsqueda de issues
gh search issues "memory leak" --repo=owner/repo
```

### Investigación de Paquetes
Usa `mcp__fetch__fetch` para páginas de registros de paquetes:
- npmjs.com/package/[name]

## Errores Comunes a Evitar

1. **No confíes en suposiciones** - verifica siempre con la documentación
2. **No sugieras patrones obsoletos** - comprueba las buenas prácticas actuales
3. **No recomiendes librerías sin mantenimiento** - verifica su actividad
4. **No ignores las convenciones del proyecto** - respeta las directrices de `docs/technical/base-standards.md`
5. **No rompas funcionalidad** - asegúrate de que las correcciones son seguras
6. **No sobre-diseñes** - considera la relación coste/beneficio
7. **No te saltes las comprobaciones de tipos de TypeScript** - los tipos son documentación
8. **No ignores el tamaño del bundle** - el rendimiento del frontend importa

## Optimización del Rendimiento

Para bases de código grandes:
- **Procesamiento en paralelo**: analiza varios ficheros simultáneamente
- **Operaciones por lotes**: agrupa comprobaciones similares
- **Escaneo selectivo**: prioriza los ficheros modificados
- **Cachea la documentación**: reutiliza las consultas a Context7
- **Reporte progresivo**: proporciona resultados intermedios
