# Design — GTK-75

## Decisiones

### Historial de versiones

Lista con metadatos (`versionNumber`, autor, `workflowStatusAt`, `createdAt`, `changeSummary`). **Sin diff visual** en esta entrega (mejora futura).

### Programación de publicación

- **Acciones:** `scheduleContentPublication(contentType, contentId, scheduledPublishAt ISO)` y `cancelScheduledPublication(contentType, contentId)`.
- **Permiso:** `content.publish` (misma sensibilidad que publicar).
- **Reglas:** solo `workflowStatus === aprobado`; fecha estrictamente futura (Zod `schedulePublishAtSchema`).
- **Persistencia:** `scheduledPublishAt` en el modelo editorial vía mapa de delegates (mismo patrón que `SCHEDULED_MODELS` en `publish.ts`).
- **Auditoría:** `content_update` con `event: 'schedule_publish' | 'cancel_schedule_publish'` y metadata saneada (sin PII).

### UI (Stitch A5)

Pantallas: workflow bar + historial (`d760a2e1…`), modales aprobar (`830a794c…`), rechazar (`8ec5a92a…`), publicar (`f57f259d…`), programar (`15d90343…`), estado publicado (`84fd042a…`), despublicar (`d5c75e98…`). Stepper: Borrador IA → En revisión → Aprobado → Publicado.

### Integración editor

`loadCmsEditorPage` expone `workflowStatus`, `scheduledPublishAt`, `slug`, `publicPath`, `revisions`, `canPublish`. `ContentEditor` monta `EditorialWorkflowPanel` solo en entidades existentes (`!isNew`).

## Threat model

### Superficie de ataque

- Server Actions de workflow y programación en `app/(admin)/(portal)/contenido/[type]/[id]/actions.ts`.
- Lectura de revisiones (`listContentRevisions`) desde RSC del portal admin.
- Componentes cliente con diálogos de confirmación.

### Actores

- Usuario autenticado del portal (`admin`, `gestor`, `editor`, `tecnico`) con permisos atómicos.
- Atacante con sesión de rol inferior intentando publicar/programar sin `content.publish`.

### Datos sensibles

- Contenido editorial no publicado (YMYL); sin PII de leads. Revisiones almacenan snapshots JSON del cuerpo/SEO.

### Amenazas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Publicar/programar sin permiso | Invocar Server Action | Contenido YMYL en vivo | `requirePermission('content.publish')` |
| T2 | Programar desde estado incorrecto | Payload manipulado | Cron publica contenido no revisado | Validar `aprobado` en servidor |
| T3 | Fecha pasada / spam de programación | Input malicioso | Comportamiento impredecible | Zod + validación servidor |
| T4 | IDOR en revisiones | UUID de otro contenido | Fuga de borradores | Lectura solo tras `content.read` en página; query acotada por type/id |
| T5 | XSS en notas de rechazo | Campo texto | Sesión admin | Escape React; Zod max length; sin `dangerouslySetInnerHTML` |

### Requisitos de seguridad

- [ ] SEC-1: `scheduleContentPublication` / `cancelScheduledPublication` rechazan sin `content.publish` → 403.
- [ ] SEC-2: Programación solo con `workflowStatus === aprobado` → conflicto si no.
- [ ] SEC-3: `scheduledPublishAt` pasado → `VALIDATION_ERROR`.
- [ ] SEC-4: `listContentRevisions` no mezcla entidades (filtro `contentType` + `contentId`).
