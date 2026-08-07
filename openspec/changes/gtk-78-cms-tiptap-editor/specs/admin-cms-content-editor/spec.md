## MODIFIED Requirements

### Requirement: Editor rich text TipTap en campos HTML

Los campos `body` (servicio, zona, intersección, blog) y `answer` (FAQ) SHALL editarse con un editor TipTap headless con toolbar accesible, persistiendo HTML compatible con `sanitizeCmsHtml`.

#### Scenario: Edición con formato básico

- **WHEN** el usuario aplica negrita o un encabezado h2 en el cuerpo
- **THEN** el valor guardado contiene las etiquetas HTML correspondientes del allowlist

#### Scenario: Carga de contenido existente

- **WHEN** se abre un registro con HTML o texto plano legado
- **THEN** el editor muestra el contenido sin perder párrafos ni encabezados

### Requirement: Vista previa sanitizada y ampliada

La vista previa SHALL sanitizar HTML antes de renderizar y SHALL incluir preview para `service_zone_page` y `faq`.

#### Scenario: Preview de blog sin scripts

- **WHEN** el formulario contiene `<script>` en el cuerpo
- **THEN** la preview no ejecuta ni muestra el script
