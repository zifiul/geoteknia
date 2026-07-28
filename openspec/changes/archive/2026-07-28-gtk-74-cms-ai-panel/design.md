# Design — GTK-74 CMS panel IA

## Arquitectura

La generación vive como **pestaña dentro del editor** GTK-73 (`ContentEditor.tsx`), no como ruta `/admin/contenido/…/ia`. El panel llama a `POST /api/admin/ia/generar` desde el cliente; «Usar esta generación» hace `patch` del estado local del editor; el guardado sigue siendo el submit existente (`createServiceAction` / `updateServiceAction`).

```
ContentEditor
  ├─ pestaña Editor (formulario + preview GTK-73)
  └─ pestaña Generar con IA → AiGeneratePanel
        ├─ AiGenerateForm (inputs según `prompt_templates` seed / pageType)
        ├─ overlay generando (Stitch `d74f99a4…`)
        ├─ AiOutputPreview + SectionRegenerateMenu (Stitch `0b1e8af1…`, `e32cb6e5…`)
        └─ AiBudgetNotice en 429 BUDGET_EXCEEDED (Stitch `b887e73a…`)
```

Mapeo salida → formulario servicio: `lib/cms/ia/apply-ai-output.ts`. Claves de sección: `REGENERATION_SECTION_KEYS` en `lib/ia/output-schema.ts`.

## Stitch (Oleada A5)

| Pantalla | Screen ID |
|----------|-----------|
| Formulario generación | `4adfe677069440a6b4bcc7ff598f2886` |
| Generando | `d74f99a4c0ea4fbb96e03f8a32f7c98b` |
| Salida + regenerar | `0b1e8af105414c8cb86bb607cec3be3e` |
| Presupuesto agotado | `b887e73acb3b460387197d47724c7187` |
| Salida parcial / error | `df45d8b9e2ef4f36af092d4930fe3217` |
| Modal regenerar sección | `e32cb6e5bd114ac4bbe9021a96ac445c` |

## Threat model

### Superficie de ataque

- Cliente admin: formulario de inputs IA (sin endpoint nuevo).
- Consumo de `POST /api/admin/ia/generar` ya endurecido (GTK-38/37/25).

### Actores

- Editor con `ai.generate` (uso legítimo).
- Técnico / gestor sin permiso (no debe ver pestaña ni invocar API — 403 en servidor).
- Atacante con sesión robada de editor (coste IA, contenido draft).

### Datos sensibles

- Inputs de generación: solo campos editoriales (sin PII de leads/proyectos).
- Salida IA: contenido draft, no publicado hasta flujo GTK-75.

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Invocar IA sin permiso | fetch directo al endpoint | Coste / abuso | `withRoutePermission('ai.generate')`; UI oculta sin `canUseAi` |
| T2 | Exfiltrar PII en prompts | campos de formulario inventados | RGPD | UI limitada a `input_schema` de plantilla; sin campos lead/proyecto |
| T3 | Publicar YMYL sin revisión | confiar ciegamente en IA | Reputación / compliance | Aviso YMYL en panel; guardado como borrador vía CRUD existente |
| T4 | Agotar presupuesto | spam de generaciones | Coste | 429 `BUDGET_EXCEEDED` backend; `AiBudgetNotice` sin reintento automático |

Amenazas descartadas: prompt injection vía endpoint nuevo (no hay endpoint nuevo); Turnstile en formulario público (no aplica a `/admin`).

### Requisitos de seguridad

- [ ] SEC-1: Usuario sin `ai.generate` recibe 403 en `POST /api/admin/ia/generar` (cubierto por tests GTK-38).
- [ ] SEC-2: La pestaña IA no se renderiza si `can(session, 'ai.generate')` es falso.
- [ ] SEC-3: El formulario IA no expone campos de leads/proyectos.
- [ ] SEC-4: 429 `BUDGET_EXCEEDED` muestra aviso y no vuelca salida al formulario.
