# public-segmented-contact-channels

## Requirements

### Requirement: Lectura de canal por departamento

El sistema SHALL exponer `getContactChannelByDepartment(department: ContactDepartment)` que devuelve teléfono, WhatsApp, email y `prefilledMessageTemplate` del canal activo (`isActive`, `deletedAt` null) para ese departamento, o `null` si no existe.

#### Scenario: Canal de presupuestos activo

- **WHEN** existe un `contact_channels` activo con `department = presupuestos`
- **THEN** `getContactChannelByDepartment('presupuestos')` devuelve sus campos públicos incluyendo plantilla

#### Scenario: Sin canal activo

- **WHEN** no hay fila activa para el departamento
- **THEN** la función devuelve `null`

### Requirement: WhatsApp con mensaje pre-rellenado

El sistema SHALL construir URLs `https://wa.me/{digits}?text={encoded}` cuando se proporciona mensaje, interpolando plantilla `{{servicio}}` y `{{provincia}}` o un mensaje por defecto.

#### Scenario: Plantilla con contexto

- **WHEN** la plantilla es `Hola {{servicio}} en {{provincia}}` y hay etiquetas resueltas
- **THEN** el parámetro `text` contiene el texto interpolado codificado

### Requirement: Tracking contextual en CTAs de contacto

Los enlaces `tel:`, WhatsApp y `mailto:` de licitaciones SHALL disparar `click_tel`, `click_whatsapp` o `click_email` con `serviceSlug` y `provinceSlug` cuando el contexto de ruta o query los provea.

#### Scenario: Página de servicio

- **WHEN** el usuario pulsa llamar en `/servicios/{slug}`
- **THEN** el evento incluye `serviceSlug` igual al slug de la ruta

### Requirement: Cabecera desktop con teléfono y WhatsApp

En viewport desktop (`lg+`), la cabecera pública SHALL mostrar acceso a llamada y WhatsApp cuando el canal resuelto tenga esos medios.

#### Scenario: Desktop header

- **WHEN** el viewport es desktop y hay número de WhatsApp en el canal
- **THEN** aparecen controles de teléfono y WhatsApp en la cabecera

### Requirement: Regla de departamento por ruta

- `/servicios/**` y `/zonas/**` → canal `presupuestos` (fallback a canal general).
- `/licitaciones/**` → canal `licitaciones` (fallback a canal general).
- Resto → canal general (`getGeneralContactChannel`).
