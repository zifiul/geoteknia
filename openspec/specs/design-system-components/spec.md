# design-system-components Specification

## Purpose

Librería de componentes base accesibles (Atomic Design), tokens CSS en Tailwind v4 y catálogo interno admin. Materializado con GTK-44.

## Requirements

### Requirement: Tokens de diseño en CSS

El sistema SHALL exponer tokens de color, tipografía, radio, sombra y espaciado en el bloque `@theme` de `app/globals.css` (Tailwind v4 CSS-first), alineados con `docs/design/DESIGN.md`. No SHALL existir `tailwind.config.ts` para estos tokens.

#### Scenario: Consumo de token de marca en componente

- **WHEN** un componente aplica una clase derivada de token (p. ej. `bg-brand-primary`)
- **THEN** el color renderizado coincide con la paleta documentada en DESIGN.md

### Requirement: Utilidad cn

La función `cn()` SHALL vivir en `lib/shared/cn.ts` y componer clases con `clsx` y `tailwind-merge`.

#### Scenario: Fusión de clases conflictivas

- **WHEN** se invoca `cn('p-2', 'p-4')`
- **THEN** el resultado efectivo prioriza `p-4` (tailwind-merge)

### Requirement: Organización Atomic Design

Los componentes base SHALL ubicarse en `components/atoms/`, `components/molecules/` y `components/organisms/` con barriles `index.ts` por nivel. No SHALL existir carpeta plana `components/ui/`.

#### Scenario: Import desde barril de átomos

- **WHEN** una página importa `Button` desde `@/components/atoms`
- **THEN** el módulo resuelve sin rutas profundas ad hoc

### Requirement: Componentes presentacionales como RSC

Los componentes puramente presentacionales (`Badge`, `Card`, `Container`, `Section`, `Grid`, `Skeleton`, `Breadcrumbs`, `FieldError`) SHALL exportarse sin directiva `'use client'` por defecto.

#### Scenario: FieldError en servidor

- **WHEN** se renderiza `FieldError` en un Server Component
- **THEN** no se requiere boundary cliente adicional

### Requirement: Controles interactivos accesibles

`Button`, `Dialog`, `Accordion`, `Tabs` y controles de formulario SHALL ser operables por teclado con foco visible (contraste ≥ 3:1). `Dialog` SHALL atrapar el foco, exponer `role="dialog"` y `aria-modal="true"`, y restaurar el foco al disparador al cerrar. `Button` en estado `loading` SHALL exponer `aria-busy="true"` y no SHALL disparar acciones duplicadas.

#### Scenario: Button loading

- **WHEN** `Button` recibe `loading={true}`
- **THEN** el elemento tiene `aria-busy="true"` y está deshabilitado para interacción

#### Scenario: Dialog teclado

- **WHEN** el usuario pulsa Escape con el diálogo abierto
- **THEN** el diálogo se cierra y el foco vuelve al elemento que lo abrió

### Requirement: Formularios y errores

Los inputs SHALL aceptar props estándar para `aria-invalid` y `aria-describedby`. `FormField` SHALL asociar etiqueta visible al control. `FieldError` SHALL usar `role="alert"` cuando muestra un mensaje de error.

#### Scenario: Campo con error

- **WHEN** un input tiene `aria-invalid="true"` y un `FieldError` con el mismo `id` en `aria-describedby`
- **THEN** las tecnologías asistivas anuncian el mensaje de error al enfocar el control

### Requirement: CTA táctil móvil

Los botones de acción primaria SHALL tener área táctil mínima de 44×44 px en viewports móviles.

#### Scenario: Tamaño mínimo en móvil

- **WHEN** se renderiza `Button` con variante primaria en viewport < 640px
- **THEN** la caja de clic cumple min-height y min-width de 44px

### Requirement: Página de catálogo interno

SHALL existir una ruta bajo `app/(admin)/` que muestre todos los estados de cada componente base. La ruta SHALL heredar `robots: noindex,nofollow` del layout `(admin)`.

#### Scenario: Catálogo no indexable

- **WHEN** un crawler solicita la página de catálogo
- **THEN** la metadata de robots indica noindex

### Requirement: StickyCtaBar

El organismo `StickyCtaBar` SHALL mostrar CTA fijos en la parte inferior en móvil sin ocultar contenido crítico (padding inferior en el contenedor padre cuando aplique).

#### Scenario: Barra visible en scroll móvil

- **WHEN** el usuario hace scroll en una vista que monta `StickyCtaBar` en viewport móvil
- **THEN** la barra permanece visible y accesible por teclado
