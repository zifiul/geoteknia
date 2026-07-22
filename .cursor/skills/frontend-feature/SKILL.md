---
name: frontend-feature
description: Flujo de implementación de una feature frontend en Geoteknia (fase 4b del harness) - mobile-first con Atomic Design, corte Server/Client Component, React Hook Form con el schema Zod del contrato congelado, tokens locales y SEO/a11y. Úsala al construir UI hasta poner los tests en verde.
author: Geoteknia
version: 1.0.0
---

# Skill frontend-feature

Guía la implementación frontend de una US dentro del harness: desde el contrato congelado y los tests en RED hasta la UI en verde, sin desviarse de `docs/technical/frontend-standards.md` (estándares de ingeniería) ni de `docs/design/DESIGN.md` (design system visual de la web pública). Esta skill ordena el trabajo, no lo duplica.

## Entradas

- Contrato congelado (fase 2): schemas Zod compartidos — los tipos del frontend se derivan con `z.infer`, nunca se redefinen.
- Tests en RED de la fase 3 (componentes/validación) y escenarios E2E especificados para la 5a.
- `design.md` del change OpenSpec (arquitectura + threat model de la US — fase 1) y `frontend-standards.md` (App Router, Atomic Design, SEO, formularios, a11y).
- `docs/design/DESIGN.md`: design system global (paleta, tipografía, componentes, layout, atmósfera). **No es** el `design.md` OpenSpec del change.

## Orden de trabajo

1. **Clasifica los componentes** en Atomic Design ANTES de escribir código: qué átomos/moléculas existentes se reutilizan, qué piezas nuevas hacen falta y en qué nivel (usa la tabla de `frontend-standards.md` §8.3). Nada de carpetas genéricas (`misc`, `common`).
2. **Decide el corte Server/Client por pieza:** Server Component por defecto; `"use client"` solo en la hoja interactiva (estado, eventos, APIs de navegador). Nunca conviertas la página entera en cliente por una interacción puntual.
3. **Construye mobile-first alineado a `docs/design/DESIGN.md`:** maqueta primero el viewport móvil con los tokens del sistema (`styles/tokens.css` o equivalente, derivados del design system — nunca valores arbitrarios ni paletas/tipografías fuera de `DESIGN.md`), amplía después a tablet/desktop. Toda interacción funciona con touch y teclado.
4. **Formularios:** React Hook Form con resolver Zod del schema compartido del contrato; estados modelados como unión discriminada (`idle`/`submitting`/`success`/`error`); prefill seguro desde parámetros de URL; Turnstile en formularios públicos (validación real en servidor).
5. **Página indexable:** metadata (`title`, `description`, canonical), JSON-LD según la tabla de plantillas del estándar, y estrategia SSG + ISR on-demand con tags por dominio. `/admin` y thank-you pages siempre `noindex`.
6. **Pon los tests en verde:** ejecuta los tests de componentes/validación de la fase 3 y corrige hasta verde sin debilitarlos. Los guardrails de `secure-coding` (sección frontend) aplican a todo el código.
7. **Cierra revisando CWV y a11y:** `next/image`/`next/font`, code splitting de piezas no críticas, HTML semántico, labels reales, foco visible, contraste AA.

## Entregable

- Páginas, componentes (clasificados), hooks y formularios en verde.
- Resumen de fase: componentes creados/reutilizados por nivel, corte server/client decidido, impacto SEO/CWV/a11y y cualquier excepción a los guardrails para el reviewer.

## Señales de alerta

- Redefinir tipos o validaciones que ya están en el schema Zod compartido.
- `"use client"` en páginas o templates completos.
- Colores/espaciados/tipografías hardcodeados o ajenos a `docs/design/DESIGN.md` / tokens del sistema.
- Tratar el `design.md` OpenSpec del change como sustituto del design system (`docs/design/DESIGN.md`), o al revés.
- Formularios que validan solo en cliente o loguean PII en analítica.
- Modificar el contrato (schema) para cuadrar la UI: eso reabre la fase 2.
