# public-tenders-page (delta GTK-58)

## ADDED Requirements

### Requirement: Página pública de licitaciones

El sistema SHALL exponer `/licitaciones` como RSC que muestra clasificación de contratista, experiencia por organismo público (con caso relacionado solo si está publicado) y formulario de captación de lead de licitación.

#### Scenario: Contenido de solvencia

- **WHEN** existen filas no borradas en `contractor_classifications` y `public_organism_experience`
- **THEN** la página renderiza tablas/listados ordenados y enlaces a casos de estudio publicados cuando `related_case_id` apunta a un `case_study` con `PUBLISHED_EDITORIAL_WHERE`

#### Scenario: Caso no publicado

- **WHEN** `related_case_id` apunta a un caso no publicado o borrado
- **THEN** la fila de experiencia no muestra enlace al caso

### Requirement: Formulario de licitación

El formulario cliente SHALL validar con `tenderLeadSchema` (mismo `superRefine` expediente o plataforma), enviar `POST /api/leads/licitacion` con token Turnstile y redirigir a `/gracias/licitacion?ref={referenceNumber}` en respuesta 201.

#### Scenario: Envío válido

- **WHEN** el usuario completa contacto corporativo, GDPR, Turnstile y expediente o URL de plataforma
- **THEN** el cliente llama a `/api/leads/licitacion` (no `/api/licitaciones`) y navega al thank-you con el número de referencia

#### Scenario: Errores API

- **WHEN** el servidor responde 400, 403 o 429
- **THEN** se muestran errores accesibles (`role="alert"`, `aria-invalid` en campos)

#### Scenario: Pre-relleno campaña

- **WHEN** la URL incluye `?organismo=` y/o `?expediente=` saneados
- **THEN** los campos `organismo` y `expedienteRef` se pre-rellenan

### Requirement: SEO del listado

La página SHALL publicar metadata orientada a subcontratación geotécnica, `canonical` a `/licitaciones`, `robots: index,follow` y JSON-LD `BreadcrumbList` (Inicio > Licitaciones).

#### Scenario: Metadata estática

- **WHEN** se solicita `/licitaciones`
- **THEN** `generateMetadata` fija canonical a `{SITE_URL}/licitaciones` sin query params

### Requirement: Navegación relacionada

La página SHALL incluir enlace visible a `/acreditaciones` aunque la ruta destino no esté implementada aún (GTK-59).

#### Scenario: Enlace acreditaciones

- **WHEN** se renderiza la página
- **THEN** existe un enlace con `href="/acreditaciones"` accesible por teclado

### Requirement: Analítica

El formulario SHALL emitir `form_start` y `form_step` vía `pushRawDataLayer` (engagement, sin mirror obligatorio a `/api/eventos`) y `generate_lead` con `leadType: licitacion` tras confirmación servidor 201.

#### Scenario: Conversión tras 201

- **WHEN** el servidor responde 201 con `referenceNumber`
- **THEN** el cliente empuja `generate_lead` con `leadType=licitacion` antes de redirigir al thank-you

### Requirement: Accesibilidad

El formulario SHALL usar labels asociadas, `aria-describedby` para ayudas y errores, foco al primer error en envío fallido y botón de envío con `aria-busy` durante la petición.

#### Scenario: Errores de campo

- **WHEN** falla la validación cliente
- **THEN** los campos inválidos tienen `aria-invalid="true"` y el mensaje asociado tiene `role="alert"`
