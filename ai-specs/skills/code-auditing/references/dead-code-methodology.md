# Metodología de Detección de Código Muerto

Este documento ofrece orientación sobre cómo detectar y eliminar código muerto usando herramientas automatizadas y verificación manual.

## Visión General

El código muerto es código que existe en el repositorio pero que nunca se ejecuta. Aumenta la carga de mantenimiento, el tamaño del bundle y la carga cognitiva. Esta metodología usa herramientas especializadas combinadas con verificación por parte del agente para filtrar falsos positivos.

## Tipos de Código Muerto

### 1. Imports Sin Usar
Sentencias de import de módulos/símbolos que nunca se usan:
```typescript
import { unused } from './utils';  // Nunca referenciado
```

### 2. Exports Sin Usar
Funciones, clases o variables exportadas pero nunca importadas en ningún otro sitio:
```typescript
export function formatDate() { ... }  // No se importa en ningún sitio
```

### 3. Variables Sin Usar
Variables declaradas pero nunca leídas:
```typescript
const result = compute();  // Nunca se usa después de la asignación
```

### 4. Funciones/Métodos Sin Usar
Funciones definidas pero nunca invocadas:
```typescript
function legacyHelper() { ... }  // Nunca se invoca
```

### 5. Ficheros Sin Usar
Ficheros enteros no importados en ningún sitio del repositorio.

### 6. Dependencias Sin Usar
Paquetes en package.json que no se usan en el código.

### 7. Código Inalcanzable
Código después de sentencias return/throw o en ramas muertas:
```typescript
function foo() {
  return 42;
  console.log('nunca se ejecuta');  // Inalcanzable
}
```

## Herramientas de Detección

### Knip (JavaScript/TypeScript)

**Instalación:**
```bash
npm install -g knip
# o usar vía npx (sin instalación)
```

**Comandos:**
```bash
# Detección (salida por defecto)
npx knip

# Salida JSON para parsear
npx knip --reporter json

# Corregir automáticamente (usar con precaución)
npx knip --fix

# Workspace específico
npx knip --workspace packages/core

# Patrones de inclusión/exclusión
npx knip --include files --exclude dependencies
```

**Configuración (`knip.json`):**
```json
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "entry": ["src/index.ts"],
  "project": ["src/**/*.ts"],
  "ignore": ["**/*.test.ts"],
  "ignoreDependencies": ["@types/*"]
}
```

**Categorías detectadas:**
- files, dependencies, devDependencies
- exports, nsExports, classMembers
- types, nsTypes, enumMembers
- unlisted, binaries, unresolved, duplicates

> Referencia genérica secundaria (otros stacks, no forman parte del stack de Geoteknia pero pueden ser útiles al auditar scripts o herramientas auxiliares en otro lenguaje):
> **Deadcode (Python)**
> ```bash
> pip install deadcode
> deadcode .
> deadcode . --verbose
> deadcode . --fix
> deadcode . --dry
> deadcode src/
> deadcode . --exclude tests/
> ```
> Capacidades de detección: imports sin usar (DC01), variables sin usar (DC02), funciones sin usar (DC03), clases sin usar (DC04), métodos sin usar (DC05).

## Detección de Falsos Positivos

**CRÍTICO: Verifica siempre los hallazgos antes de reportarlos al usuario.**

### Falsos Positivos Comunes

#### 1. Imports Dinámicos
```typescript
// Estos imports parecen sin usar pero se cargan en tiempo de ejecución
const module = await import(modulePath);
```

#### 2. Magia de Framework
```typescript
// Componentes React usados en JSX
export const Button = () => <button />;  // Usado como <Button />

// Decoradores en TypeScript
@decorator
export class Controller {}
```
En Next.js App Router, esto aplica de forma especialmente frecuente a:
- `page.tsx` y `layout.tsx`, que el framework resuelve por convención de rutas y nunca aparecen como "importados" explícitamente
- `route.ts` (Route Handlers), invocados por el framework según el método HTTP
- Server Actions (`"use server"`), invocadas desde formularios o desde el cliente sin un import directo visible para las herramientas de análisis estático
- Componentes usados solo vía JSX (`<Componente />`), que algunas herramientas pueden no vincular correctamente con su definición

