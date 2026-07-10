---
name: geoteknia-domain
description: Conocimiento de dominio de Geoteknia (negocio geotécnico B2B, leads, CMS editorial, IA, RBAC) e invariantes del modelo de datos, para redactar specs, diseños y documentación coherentes con el producto. Úsala en las fases SDD y Docs del harness o siempre que haya que razonar sobre el dominio.
author: Geoteknia
version: 1.0.0
---

# Skill geoteknia-domain

Resume el dominio del producto y sus invariantes para que specs, diseños y docs usen el vocabulario correcto. La fuente de verdad detallada es `docs/technical/data-model.md` (modelo completo, ~40 entidades) y `docs/functional/` — esta skill orienta, no sustituye su lectura cuando el cambio toque esas áreas.

## El negocio

Geoteknia es una empresa de **ingeniería geotécnica** (estudios geotécnicos, ensayos, informes para obra) con una web B2B cuyo objetivo es la **captación de leads cualificados**: presupuestos, licitaciones, lead magnets (recursos descargables), calculadora de alcance y microconversiones (teléfono, WhatsApp, ubicación de parcela).

Áreas funcionales principales:

| Área | Conceptos clave |
|---|---|
| **Captación / CRM** | `Lead`, `Contact`, `Project`, eventos de conversión (append-only), formulario multipaso de presupuesto, prefill por URL (`servicio`, `provincia`, `tipo_obra`) |
| **Contenido / SEO** | CMS editorial propio: servicios, zonas geográficas, casos de éxito, blog, recursos. Estados editoriales (borrador → revisión → publicado), publicación vía ISR on-demand (`revalidatePath`/`revalidateTag`), JSON-LD por plantilla |
| **IA** | Generación asistida con Claude (server-side only): `AiGeneration` registra modelo, tokens, coste, usuario y objetivo. Todo contenido IA entra como **borrador**, nunca se publica automáticamente. **Prohibido enviar PII a prompts** |
| **Portal `/admin`** | Auth.js v5 + credenciales, 2FA TOTP para perfiles sensibles, RBAC con roles canónicos y permisos atómicos, audit log en acciones críticas, `noindex` |
| **Dominio geotécnico** | Referencia catastral, provincia, tipo de obra, alcance del estudio (cálculo), asignación de técnico |

## Invariantes que toda spec debe respetar

- **Roles canónicos:** `admin`, `gestor`, `editor`, `tecnico`. Autorización por **permiso atómico** (p. ej. `content.publish`, `projects.read`), nunca por comprobación de rol hardcodeada en la UI.
- **Single-org:** no hay tenants. `organization_profile` es singleton.
- **Persistencia:** IDs UUID; tablas/columnas físicas en snake_case (`@@map`/`@map`); soft delete selectivo (`deleted_at`); las tablas de auditoría y eventos de conversión son **append-only** (sin update ni delete).
- **RGPD/PII:** los datos de `contacts`, `leads` y `projects` son PII. No aparecen en logs, Sentry, analítica, dataLayer ni prompts de Claude. Todo tratamiento nuevo de PII debe señalarse en la spec.
- **Validación:** todo input externo pasa por Zod en servidor; los tipos se derivan con `z.infer`, nunca se duplican a mano.
- **Contrato HTTP:** respuestas con formato unificado `success`/`error` y códigos tipados (`backend-standards.md` §5.3).

## Uso en el harness

- **Fase 1 (SDD):** redacta specs con los términos de la tabla anterior; identifica qué entidades del `data-model.md` toca la US y qué invariantes aplican; incluye los requisitos RGPD/RBAC como criterios de aceptación.
- **Fase 7 (Docs):** verifica que los cambios de dominio quedan reflejados en `data-model.md` (entidades/enums), `api-spec.yml` (contratos) y docs funcionales si cambia comportamiento de producto.

## Señales de alerta

- Specs que inventan roles, estados editoriales o entidades no presentes en `data-model.md` sin declararlos como `ADDED`.
- Diseños que publican contenido IA sin paso editorial humano.
- Cualquier flujo que saque PII del servidor (cliente, logs, IA, analítica).
