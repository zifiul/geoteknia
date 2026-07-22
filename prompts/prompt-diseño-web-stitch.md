# Design System: Geoteknia Web Pública B2B
**Project ID:** [dejar placeholder si se desconoce]

## 1. Tema visual y atmósfera
Mood evocador, densidad, tratamiento fotográfico, personalidad de marca para P1/P2/P3.

## 2. Paleta de color y roles
Para CADA color: Nombre descriptivo + (#HEX) + rol funcional.
Incluir: fondos/superficies, jerarquía de texto, acento de CTA primario, bordes, success/error/info, focus ring.
Mapearlos también a roles semánticos: primary, secondary, tertiary, neutral, surface, on-surface, error.

## 3. Reglas tipográficas
Familias tipográficas, pesos, tamaños para display/H1–H3/body/meta/labels/CTA.
Cómo se estilizan los datos técnicos (profundidades, número de sondeos, números de acreditación).

## 4. Estilo de componentes
Documentar en lenguaje natural (no jerga de Tailwind):
- Botones (primary/secondary/tertiary/tel/WhatsApp) + hover/focus/disabled
- Header sticky + drawer de navegación móvil
- Bloque NAP del footer
- Formularios (inputs, selects, textarea, checkbox, validación/error, progreso para wizard de 3 pasos)
- Acordeón (FAQ)
- Filtros (chips/selects del catálogo de proyectos — se permiten contenedores interactivos)
- Estados de confirmación de Thank You
- Widget flotante de ubicación + panel de mapa como diálogo
- Banner de consentimiento de cookies
- Breadcrumbs, alerts, badges (usar con moderación)

## 5. Principios de layout
Breakpoints mobile-first, anchura máxima de contenido, escala de espaciado de 8px, ritmo entre secciones, reglas de hero, layout de formularios, comportamiento de CTA sticky en móvil.

## 6. Notas del sistema de diseño para Stitch
- Frases exactas que deben reutilizarse en futuros prompts de pantallas
- Chuleta de referencia de color (Nombre descriptivo + hex)
- Snippets de prompt de componentes para: Hero de Home, página de Servicio, landing geográfica, tarjeta/listado de proyecto, wizard de presupuesto, Calculadora, formulario de Licitación, Thank You, widget de Ubicación
- Reglas de iteración incremental (cambiar un solo componente cada vez)

OPCIONAL pero preferible: anteponer un front matter YAML válido (formato abierto de DESIGN.md) con tokens de color, tipografía, redondeado, espaciado y componentes clave; después, el cuerpo en markdown con la justificación.

REGLAS DE IDIOMA PARA EL ARCHIVO
- Usa lenguaje descriptivo de diseño (“separación tonal apenas susurrada”, “esquinas arquitectónicas de 4px”), NUNCA clases utilitarias en bruto (“rounded-md”, “bg-slate-900”).
- Empareja siempre los nombres descriptivos de color con su código hex.
- Explica POR QUÉ existe cada decisión (confianza, conversión, accesibilidad, uso en campo desde móvil).
- Etiquetas de UI en español en los ejemplos; la prosa de diseño puede estar en inglés o en español, pero se prefiere español para facilitar la lectura al equipo de Geoteknia.

No diseñes el portal de administración.
No inventes secciones extra de marketing más allá de las necesidades de conversión/SEO.
Produce ahora el DESIGN.md completo como un único documento listo para copiar y pegar.