Antes de marcar cualquiera de estos ficheros o exports como código muerto, verifica su rol dentro de la convención de App Router.

#### 3. Re-exports para API Pública
```typescript
// fichero barrel index.ts - los exports SON el propósito
export { Helper } from './helper';  // Re-exportado para uso externo
```

#### 4. Puntos de Entrada
```typescript
// Route Handlers, Server Actions, scripts de seed, etc.
export async function POST(request: Request) { ... }  // Entry point de Route Handler
```

#### 5. Utilidades de Test
```typescript
// Solo usado en ficheros de test
export class TestHelper {}  // Referenciado en *.test.ts
```

#### 6. Referencias Basadas en Strings
```typescript
// Accedido vía strings o reflexión
const fn = functions['dynamicName'];
```

### Checklist de Verificación

Para cada elemento marcado, el agente DEBE:

1. **Leer el código marcado** para entender el contexto
2. **Buscar referencias dinámicas**:
   - `import(` con variables
   - Interpolación de strings con el nombre del elemento
   - Patrones de reflexión
3. **Comprobar patrones de framework**:
   - React: ¿es un componente usado en JSX?
   - Next.js App Router: ¿es `page.tsx`, `route.ts`, `layout.tsx` o una Server Action resuelta por convención?
4. **Comprobar re-exports**:
   - ¿Está en un fichero barrel index.ts/index.js?
   - ¿Forma parte de la API pública?
5. **Comprobar puntos de entrada**:
   - ¿Es un Route Handler, una Server Action o un script de seed/migración?
   - ¿Se referencia en los scripts de package.json o en ficheros de configuración?

## Flujo de Trabajo

### 1. Ejecutar la Herramienta de Detección
```bash
# Usar el script auxiliar
${CLAUDE_PLUGIN_ROOT}/scripts/dead-code-detect.sh --format json
```

### 2. Analizar y Categorizar
Agrupa los hallazgos por tipo:
- Exports sin usar
- Ficheros sin usar
- Dependencias sin usar
- Imports sin usar
- Miembros de clase sin usar

### 3. Verificar Cada Hallazgo
Para cada elemento:
1. Lee el código
2. Comprueba los patrones de falso positivo
3. Márcalo como "verificado" o "probable falso positivo"

### 4. Presentar el Informe Verificado
Muestra al usuario:
- Recuentos resumen (solo elementos verificados)
- Lista detallada con referencias fichero:línea
- Elementos filtrados con sus motivos

### 5. Aplicar Correcciones (Tras Aprobación)
```bash
# Solo tras confirmación del usuario
npx knip --fix
```

## Integración con Auditorías

### Integración en Comprobación Rápida
- Ejecuta la detección como parte de las comprobaciones automatizadas
- Reporta los hallazgos bajo la categoría "Código Muerto"
- No corrijas automáticamente; informa al usuario de los hallazgos

### Integración en Auditoría Profunda
- Ejecútala como Fase 2.5: Detección de Código Muerto
- Inclúyela en el informe integral
- Proporciona los comandos de corrección para que el usuario los ejecute

### Comando Independiente `/dead-code`
- Flujo de trabajo enfocado solo en código muerto
- Limpieza interactiva con aprobación del usuario
- Muestra el proceso de verificación

## Buenas Prácticas

1. **Ejecuta con regularidad** - inclúyelo en el pipeline de CI/CD
2. **Configura correctamente** - establece reglas de ignorado para los patrones de framework, especialmente los propios de Next.js App Router
3. **Testea tras la eliminación** - asegúrate de que nada se rompe (`npm test`, `npm run test:e2e`)
4. **Revisa antes de commitear** - se recomienda verificación manual
5. **Documenta las excepciones** - comenta por qué cierto código "muerto" es intencional
6. **Empieza de forma conservadora** - es mejor pasar por alto algo que romper funcionalidad
