> Traducción al español de la guía oficial de Anthropic sobre autoría de Agent Skills (docs.claude.com). En caso de duda, la fuente oficial en inglés prevalece.

# Buenas prácticas para la autoría de Skills

> Aprende a escribir Skills efectivas que Claude pueda descubrir y usar con éxito.

Las buenas Skills son concisas, están bien estructuradas y se prueban con uso real. Esta guía ofrece decisiones prácticas de autoría para ayudarte a escribir Skills que Claude pueda descubrir y usar de forma efectiva.

Para el trasfondo conceptual de cómo funcionan las Skills, consulta [Visión general de Skills](/en/docs/agents-and-tools/agent-skills/overview).

## Principios fundamentales

### Lo conciso es clave

La [ventana de contexto](https://platform.claude.com/docs/en/build-with-claude/context-windows) es un bien público. Tu Skill comparte la ventana de contexto con todo lo demás que Claude necesita saber, incluyendo:

* El system prompt
* El historial de la conversación
* Los metadatos de otras Skills
* Tu solicitud real

No todos los tokens de tu Skill tienen un coste inmediato. Al arrancar, solo se precargan los metadatos (nombre y descripción) de todas las Skills. Claude lee SKILL.md solo cuando la Skill se vuelve relevante, y lee ficheros adicionales solo cuando se necesitan. Sin embargo, ser conciso en SKILL.md sigue importando: una vez que Claude lo carga, cada token compite con el historial de la conversación y el resto del contexto.

**Suposición por defecto**: Claude ya es muy inteligente

Añade solo el contexto que Claude no tiene ya. Cuestiona cada fragmento de información:

* "¿Realmente necesita Claude esta explicación?"
* "¿Puedo asumir que Claude ya sabe esto?"
* "¿Justifica este párrafo su coste en tokens?"

**Buen ejemplo: Conciso** (aproximadamente 50 tokens):

````markdown  theme={null}
## Extract PDF text

Use pdfplumber for text extraction:

```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
````

**Mal ejemplo: Demasiado verboso** (aproximadamente 150 tokens):

```markdown  theme={null}
## Extract PDF text

PDF (Portable Document Format) files are a common file format that contains
text, images, and other content. To extract text from a PDF, you'll need to
use a library. There are many libraries available for PDF processing, but we
recommend pdfplumber because it's easy to use and handles most cases well.
First, you'll need to install it using pip. Then you can use the code below...
```

La versión concisa asume que Claude sabe qué es un PDF y cómo funcionan las librerías.

### Establece el grado de libertad apropiado

Ajusta el nivel de especificidad a la fragilidad y variabilidad de la tarea.

**Libertad alta** (instrucciones basadas en texto):

Úsala cuando:

* Sean válidos múltiples enfoques
* Las decisiones dependan del contexto
* Las heurísticas guíen el enfoque

Ejemplo:

```markdown  theme={null}
## Code review process

1. Analyze the code structure and organization
2. Check for potential bugs or edge cases
3. Suggest improvements for readability and maintainability
4. Verify adherence to project conventions
```

**Libertad media** (pseudocódigo o scripts con parámetros):

Úsala cuando:

* Exista un patrón preferido
* Se acepte cierta variación
* La configuración afecte al comportamiento

Ejemplo:

````markdown  theme={null}
## Generate report

Use this template and customize as needed:

```python
def generate_report(data, format="markdown", include_charts=True):
    # Process data
    # Generate output in specified format
    # Optionally include visualizations
```
````

**Libertad baja** (scripts específicos, con pocos parámetros o ninguno):

Úsala cuando:

* Las operaciones sean frágiles y propensas a errores
* La consistencia sea crítica
* Deba seguirse una secuencia específica

Ejemplo:

````markdown  theme={null}
## Database migration

Run exactly this script:

```bash
python scripts/migrate.py --verify --backup
```

Do not modify the command or add additional flags.
````

**Analogía**: Piensa en Claude como un robot explorando un camino:

* **Puente estrecho con precipicios a ambos lados**: Solo hay una forma segura de avanzar. Proporciona barreras específicas e instrucciones exactas (libertad baja). Ejemplo: migraciones de bases de datos que deben ejecutarse en una secuencia exacta.
* **Campo abierto sin peligros**: Muchos caminos llevan al éxito. Da una dirección general y confía en que Claude encuentre la mejor ruta (libertad alta). Ejemplo: revisiones de código donde el contexto determina el mejor enfoque.

### Prueba con todos los modelos que planeas usar

Las Skills actúan como añadidos a los modelos, así que su efectividad depende del modelo subyacente. Prueba tu Skill con todos los modelos con los que planeas usarla.

**Consideraciones de prueba por modelo**:

* **Claude Haiku** (rápido, económico): ¿Proporciona la Skill suficiente orientación?
* **Claude Sonnet** (equilibrado): ¿Es la Skill clara y eficiente?
* **Claude Opus** (razonamiento potente): ¿Evita la Skill sobreexplicar?

Lo que funciona perfectamente para Opus podría necesitar más detalle para Haiku. Si planeas usar tu Skill en varios modelos, apunta a instrucciones que funcionen bien con todos ellos.

## Estructura de la Skill

<Note>
  **Frontmatter YAML**: El frontmatter de SKILL.md requiere dos campos:

  * `name` - Nombre legible por humanos de la Skill (máximo 64 caracteres)
  * `description` - Descripción de una línea de qué hace la Skill y cuándo usarla (máximo 1024 caracteres)

  Para los detalles completos de la estructura de una Skill, consulta [Visión general de Skills](/en/docs/agents-and-tools/agent-skills/overview#skill-structure).
</Note>

### Convenciones de nomenclatura

Usa patrones de nomenclatura consistentes para que las Skills sean más fáciles de referenciar y discutir. Recomendamos usar la **forma gerundio** (verbo + -ing) para los nombres de Skill, ya que describe con claridad la actividad o capacidad que ofrece la Skill.

**Buenos ejemplos de nomenclatura (forma gerundio)**:

* "Processing PDFs"
* "Analyzing spreadsheets"
* "Managing databases"
* "Testing code"
* "Writing documentation"

**Alternativas aceptables**:

* Frases nominales: "PDF Processing", "Spreadsheet Analysis"
* Orientadas a la acción: "Process PDFs", "Analyze Spreadsheets"

**Evita**:

* Nombres vagos: "Helper", "Utils", "Tools"
* Demasiado genéricos: "Documents", "Data", "Files"
* Patrones inconsistentes dentro de tu colección de skills

Una nomenclatura consistente facilita:

* Referenciar Skills en documentación y conversaciones
* Entender de un vistazo qué hace una Skill
* Organizar y buscar entre múltiples Skills
* Mantener una biblioteca de skills profesional y cohesionada

### Escribir descripciones efectivas

El campo `description` habilita el descubrimiento de la Skill y debe incluir tanto qué hace la Skill como cuándo usarla.

<Warning>
  **Escribe siempre en tercera persona**. La descripción se inyecta en el system prompt, y un punto de vista inconsistente puede causar problemas de descubrimiento.

  * **Bien:** "Processes Excel files and generates reports"
  * **Evitar:** "I can help you process Excel files"
  * **Evitar:** "You can use this to process Excel files"
</Warning>

**Sé específico e incluye términos clave**. Incluye tanto qué hace la Skill como los disparadores/contextos específicos para cuándo usarla.

Cada Skill tiene exactamente un campo description. La descripción es crítica para la selección de skills: Claude la usa para elegir la Skill adecuada entre potencialmente 100+ Skills disponibles. Tu descripción debe aportar suficiente detalle para que Claude sepa cuándo seleccionar esta Skill, mientras que el resto de SKILL.md proporciona los detalles de implementación.

Ejemplos efectivos:

**Skill de Procesamiento de PDF:**

```yaml  theme={null}
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

**Skill de Análisis de Excel:**

```yaml  theme={null}
description: Analyze Excel spreadsheets, create pivot tables, generate charts. Use when analyzing Excel files, spreadsheets, tabular data, or .xlsx files.
```

**Skill de Ayudante de Commits de Git:**

```yaml  theme={null}
description: Generate descriptive commit messages by analyzing git diffs. Use when the user asks for help writing commit messages or reviewing staged changes.
```

Evita descripciones vagas como estas:

```yaml  theme={null}
description: Helps with documents
```

```yaml  theme={null}
description: Processes data
```

```yaml  theme={null}
description: Does stuff with files
```

### Patrones de divulgación progresiva

SKILL.md funciona como una visión general que dirige a Claude hacia material detallado según se necesite, como una tabla de contenidos en una guía de incorporación. Para una explicación de cómo funciona la divulgación progresiva, consulta [Cómo funcionan las Skills](/en/docs/agents-and-tools/agent-skills/overview#how-skills-work) en la visión general.

**Guía práctica:**

* Mantén el cuerpo de SKILL.md por debajo de 500 líneas para un rendimiento óptimo
* Divide el contenido en ficheros separados cuando te acerques a este límite
* Usa los patrones de abajo para organizar instrucciones, código y recursos de forma efectiva

#### Visión general visual: De simple a complejo

Una Skill básica empieza con solo un fichero SKILL.md que contiene metadatos e instrucciones:

<img src="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=87782ff239b297d9a9e8e1b72ed72db9" alt="Fichero SKILL.md simple mostrando el frontmatter YAML y el cuerpo en markdown" data-og-width="2048" width="2048" data-og-height="1153" height="1153" data-path="images/agent-skills-simple-file.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=280&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=c61cc33b6f5855809907f7fda94cd80e 280w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=560&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=90d2c0c1c76b36e8d485f49e0810dbfd 560w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=840&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=ad17d231ac7b0bea7e5b4d58fb4aeabb 840w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=1100&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=f5d0a7a3c668435bb0aee9a3a8f8c329 1100w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=1650&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=0e927c1af9de5799cfe557d12249f6e6 1650w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=2500&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=46bbb1a51dd4c8202a470ac8c80a893d 2500w" />

A medida que tu Skill crece, puedes empaquetar contenido adicional que Claude carga solo cuando lo necesita:

<img src="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=a5e0aa41e3d53985a7e3e43668a33ea3" alt="Empaquetado de ficheros de referencia adicionales como reference.md y forms.md." data-og-width="2048" width="2048" data-og-height="1327" height="1327" data-path="images/agent-skills-bundling-content.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=280&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=f8a0e73783e99b4a643d79eac86b70a2 280w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=560&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=dc510a2a9d3f14359416b706f067904a 560w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=840&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=82cd6286c966303f7dd914c28170e385 840w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=1100&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=56f3be36c77e4fe4b523df209a6824c6 1100w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=1650&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=d22b5161b2075656417d56f41a74f3dd 1650w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=2500&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=3dd4bdd6850ffcc96c6c45fcb0acd6eb 2500w" />

La estructura completa del directorio de una Skill podría verse así:

```
pdf/
├── SKILL.md              # Main instructions (loaded when triggered)
├── FORMS.md              # Form-filling guide (loaded as needed)
├── reference.md          # API reference (loaded as needed)
├── examples.md           # Usage examples (loaded as needed)
└── scripts/
    ├── analyze_form.py   # Utility script (executed, not loaded)
    ├── fill_form.py      # Form filling script
    └── validate.py       # Validation script
```

#### Patrón 1: Guía de alto nivel con referencias

````markdown  theme={null}
---
name: PDF Processing
description: Extracts text and tables from PDF files, fills forms, and merges documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
---

# PDF Processing

## Quick start

Extract text with pdfplumber:
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

## Advanced features

**Form filling**: See [FORMS.md](FORMS.md) for complete guide
**API reference**: See [REFERENCE.md](REFERENCE.md) for all methods
**Examples**: See [EXAMPLES.md](EXAMPLES.md) for common patterns
````

Claude carga FORMS.md, REFERENCE.md o EXAMPLES.md solo cuando se necesitan.

#### Patrón 2: Organización específica de dominio

Para Skills con múltiples dominios, organiza el contenido por dominio para evitar cargar contexto irrelevante. Cuando un usuario pregunta sobre métricas de ventas, Claude solo necesita leer los esquemas relacionados con ventas, no los de finanzas o marketing. Esto mantiene bajo el uso de tokens y el contexto enfocado.

```
bigquery-skill/
├── SKILL.md (overview and navigation)
└── reference/
    ├── finance.md (revenue, billing metrics)
    ├── sales.md (opportunities, pipeline)
    ├── product.md (API usage, features)
    └── marketing.md (campaigns, attribution)
```

````markdown SKILL.md theme={null}
# BigQuery Data Analysis

## Available datasets

**Finance**: Revenue, ARR, billing → See [reference/finance.md](reference/finance.md)
**Sales**: Opportunities, pipeline, accounts → See [reference/sales.md](reference/sales.md)
**Product**: API usage, features, adoption → See [reference/product.md](reference/product.md)
**Marketing**: Campaigns, attribution, email → See [reference/marketing.md](reference/marketing.md)

## Quick search

Find specific metrics using grep:

```bash
grep -i "revenue" reference/finance.md
grep -i "pipeline" reference/sales.md
grep -i "api usage" reference/product.md
```
````

#### Patrón 3: Detalles condicionales

Muestra el contenido básico, enlaza al contenido avanzado:

```markdown  theme={null}
# DOCX Processing

## Creating documents

Use docx-js for new documents. See [DOCX-JS.md](DOCX-JS.md).

## Editing documents

For simple edits, modify the XML directly.

**For tracked changes**: See [REDLINING.md](REDLINING.md)
**For OOXML details**: See [OOXML.md](OOXML.md)
```

Claude lee REDLINING.md u OOXML.md solo cuando el usuario necesita esas funciones.

### Evita referencias anidadas en profundidad

Claude puede leer parcialmente los ficheros cuando se referencian desde otros ficheros ya referenciados. Al encontrarse con referencias anidadas, Claude podría usar comandos como `head -100` para previsualizar el contenido en lugar de leer los ficheros completos, lo que resulta en información incompleta.

**Mantén las referencias a un solo nivel de profundidad desde SKILL.md**. Todos los ficheros de referencia deben enlazarse directamente desde SKILL.md para asegurar que Claude lea los ficheros completos cuando se necesiten.

**Mal ejemplo: Demasiado profundo**:

```markdown  theme={null}
# SKILL.md
See [advanced.md](advanced.md)...

# advanced.md
See [details.md](details.md)...

# details.md
Here's the actual information...
```

**Buen ejemplo: Un solo nivel de profundidad**:

```markdown  theme={null}
# SKILL.md

**Basic usage**: [instructions in SKILL.md]
**Advanced features**: See [advanced.md](advanced.md)
**API reference**: See [reference.md](reference.md)
**Examples**: See [examples.md](examples.md)
```

### Estructura los ficheros de referencia largos con una tabla de contenidos

Para ficheros de referencia de más de 100 líneas, incluye una tabla de contenidos al principio. Esto asegura que Claude pueda ver el alcance completo de la información disponible incluso al previsualizar con lecturas parciales.

**Ejemplo**:

```markdown  theme={null}
# API Reference

## Contents
- Authentication and setup
- Core methods (create, read, update, delete)
- Advanced features (batch operations, webhooks)
- Error handling patterns
- Code examples

## Authentication and setup
...

## Core methods
...
```

Claude puede entonces leer el fichero completo o saltar a secciones específicas según se necesite.

Para más detalles sobre cómo esta arquitectura basada en sistema de ficheros habilita la divulgación progresiva, consulta la sección [Entorno de ejecución](#runtime-environment) en la sección Avanzada más abajo.

## Flujos de trabajo y bucles de retroalimentación

### Usa flujos de trabajo para tareas complejas

Divide las operaciones complejas en pasos claros y secuenciales. Para flujos de trabajo particularmente complejos, proporciona una checklist que Claude pueda copiar en su respuesta e ir marcando a medida que progresa.

**Ejemplo 1: Flujo de trabajo de síntesis de investigación** (para Skills sin código):

````markdown  theme={null}
## Research synthesis workflow

Copy this checklist and track your progress:

```
Research Progress:
- [ ] Step 1: Read all source documents
- [ ] Step 2: Identify key themes
- [ ] Step 3: Cross-reference claims
- [ ] Step 4: Create structured summary
- [ ] Step 5: Verify citations
```

**Step 1: Read all source documents**

Review each document in the `sources/` directory. Note the main arguments and supporting evidence.

**Step 2: Identify key themes**

Look for patterns across sources. What themes appear repeatedly? Where do sources agree or disagree?

**Step 3: Cross-reference claims**

For each major claim, verify it appears in the source material. Note which source supports each point.

**Step 4: Create structured summary**

Organize findings by theme. Include:
- Main claim
- Supporting evidence from sources
- Conflicting viewpoints (if any)

**Step 5: Verify citations**

Check that every claim references the correct source document. If citations are incomplete, return to Step 3.
````

Este ejemplo muestra cómo se aplican los flujos de trabajo a tareas de análisis que no requieren código. El patrón de checklist funciona para cualquier proceso complejo de varios pasos.

**Ejemplo 2: Flujo de trabajo de relleno de formularios PDF** (para Skills con código):

````markdown  theme={null}
## PDF form filling workflow

Copy this checklist and check off items as you complete them:

```
Task Progress:
- [ ] Step 1: Analyze the form (run analyze_form.py)
- [ ] Step 2: Create field mapping (edit fields.json)
- [ ] Step 3: Validate mapping (run validate_fields.py)
- [ ] Step 4: Fill the form (run fill_form.py)
- [ ] Step 5: Verify output (run verify_output.py)
```

**Step 1: Analyze the form**

Run: `python scripts/analyze_form.py input.pdf`

This extracts form fields and their locations, saving to `fields.json`.

**Step 2: Create field mapping**

Edit `fields.json` to add values for each field.

**Step 3: Validate mapping**

Run: `python scripts/validate_fields.py fields.json`

Fix any validation errors before continuing.

**Step 4: Fill the form**

Run: `python scripts/fill_form.py input.pdf fields.json output.pdf`

**Step 5: Verify output**

Run: `python scripts/verify_output.py output.pdf`

If verification fails, return to Step 2.
````

Unos pasos claros evitan que Claude se salte validaciones críticas. La checklist ayuda tanto a Claude como a ti a hacer seguimiento del progreso a través de flujos de trabajo de varios pasos.

### Implementa bucles de retroalimentación

**Patrón común**: Ejecutar validador → corregir errores → repetir

Este patrón mejora enormemente la calidad del resultado.

**Ejemplo 1: Cumplimiento de la guía de estilo** (para Skills sin código):

```markdown  theme={null}
## Content review process

1. Draft your content following the guidelines in STYLE_GUIDE.md
2. Review against the checklist:
   - Check terminology consistency
   - Verify examples follow the standard format
   - Confirm all required sections are present
3. If issues found:
   - Note each issue with specific section reference
   - Revise the content
   - Review the checklist again
4. Only proceed when all requirements are met
5. Finalize and save the document
```

Esto muestra el patrón del bucle de validación usando documentos de referencia en lugar de scripts. El "validador" es STYLE\_GUIDE.md, y Claude realiza la comprobación leyendo y comparando.

**Ejemplo 2: Proceso de edición de documentos** (para Skills con código):

```markdown  theme={null}
## Document editing process

1. Make your edits to `word/document.xml`
2. **Validate immediately**: `python ooxml/scripts/validate.py unpacked_dir/`
3. If validation fails:
   - Review the error message carefully
   - Fix the issues in the XML
   - Run validation again
4. **Only proceed when validation passes**
5. Rebuild: `python ooxml/scripts/pack.py unpacked_dir/ output.docx`
6. Test the output document
```

El bucle de validación detecta errores pronto.

## Directrices de contenido

### Evita información sensible al tiempo

No incluyas información que quedará desactualizada:

**Mal ejemplo: Sensible al tiempo** (se volverá incorrecto):

```markdown  theme={null}
If you're doing this before August 2025, use the old API.
After August 2025, use the new API.
```

**Buen ejemplo** (usar una sección de "patrones antiguos"):

```markdown  theme={null}
## Current method

Use the v2 API endpoint: `api.example.com/v2/messages`

## Old patterns

<details>
<summary>Legacy v1 API (deprecated 2025-08)</summary>

The v1 API used: `api.example.com/v1/messages`

This endpoint is no longer supported.
</details>
```

La sección de patrones antiguos aporta contexto histórico sin saturar el contenido principal.

### Usa terminología consistente

Elige un término y úsalo en toda la Skill:

**Bien - Consistente**:

* Siempre "API endpoint"
* Siempre "field"
* Siempre "extract"

**Mal - Inconsistente**:

* Mezclar "API endpoint", "URL", "API route", "path"
* Mezclar "field", "box", "element", "control"
* Mezclar "extract", "pull", "get", "retrieve"

La consistencia ayuda a Claude a entender y seguir las instrucciones.

## Patrones comunes

### Patrón de plantilla

Proporciona plantillas para el formato de salida. Ajusta el nivel de rigidez a tus necesidades.

**Para requisitos estrictos** (como respuestas de API o formatos de datos):

````markdown  theme={null}
## Report structure

ALWAYS use this exact template structure:

```markdown
# [Analysis Title]

## Executive summary
[One-paragraph overview of key findings]

## Key findings
- Finding 1 with supporting data
- Finding 2 with supporting data
- Finding 3 with supporting data

## Recommendations
1. Specific actionable recommendation
2. Specific actionable recommendation
```
````

**Para orientación flexible** (cuando la adaptación es útil):

````markdown  theme={null}
## Report structure

Here is a sensible default format, but use your best judgment based on the analysis:

```markdown
# [Analysis Title]

## Executive summary
[Overview]

## Key findings
[Adapt sections based on what you discover]

## Recommendations
[Tailor to the specific context]
```

Adjust sections as needed for the specific analysis type.
````

### Patrón de ejemplos

Para Skills donde la calidad del resultado depende de ver ejemplos, proporciona pares de entrada/salida igual que en el prompting normal:

````markdown  theme={null}
## Commit message format

Generate commit messages following these examples:

**Example 1:**
Input: Added user authentication with JWT tokens
Output:
```
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware
```

**Example 2:**
Input: Fixed bug where dates displayed incorrectly in reports
Output:
```
fix(reports): correct date formatting in timezone conversion

Use UTC timestamps consistently across report generation
```

**Example 3:**
Input: Updated dependencies and refactored error handling
Output:
```
chore: update dependencies and refactor error handling

- Upgrade lodash to 4.17.21
- Standardize error response format across endpoints
```

Follow this style: type(scope): brief description, then detailed explanation.
````

Los ejemplos ayudan a Claude a entender el estilo deseado y el nivel de detalle con más claridad que las descripciones por sí solas.

### Patrón de flujo de trabajo condicional

Guía a Claude a través de puntos de decisión:

```markdown  theme={null}
## Document modification workflow

1. Determine the modification type:

   **Creating new content?** → Follow "Creation workflow" below
   **Editing existing content?** → Follow "Editing workflow" below

2. Creation workflow:
   - Use docx-js library
   - Build document from scratch
   - Export to .docx format

3. Editing workflow:
   - Unpack existing document
   - Modify XML directly
   - Validate after each change
   - Repack when complete
```

<Tip>
  Si los flujos de trabajo se vuelven grandes o complicados con muchos pasos, considera trasladarlos a ficheros separados e indicar a Claude que lea el fichero apropiado según la tarea en cuestión.
</Tip>

## Evaluación e iteración

### Construye evaluaciones primero

**Crea evaluaciones ANTES de escribir documentación extensa.** Esto asegura que tu Skill resuelve problemas reales en lugar de documentar problemas imaginados.

**Desarrollo guiado por evaluaciones:**

1. **Identifica huecos**: Ejecuta Claude en tareas representativas sin una Skill. Documenta fallos específicos o contexto faltante
2. **Crea evaluaciones**: Construye tres escenarios que prueben esos huecos
3. **Establece una línea base**: Mide el rendimiento de Claude sin la Skill
4. **Escribe instrucciones mínimas**: Crea justo el contenido suficiente para abordar los huecos y pasar las evaluaciones
5. **Itera**: Ejecuta las evaluaciones, compara con la línea base y refina

Este enfoque asegura que estás resolviendo problemas reales en lugar de anticipar requisitos que podrían no llegar a materializarse nunca.

**Estructura de evaluación**:

```json  theme={null}
{
  "skills": ["pdf-processing"],
  "query": "Extract all text from this PDF file and save it to output.txt",
  "files": ["test-files/document.pdf"],
  "expected_behavior": [
    "Successfully reads the PDF file using an appropriate PDF processing library or command-line tool",
    "Extracts text content from all pages in the document without missing any pages",
    "Saves the extracted text to a file named output.txt in a clear, readable format"
  ]
}
```

<Note>
  Este ejemplo demuestra una evaluación basada en datos con una rúbrica de prueba sencilla. Actualmente no ofrecemos una forma integrada de ejecutar estas evaluaciones. Los usuarios pueden crear su propio sistema de evaluación. Las evaluaciones son tu fuente de verdad para medir la efectividad de una Skill.
</Note>

### Desarrolla Skills de forma iterativa con Claude

El proceso de desarrollo de Skills más efectivo involucra al propio Claude. Trabaja con una instancia de Claude ("Claude A") para crear una Skill que usarán otras instancias ("Claude B"). Claude A ayuda a diseñar y refinar las instrucciones, mientras que Claude B las prueba en tareas reales. Esto funciona porque los modelos Claude entienden tanto cómo escribir instrucciones efectivas para agentes como qué información necesitan los agentes.

**Crear una nueva Skill:**

1. **Completa una tarea sin una Skill**: Trabaja en un problema con Claude A usando el prompting normal. Mientras trabajas, proporcionarás de forma natural contexto, explicarás preferencias y compartirás conocimiento procedimental. Fíjate en qué información proporcionas repetidamente.

2. **Identifica el patrón reutilizable**: Después de completar la tarea, identifica qué contexto proporcionaste que sería útil para tareas futuras similares.

   **Ejemplo**: Si trabajaste en un análisis de BigQuery, podrías haber proporcionado nombres de tablas, definiciones de campos, reglas de filtrado (como "excluir siempre las cuentas de prueba") y patrones de consulta comunes.

3. **Pide a Claude A que cree una Skill**: "Crea una Skill que capture este patrón de análisis de BigQuery que acabamos de usar. Incluye los esquemas de las tablas, las convenciones de nomenclatura y la regla sobre filtrar las cuentas de prueba."

   <Tip>
     Los modelos Claude entienden el formato y la estructura de las Skills de forma nativa. No necesitas system prompts especiales ni una skill de "escribir skills" para conseguir que Claude te ayude a crear Skills. Simplemente pide a Claude que cree una Skill y generará contenido de SKILL.md correctamente estructurado, con el frontmatter y el contenido del cuerpo apropiados.
   </Tip>

4. **Revisa la concisión**: Comprueba que Claude A no haya añadido explicaciones innecesarias. Pregunta: "Elimina la explicación sobre qué es la tasa de éxito (win rate) - Claude ya lo sabe".

5. **Mejora la arquitectura de la información**: Pide a Claude A que organice el contenido de forma más efectiva. Por ejemplo: "Organiza esto de forma que el esquema de la tabla esté en un fichero de referencia separado. Podríamos añadir más tablas más adelante."

6. **Prueba en tareas similares**: Usa la Skill con Claude B (una instancia nueva con la Skill cargada) en casos de uso relacionados. Observa si Claude B encuentra la información correcta, aplica las reglas correctamente y completa la tarea con éxito.

7. **Itera basándote en la observación**: Si Claude B tiene dificultades u omite algo, vuelve a Claude A con detalles específicos: "Cuando Claude usó esta Skill, olvidó filtrar por fecha para el Q4. ¿Deberíamos añadir una sección sobre patrones de filtrado por fecha?"

**Iterar sobre Skills existentes:**

El mismo patrón jerárquico continúa al mejorar Skills. Alternas entre:

* **Trabajar con Claude A** (el experto que ayuda a refinar la Skill)
* **Probar con Claude B** (el agente que usa la Skill para realizar trabajo real)
* **Observar el comportamiento de Claude B** y llevar los hallazgos de vuelta a Claude A

1. **Usa la Skill en flujos de trabajo reales**: Dale a Claude B (con la Skill cargada) tareas reales, no escenarios de prueba

2. **Observa el comportamiento de Claude B**: Anota dónde tiene dificultades, dónde tiene éxito o dónde toma decisiones inesperadas

   **Ejemplo de observación**: "Cuando le pedí a Claude B un informe de ventas regional, escribió la consulta pero olvidó filtrar las cuentas de prueba, aunque la Skill menciona esta regla."

3. **Vuelve a Claude A para mejoras**: Comparte el SKILL.md actual y describe lo que observaste. Pregunta: "Noté que Claude B olvidó filtrar las cuentas de prueba cuando pedí un informe regional. La Skill menciona el filtrado, pero ¿quizás no sea suficientemente prominente?"

4. **Revisa las sugerencias de Claude A**: Claude A podría sugerir reorganizar para que las reglas sean más prominentes, usar un lenguaje más fuerte como "DEBE filtrar" en lugar de "filtra siempre", o reestructurar la sección de flujo de trabajo.

5. **Aplica y prueba los cambios**: Actualiza la Skill con los refinamientos de Claude A, y luego vuelve a probar con Claude B en solicitudes similares

6. **Repite según el uso**: Continúa este ciclo de observar-refinar-probar a medida que encuentres nuevos escenarios. Cada iteración mejora la Skill basándose en el comportamiento real del agente, no en suposiciones.

**Recopilar feedback del equipo:**

1. Comparte Skills con tus compañeros de equipo y observa su uso
2. Pregunta: ¿Se activa la Skill cuando se espera? ¿Son claras las instrucciones? ¿Qué falta?
3. Incorpora el feedback para abordar puntos ciegos en tus propios patrones de uso

**Por qué funciona este enfoque**: Claude A entiende las necesidades del agente, tú aportas experiencia de dominio, Claude B revela huecos mediante el uso real, y el refinamiento iterativo mejora las Skills basándose en el comportamiento observado en lugar de en suposiciones.

### Observa cómo navega Claude por las Skills

A medida que iteras sobre las Skills, presta atención a cómo las usa Claude realmente en la práctica. Fíjate en:

* **Rutas de exploración inesperadas**: ¿Lee Claude los ficheros en un orden que no anticipaste? Esto podría indicar que tu estructura no es tan intuitiva como pensabas
* **Conexiones perdidas**: ¿No sigue Claude las referencias a ficheros importantes? Tus enlaces podrían necesitar ser más explícitos o prominentes
* **Dependencia excesiva de ciertas secciones**: Si Claude lee repetidamente el mismo fichero, considera si ese contenido debería estar en el SKILL.md principal en su lugar
* **Contenido ignorado**: Si Claude nunca accede a un fichero empaquetado, podría ser innecesario o estar mal señalizado en las instrucciones principales

Itera basándote en estas observaciones en lugar de en suposiciones. El 'name' y la 'description' en los metadatos de tu Skill son particularmente críticos. Claude los usa al decidir si activar la Skill en respuesta a la tarea actual. Asegúrate de que describan con claridad qué hace la Skill y cuándo debería usarse.

## Antipatrones a evitar

### Evita rutas al estilo Windows

Usa siempre barras inclinadas (forward slashes) en las rutas de fichero, incluso en Windows:

* ✓ **Bien**: `scripts/helper.py`, `reference/guide.md`
* ✗ **Evitar**: `scripts\helper.py`, `reference\guide.md`

Las rutas de estilo Unix funcionan en todas las plataformas, mientras que las rutas de estilo Windows causan errores en sistemas Unix.

### Evita ofrecer demasiadas opciones

No presentes múltiples enfoques a menos que sea necesario:

````markdown  theme={null}
**Bad example: Too many choices** (confusing):
"You can use pypdf, or pdfplumber, or PyMuPDF, or pdf2image, or..."

**Good example: Provide a default** (with escape hatch):
"Use pdfplumber for text extraction:
```python
import pdfplumber
```

For scanned PDFs requiring OCR, use pdf2image with pytesseract instead."
````

## Avanzado: Skills con código ejecutable

Las secciones de abajo se centran en Skills que incluyen scripts ejecutables. Si tu Skill usa solo instrucciones en markdown, salta a [Checklist para Skills efectivas](#checklist-for-effective-skills).

### Resuelve, no se lo pases a Claude

Al escribir scripts para Skills, gestiona las condiciones de error en lugar de pasárselas a Claude.

**Buen ejemplo: Gestionar errores explícitamente**:

```python  theme={null}
def process_file(path):
    """Process a file, creating it if it doesn't exist."""
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError:
        # Create file with default content instead of failing
        print(f"File {path} not found, creating default")
        with open(path, 'w') as f:
            f.write('')
        return ''
    except PermissionError:
        # Provide alternative instead of failing
        print(f"Cannot access {path}, using default")
        return ''
```

**Mal ejemplo: Pasárselo a Claude**:

```python  theme={null}
def process_file(path):
    # Just fail and let Claude figure it out
    return open(path).read()
```

Los parámetros de configuración también deberían estar justificados y documentados para evitar "constantes vudú" (ley de Ousterhout). Si no sabes cuál es el valor correcto, ¿cómo lo va a determinar Claude?

**Buen ejemplo: Autodocumentado**:

```python  theme={null}
# HTTP requests typically complete within 30 seconds
# Longer timeout accounts for slow connections
REQUEST_TIMEOUT = 30

# Three retries balances reliability vs speed
# Most intermittent failures resolve by the second retry
MAX_RETRIES = 3
```

**Mal ejemplo: Números mágicos**:

```python  theme={null}
TIMEOUT = 47  # Why 47?
RETRIES = 5   # Why 5?
```

### Proporciona scripts de utilidad

Aunque Claude pudiera escribir un script, los scripts preconstruidos ofrecen ventajas:

**Beneficios de los scripts de utilidad**:

* Más fiables que el código generado
* Ahorran tokens (no hace falta incluir el código en el contexto)
* Ahorran tiempo (no hace falta generar código)
* Aseguran la consistencia entre usos

<img src="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=4bbc45f2c2e0bee9f2f0d5da669bad00" alt="Empaquetado de scripts ejecutables junto con ficheros de instrucciones" data-og-width="2048" width="2048" data-og-height="1154" height="1154" data-path="images/agent-skills-executable-scripts.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=280&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=9a04e6535a8467bfeea492e517de389f 280w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=560&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=e49333ad90141af17c0d7651cca7216b 560w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=840&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=954265a5df52223d6572b6214168c428 840w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=1100&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=2ff7a2d8f2a83ee8af132b29f10150fd 1100w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=1650&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=48ab96245e04077f4d15e9170e081cfb 1650w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=2500&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=0301a6c8b3ee879497cc5b5483177c90 2500w" />

El diagrama de arriba muestra cómo funcionan los scripts ejecutables junto con los ficheros de instrucciones. El fichero de instrucciones (forms.md) referencia el script, y Claude puede ejecutarlo sin cargar su contenido en el contexto.

**Distinción importante**: Deja claro en tus instrucciones si Claude debería:

* **Ejecutar el script** (lo más común): "Ejecuta `analyze_form.py` para extraer los campos"
* **Leerlo como referencia** (para lógica compleja): "Consulta `analyze_form.py` para ver el algoritmo de extracción de campos"

Para la mayoría de los scripts de utilidad, se prefiere la ejecución porque es más fiable y eficiente. Consulta la sección [Entorno de ejecución](#runtime-environment) más abajo para más detalles sobre cómo funciona la ejecución de scripts.

**Ejemplo**:

````markdown  theme={null}
## Utility scripts

**analyze_form.py**: Extract all form fields from PDF

```bash
python scripts/analyze_form.py input.pdf > fields.json
```

Output format:
```json
{
  "field_name": {"type": "text", "x": 100, "y": 200},
  "signature": {"type": "sig", "x": 150, "y": 500}
}
```

**validate_boxes.py**: Check for overlapping bounding boxes

```bash
python scripts/validate_boxes.py fields.json
# Returns: "OK" or lists conflicts
```

**fill_form.py**: Apply field values to PDF

```bash
python scripts/fill_form.py input.pdf fields.json output.pdf
```
````

### Usa el análisis visual

Cuando las entradas se puedan renderizar como imágenes, haz que Claude las analice:

````markdown  theme={null}
## Form layout analysis

1. Convert PDF to images:
   ```bash
   python scripts/pdf_to_images.py form.pdf
   ```

2. Analyze each page image to identify form fields
3. Claude can see field locations and types visually
````

<Note>
  En este ejemplo, tendrías que escribir el script `pdf_to_images.py`.
</Note>

Las capacidades de visión de Claude ayudan a entender diseños y estructuras.

### Crea resultados intermedios verificables

Cuando Claude realiza tareas complejas y abiertas, puede cometer errores. El patrón "plan-validar-ejecutar" detecta errores pronto haciendo que Claude primero cree un plan en un formato estructurado, luego valide ese plan con un script antes de ejecutarlo.

**Ejemplo**: Imagina pedirle a Claude que actualice 50 campos de un formulario en un PDF a partir de una hoja de cálculo. Sin validación, Claude podría referenciar campos inexistentes, crear valores conflictivos, omitir campos obligatorios o aplicar actualizaciones incorrectamente.

**Solución**: Usa el patrón de flujo de trabajo mostrado arriba (relleno de formularios PDF), pero añade un fichero intermedio `changes.json` que se valida antes de aplicar los cambios. El flujo de trabajo se convierte en: analizar → **crear el fichero de plan** → **validar el plan** → ejecutar → verificar.

**Por qué funciona este patrón:**

* **Detecta errores pronto**: La validación encuentra problemas antes de que se apliquen los cambios
* **Verificable por máquina**: Los scripts proporcionan una verificación objetiva
* **Planificación reversible**: Claude puede iterar sobre el plan sin tocar los originales
* **Depuración clara**: Los mensajes de error apuntan a problemas específicos

**Cuándo usarlo**: Operaciones por lotes, cambios destructivos, reglas de validación complejas, operaciones de alto riesgo.

**Consejo de implementación**: Haz que los scripts de validación sean detallados con mensajes de error específicos como "Field 'signature\_date' not found. Available fields: customer\_name, order\_total, signature\_date\_signed" para ayudar a Claude a corregir los problemas.

### Dependencias de paquetes

Las Skills se ejecutan en el entorno de ejecución de código con limitaciones específicas de la plataforma:

* **claude.ai**: Puede instalar paquetes desde npm y PyPI y descargar de repositorios de GitHub
* **API de Anthropic**: No tiene acceso a la red ni instalación de paquetes en tiempo de ejecución

Enumera los paquetes requeridos en tu SKILL.md y verifica que estén disponibles en la [documentación de la herramienta de ejecución de código](/en/docs/agents-and-tools/tool-use/code-execution-tool).

### Entorno de ejecución

Las Skills se ejecutan en un entorno de ejecución de código con acceso al sistema de ficheros, comandos bash y capacidades de ejecución de código. Para la explicación conceptual de esta arquitectura, consulta [La arquitectura de Skills](/en/docs/agents-and-tools/agent-skills/overview#the-skills-architecture) en la visión general.

**Cómo afecta esto a tu autoría:**

**Cómo accede Claude a las Skills:**

1. **Metadatos precargados**: Al arrancar, el nombre y la descripción del frontmatter YAML de todas las Skills se cargan en el system prompt
2. **Ficheros leídos bajo demanda**: Claude usa herramientas de lectura por bash para acceder a SKILL.md y otros ficheros del sistema de ficheros cuando se necesitan
3. **Scripts ejecutados de forma eficiente**: Los scripts de utilidad pueden ejecutarse vía bash sin cargar su contenido completo en el contexto. Solo la salida del script consume tokens
4. **Sin penalización de contexto por ficheros grandes**: Los ficheros de referencia, datos o documentación no consumen tokens de contexto hasta que realmente se leen

* **Las rutas de fichero importan**: Claude navega por el directorio de tu skill como un sistema de ficheros. Usa barras inclinadas (`reference/guide.md`), no barras invertidas
* **Nombra los ficheros de forma descriptiva**: Usa nombres que indiquen el contenido: `form_validation_rules.md`, no `doc2.md`
* **Organiza para facilitar el descubrimiento**: Estructura los directorios por dominio o funcionalidad
  * Bien: `reference/finance.md`, `reference/sales.md`
  * Mal: `docs/file1.md`, `docs/file2.md`
* **Empaqueta recursos completos**: Incluye documentación de API completa, ejemplos extensos, conjuntos de datos grandes; sin penalización de contexto hasta que se accede a ellos
* **Prefiere scripts para operaciones deterministas**: Escribe `validate_form.py` en lugar de pedirle a Claude que genere código de validación
* **Deja claro el propósito de ejecución**:
  * "Ejecuta `analyze_form.py` para extraer los campos" (ejecutar)
  * "Consulta `analyze_form.py` para ver el algoritmo de extracción" (leer como referencia)
* **Prueba los patrones de acceso a ficheros**: Verifica que Claude pueda navegar por la estructura de tu directorio probando con solicitudes reales

**Ejemplo:**

```
bigquery-skill/
├── SKILL.md (overview, points to reference files)
└── reference/
    ├── finance.md (revenue metrics)
    ├── sales.md (pipeline data)
    └── product.md (usage analytics)
```

Cuando el usuario pregunta sobre ingresos, Claude lee SKILL.md, ve la referencia a `reference/finance.md`, e invoca bash para leer solo ese fichero. Los ficheros sales.md y product.md permanecen en el sistema de ficheros, sin consumir tokens de contexto hasta que se necesiten. Este modelo basado en el sistema de ficheros es lo que habilita la divulgación progresiva. Claude puede navegar y cargar selectivamente exactamente lo que cada tarea requiere.

Para todos los detalles sobre la arquitectura técnica completa, consulta [Cómo funcionan las Skills](/en/docs/agents-and-tools/agent-skills/overview#how-skills-work) en la visión general de Skills.

### Referencias a herramientas MCP

Si tu Skill usa herramientas MCP (Model Context Protocol), usa siempre los nombres de herramienta completamente cualificados para evitar errores de "herramienta no encontrada".

**Formato**: `NombreDelServidor:nombre_herramienta`

**Ejemplo**:

```markdown  theme={null}
Use the BigQuery:bigquery_schema tool to retrieve table schemas.
Use the GitHub:create_issue tool to create issues.
```

Donde:

* `BigQuery` y `GitHub` son nombres de servidor MCP
* `bigquery_schema` y `create_issue` son los nombres de las herramientas dentro de esos servidores

Sin el prefijo del servidor, Claude puede no encontrar la herramienta, especialmente cuando hay varios servidores MCP disponibles.

### Evita asumir que las herramientas están instaladas

No asumas que los paquetes están disponibles:

````markdown  theme={null}
**Bad example: Assumes installation**:
"Use the pdf library to process the file."

**Good example: Explicit about dependencies**:
"Install required package: `pip install pypdf`

Then use it:
```python
from pypdf import PdfReader
reader = PdfReader("file.pdf")
```"
````

## Notas técnicas

### Requisitos del frontmatter YAML

El frontmatter de SKILL.md requiere los campos `name` (máximo 64 caracteres) y `description` (máximo 1024 caracteres). Consulta [Visión general de Skills](/en/docs/agents-and-tools/agent-skills/overview#skill-structure) para los detalles completos de la estructura.

### Presupuestos de tokens

Mantén el cuerpo de SKILL.md por debajo de 500 líneas para un rendimiento óptimo. Si tu contenido supera esto, divídelo en ficheros separados usando los patrones de divulgación progresiva descritos anteriormente. Para detalles arquitectónicos, consulta [Visión general de Skills](/en/docs/agents-and-tools/agent-skills/overview#how-skills-work).

## Checklist para Skills efectivas

Antes de compartir una Skill, verifica:

### Calidad fundamental

* [ ] La descripción es específica e incluye términos clave
* [ ] La descripción incluye tanto qué hace la Skill como cuándo usarla
* [ ] El cuerpo de SKILL.md tiene menos de 500 líneas
* [ ] Los detalles adicionales están en ficheros separados (si es necesario)
* [ ] No hay información sensible al tiempo (o está en una sección de "patrones antiguos")
* [ ] Terminología consistente en todo el documento
* [ ] Los ejemplos son concretos, no abstractos
* [ ] Las referencias a ficheros tienen un solo nivel de profundidad
* [ ] Se usa la divulgación progresiva de forma apropiada
* [ ] Los flujos de trabajo tienen pasos claros

### Código y scripts

* [ ] Los scripts resuelven problemas en lugar de pasárselos a Claude
* [ ] La gestión de errores es explícita y útil
* [ ] No hay "constantes vudú" (todos los valores están justificados)
* [ ] Los paquetes requeridos están enumerados en las instrucciones y verificados como disponibles
* [ ] Los scripts tienen documentación clara
* [ ] No hay rutas de estilo Windows (todas con barras inclinadas)
* [ ] Hay pasos de validación/verificación para operaciones críticas
* [ ] Se incluyen bucles de retroalimentación para tareas críticas en cuanto a calidad

### Pruebas

* [ ] Se han creado al menos tres evaluaciones
* [ ] Se ha probado con Haiku, Sonnet y Opus
* [ ] Se ha probado con escenarios de uso real
* [ ] Se ha incorporado el feedback del equipo (si aplica)

## Próximos pasos

<CardGroup cols={2}>
  <Card title="Empieza con Agent Skills" icon="rocket" href="/en/docs/agents-and-tools/agent-skills/quickstart">
    Crea tu primera Skill
  </Card>

  <Card title="Usa Skills en Claude Code" icon="terminal" href="/en/docs/claude-code/skills">
    Crea y gestiona Skills en Claude Code
  </Card>

  <Card title="Usa Skills con la API" icon="code" href="/en/api/skills-guide">
    Sube y usa Skills de forma programática
  </Card>
</CardGroup>
