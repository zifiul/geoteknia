# public-faq-pages

## Purpose

Páginas públicas de FAQs técnicas generales (`/faqs`, `/faqs/[slug]`) y acordeón compartido con la plantilla de servicio, con JSON-LD `FAQPage` y anclas estables por pregunta.

## Requirements

### Requirement: Índice de grupos FAQ generales

El sitio SHALL exponer `/faqs` listando grupos con `scope: general` que tengan al menos una FAQ publicada, con metadata estática y canonical `/faqs`.

#### Scenario: Listado con grupos publicados

- **WHEN** existen grupos generales con FAQs publicadas
- **THEN** `/faqs` responde 200 con enlaces a `/faqs/{slug}` por grupo

#### Scenario: Sin grupos elegibles

- **WHEN** no hay grupos con FAQs publicadas
- **THEN** `/faqs` muestra estado vacío sin enlaces rotos

### Requirement: Página por grupo con FAQPage

El sitio SHALL servir `/faqs/{slug}` con acordeón accesible, breadcrumbs, canonical autoreferenciado y JSON-LD `FAQPage` cuando hay FAQs publicadas.

#### Scenario: Grupo válido

- **WHEN** el slug corresponde a un grupo general con FAQs publicadas
- **THEN** la página incluye `FAQPage` JSON-LD y respuestas en el DOM

#### Scenario: Grupo sin FAQs publicadas

- **WHEN** el grupo no existe o no tiene FAQs publicadas
- **THEN** la respuesta es 404

### Requirement: Acordeón compartido en servicios

Las FAQs de servicio SHALL usar el mismo componente de acordeón que las páginas generales.

#### Scenario: Plantilla de servicio

- **WHEN** un servicio tiene FAQs publicadas
- **THEN** se renderiza el acordeón reutilizable y `FAQPage` JSON-LD en la página de servicio

### Requirement: Deep link por pregunta

Las preguntas SHALL ser anclables con `#faq-{id}` de forma estable.

#### Scenario: Hash en URL

- **WHEN** el usuario abre `/faqs/{slug}#faq-{id}` con un id válido
- **THEN** el ítem correspondiente del acordeón queda expandido
