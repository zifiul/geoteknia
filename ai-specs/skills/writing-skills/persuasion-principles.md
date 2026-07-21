# Principios de Persuasión para el Diseño de Skills

## Visión general

Los LLM responden a los mismos principios de persuasión que los humanos. Entender esta psicología ayuda a diseñar skills más efectivas, no para manipular, sino para garantizar que las prácticas críticas se sigan incluso bajo presión.

**Fundamento de la investigación:** Meincke et al. (2025) probaron 7 principios de persuasión con N=28.000 conversaciones de IA. Las técnicas de persuasión más que duplicaron las tasas de cumplimiento (33% → 72%, p < .001).

## Los Siete Principios

### 1. Autoridad
**Qué es:** Deferencia hacia la pericia, las credenciales o las fuentes oficiales.

**Cómo funciona en las skills:**
- Lenguaje imperativo: "DEBES", "Nunca", "Siempre"
- Planteamiento no negociable: "Sin excepciones"
- Elimina la fatiga de decisión y la racionalización

**Cuándo usarlo:**
- Skills que imponen disciplina (TDD, requisitos de verificación)
- Prácticas críticas para la seguridad
- Buenas prácticas establecidas

**Ejemplo:**
```markdown
✅ Write code before test? Delete it. Start over. No exceptions.
❌ Consider writing tests first when feasible.
```

### 2. Compromiso
**Qué es:** Consistencia con acciones, declaraciones o compromisos públicos previos.

**Cómo funciona en las skills:**
- Exigir anuncios: "Anuncia el uso de la skill"
- Forzar elecciones explícitas: "Elige A, B o C"
- Usar seguimiento: TodoWrite para listas de tareas

**Cuándo usarlo:**
- Para asegurar que las skills realmente se siguen
- Procesos de varios pasos
- Mecanismos de rendición de cuentas

**Ejemplo:**
```markdown
✅ When you find a skill, you MUST announce: "I'm using [Skill Name]"
❌ Consider letting your partner know which skill you're using.
```

### 3. Escasez
**Qué es:** Urgencia derivada de límites de tiempo o disponibilidad limitada.

**Cómo funciona en las skills:**
- Requisitos con límite de tiempo: "Antes de continuar"
- Dependencias secuenciales: "Inmediatamente después de X"
- Previene la procrastinación

**Cuándo usarlo:**
- Requisitos de verificación inmediata
- Flujos de trabajo sensibles al tiempo
- Prevenir el "lo haré más tarde"

**Ejemplo:**
```markdown
✅ After completing a task, IMMEDIATELY request code review before proceeding.
❌ You can review code when convenient.
```

### 4. Prueba Social
**Qué es:** Conformidad con lo que hacen los demás o con lo que se considera normal.

**Cómo funciona en las skills:**
- Patrones universales: "Cada vez", "Siempre"
- Modos de fallo: "X sin Y = fallo"
- Establece normas

**Cuándo usarlo:**
- Documentar prácticas universales
- Advertir sobre fallos comunes
- Reforzar estándares

**Ejemplo:**
```markdown
✅ Checklists without TodoWrite tracking = steps get skipped. Every time.
❌ Some people find TodoWrite helpful for checklists.
```

### 5. Unidad
**Qué es:** Identidad compartida, sensación de "nosotros", pertenencia al grupo.

**Cómo funciona en las skills:**
- Lenguaje colaborativo: "nuestro código base", "somos colegas"
- Objetivos compartidos: "ambos queremos calidad"

**Cuándo usarlo:**
- Flujos de trabajo colaborativos
- Establecer una cultura de equipo
- Prácticas no jerárquicas

**Ejemplo:**
```markdown
✅ We're colleagues working together. I need your honest technical judgment.
❌ You should probably tell me if I'm wrong.
```

### 6. Reciprocidad
**Qué es:** Obligación de devolver los beneficios recibidos.

**Cómo funciona:**
- Usar con moderación - puede resultar manipulador
- Raramente necesario en las skills

**Cuándo evitarlo:**
- Casi siempre (otros principios son más efectivos)

### 7. Simpatía (Liking)
**Qué es:** Preferencia por cooperar con quienes nos caen bien.

**Cómo funciona:**
- **NO USAR para el cumplimiento**
- Entra en conflicto con una cultura de feedback honesto
- Genera servilismo (sycophancy)

**Cuándo evitarlo:**
- Siempre, para la imposición de disciplina

## Combinaciones de Principios según el Tipo de Skill

| Tipo de Skill | Usar | Evitar |
|------------|-----|-------|
| Que impone disciplina | Autoridad + Compromiso + Prueba Social | Simpatía, Reciprocidad |
| Guía/técnica | Autoridad moderada + Unidad | Autoridad intensa |
| Colaborativa | Unidad + Compromiso | Autoridad, Simpatía |
| Referencia | Solo claridad | Toda persuasión |

## Por Qué Funciona: La Psicología

**Las reglas de límite claro (bright-line rules) reducen la racionalización:**
- "DEBES" elimina la fatiga de decisión
- El lenguaje absoluto elimina las preguntas de "¿es esto una excepción?"
- Los contraargumentos explícitos anti-racionalización cierran resquicios específicos

**Las intenciones de implementación crean un comportamiento automático:**
- Disparadores claros + acciones requeridas = ejecución automática
- "Cuando X, haz Y" es más efectivo que "generalmente haz Y"
- Reduce la carga cognitiva del cumplimiento

**Los LLM son parahumanos:**
- Entrenados con texto humano que contiene estos patrones
- El lenguaje de autoridad precede al cumplimiento en los datos de entrenamiento
- Las secuencias de compromiso (declaración → acción) se modelan con frecuencia
- Los patrones de prueba social (todo el mundo hace X) establecen normas

## Uso Ético

**Legítimo:**
- Asegurar que se sigan las prácticas críticas
- Crear documentación efectiva
- Prevenir fallos predecibles

**Ilegítimo:**
- Manipular para beneficio personal
- Crear una falsa urgencia
- Cumplimiento basado en la culpa

**La prueba:** ¿Serviría esta técnica a los intereses genuinos del usuario si este la entendiera plenamente?

## Referencias de Investigación

**Cialdini, R. B. (2021).** *Influence: The Psychology of Persuasion (New and Expanded).* Harper Business.
- Siete principios de persuasión
- Fundamento empírico para la investigación sobre influencia

**Meincke, L., Shapiro, D., Duckworth, A. L., Mollick, E., Mollick, L., & Cialdini, R. (2025).** Call Me A Jerk: Persuading AI to Comply with Objectionable Requests. University of Pennsylvania.
- Probaron 7 principios con N=28.000 conversaciones con LLM
- El cumplimiento aumentó del 33% al 72% con técnicas de persuasión
- Autoridad, compromiso y escasez fueron los más efectivos
- Valida el modelo parahumano del comportamiento de los LLM

## Referencia Rápida

Al diseñar una skill, pregúntate:

1. **¿Qué tipo es?** (Disciplina vs. guía vs. referencia)
2. **¿Qué comportamiento estoy intentando cambiar?**
3. **¿Qué principio(s) aplican?** (Normalmente autoridad + compromiso para la disciplina)
4. **¿Estoy combinando demasiados?** (No uses los siete)
5. **¿Es esto ético?** (¿Sirve a los intereses genuinos del usuario?)
