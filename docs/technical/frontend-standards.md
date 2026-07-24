# Estándares de Frontend — Geoteknia

> Convenciones de desarrollo frontend para la web corporativa B2B de Geoteknia. Aplica al sitio público, landings SEO, formularios de captación, microconversiones, blog, casos de estudio, recursos descargables y portal interno `/admin` construido sobre Next.js App Router.

---

## 1. Introducción

Este documento define los estándares frontend del proyecto Geoteknia. El sistema es un **monolito modular Next.js full-stack** orientado a captación B2B, SEO programático, Core Web Vitals en verde, contenido técnico geotécnico, formularios de lead cualificado y portal interno con RBAC.

El frontend no es una SPA aislada. Debe aprovechar las capacidades nativas de Next.js:

- **Server Components** para renderizar contenido indexable, rápido y con mínima carga JavaScript.
- **Client Components** solo cuando exista interacción real en navegador.
- **SSG + ISR on-demand** para páginas públicas publicables desde el CMS sin redeploy.
- **Metadata API, sitemap y JSON-LD** como infraestructura SEO obligatoria.
- **Route Handlers y Server Actions** como frontera segura para formularios y mutaciones.

Las decisiones frontend deben proteger tres prioridades del producto:

1. **SEO y captación de leads cualificados** por servicio, provincia, tipología, canal y origen.
2. **Mobile First y rendimiento real en móvil**, con Core Web Vitals como quality gate.
3. **Confianza B2B y cumplimiento**, especialmente accesibilidad, RGPD, Consent Mode v2 y aislamiento de `/admin`.

---

## 2. Stack Tecnológico

### 2.1 Tecnologías principales


| Capa                   | Estándar                                                                  |
| ---------------------- | ------------------------------------------------------------------------- |
| Framework              | Next.js 15 con App Router                                                 |
| UI runtime             | React 19                                                                  |
| Lenguaje               | TypeScript en modo estricto                                               |
| Renderizado público    | SSG, Server Components e ISR on-demand                                    |
| Estilos                | CSS Modules, Tailwind CSS o sistema de diseño local definido por tokens   |
| Validación formularios | Zod compartido con backend                                                |
| Formularios            | React Hook Form cuando haya formularios complejos o multipaso             |
| Imágenes               | `next/image` con AVIF/WebP, tamaños explícitos y lazy loading             |
| SEO                    | Metadata API, JSON-LD tipado, sitemap dinámico, canonical explícito       |
| Analítica              | GTM + GA4 + Consent Mode v2, bloqueado hasta consentimiento               |
| Testing                | Vitest/Testing Library para componentes y Playwright para flujos críticos |
| Rendimiento            | Lighthouse CI como gate de despliegue                                     |


### 2.2 Principios de uso del stack

- Usar TypeScript para todo código nuevo.
- Priorizar Server Components por defecto.
- Organizar componentes UI con metodología **Atomic Design** de forma obligatoria.
- Marcar un componente con `"use client"` solo si usa estado, eventos, APIs del navegador, formularios interactivos o librerías client-only.
- No importar Prisma, Auth.js server-side, Anthropic, Resend, secretos ni módulos `server-only` desde componentes cliente.
- Mantener la lógica de negocio en `/lib`; el componente debe orquestar presentación, no reglas de dominio.
- Evitar dependencias UI pesadas si un componente local resuelve el caso con menor coste de bundle.

---

## 3. Estructura del Proyecto

La estructura recomendada para el frontend es:

```text
app/
├── (public)/                         # Sitio público indexable
│   ├── page.tsx                      # Home con LocalBusiness schema
│   ├── servicios/[slug]/page.tsx     # Landings de servicio
│   ├── zonas/[slug]/page.tsx         # Geo-landings
│   ├── servicios/[service]/[zone]/page.tsx
│   ├── casos/[slug]/page.tsx         # Casos de estudio
│   ├── blog/[category]/[slug]/page.tsx
│   ├── recursos/[slug]/page.tsx
│   ├── contacto/page.tsx
│   └── gracias/[type]/page.tsx
├── admin/                            # Portal interno protegido y noindex
├── api/                              # Route Handlers, no UI
├── layout.tsx
├── sitemap.ts
├── robots.ts
└── not-found.tsx

components/
├── atoms/                            # Primitivas indivisibles: Button, Input, Badge
├── molecules/                        # Composiciones pequeñas: FormField, SearchBox
├── organisms/                        # Bloques funcionales: Header, LeadForm, CaseGrid
├── templates/                        # Estructuras de página sin datos finales
├── seo/                              # JSON-LD, metadatos auxiliares
├── forms/                            # Schemas UI y subcomponentes de formularios complejos
├── admin/                            # Componentes del portal interno
└── analytics/                        # Consent banner, dataLayer, tracking

lib/
├── content/                          # Queries y view models de contenido
├── leads/                            # Schemas y helpers compartidos de formularios
├── seo/                              # Slugs, metadata, canonical, schema builders
├── analytics/                        # Eventos canónicos y helpers de dataLayer
├── validations/                      # Schemas Zod compartidos
└── shared/                           # Utilidades puras

styles/
├── globals.css
└── tokens.css

tests/
├── unit/
└── e2e/
```

Si la estructura final cambia, debe conservar la intención: rutas públicas indexables separadas de `/admin`, Atomic Design como taxonomía de componentes, SEO centralizado y formularios conectados a schemas compartidos.

---

## 4. Convenciones de Código

### 4.1 Idioma

El proyecto documenta en español. En frontend:

- Comentarios, documentación interna, textos visibles, mensajes de error de usuario y commits: **español**.
- Variables, funciones, tipos, componentes y ficheros: preferentemente **inglés técnico** para mantener coherencia con React/Next.js.
- Slugs públicos: español, ASCII, minúsculas y estables.
- Claves JSON, eventos de analítica, `data-testid` y enums técnicos: inglés o formato canónico definido por el modelo.

Ejemplo:

```typescript
type BudgetLeadFormProps = {
  defaultServiceSlug?: string;
  defaultProvinceSlug?: string;
};

const submitLabel = isSubmitting ? 'Enviando...' : 'Solicitar presupuesto';
```

### 4.2 Nombres


| Elemento                | Convención                                  | Ejemplo                          |
| ----------------------- | ------------------------------------------- | -------------------------------- |
| Componentes React       | `PascalCase`                                | `BudgetLeadForm`                 |
| Hooks                   | `camelCase` con prefijo `use`               | `useMultiStepForm`               |
| Variables y funciones   | `camelCase`                                 | `trackConversionEvent`           |
| Tipos e interfaces      | `PascalCase`                                | `ServiceLandingViewModel`        |
| Constantes globales     | `UPPER_SNAKE_CASE`                          | `MAX_RELATED_CASES`              |
| Ficheros de componentes | `PascalCase.tsx` o patrón local consistente | `ServiceHero.tsx`                |
| Ficheros de utilidades  | `kebab-case.ts`                             | `build-canonical-url.ts`         |
| CSS classes             | `kebab-case`                                | `service-card`                   |
| Rutas públicas          | `kebab-case` en español                     | `/servicios/sondeos-geotecnicos` |


### 4.3 TypeScript

- Activar `strict`.
- Tipar props de componentes y retornos públicos de helpers exportados.
- Evitar `any`; usar `unknown`, tipos derivados de Zod o tipos explícitos.
- No duplicar tipos si pueden derivarse de schemas compartidos.
- Modelar estados UI con uniones discriminadas cuando haya carga, error y éxito.

```typescript
type FormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; reference: string }
  | { status: 'error'; message: string };
```

### 4.4 Componentes

- Usar componentes funcionales.
- Clasificar cada componente UI según Atomic Design antes de crearlo.
- Preferir Server Components para contenido estático, páginas SEO, listados y fichas.
- Usar Client Components para formularios, menús interactivos, filtros, calculadora, consent banner y widgets de contacto.
- Mantener props pequeñas y orientadas a la vista.
- Extraer componentes cuando reduzcan duplicación real entre plantillas de servicio, zona, caso o blog.
- Evitar componentes genéricos prematuros que oculten diferencias importantes de SEO, conversión o accesibilidad.

---

## 5. App Router y Renderizado

### 5.1 Server Components por defecto

Las páginas públicas deben cargar datos en servidor y entregar HTML completo:

```typescript
export default async function ServicePage({ params }: PageProps) {
  const page = await getServiceLanding(params.slug);

  return <ServiceLanding page={page} />;
}
```

No convertir una página completa en Client Component por necesitar una interacción puntual. Aislar la parte interactiva:

```text
ServiceLanding.server.tsx
└── BudgetLeadForm.client.tsx
```

### 5.2 Estrategia de renderizado


| Tipo de página               | Estrategia                                |
| ---------------------------- | ----------------------------------------- |
| Home                         | SSG/ISR                                   |
| Landing de servicio          | SSG/ISR                                   |
| Geo-landing                  | SSG/ISR                                   |
| Intersección servicio + zona | SSG/ISR, con control de thin content      |
| Caso de estudio              | SSG/ISR                                   |
| Blog/artículo                | SSG/ISR                                   |
| FAQ y recursos               | SSG/ISR                                   |
| Thank you pages              | `noindex`, render estable                 |
| Portal `/admin`              | Dinámico, protegido por sesión            |
| Resultados filtrados         | Evitar indexación salvo páginas canónicas |


### 5.3 Revalidación

- La publicación desde el CMS debe disparar `revalidatePath` o `revalidateTag`.
- Usar tags por dominio: `services`, `zones`, `case-studies`, `blog`, `resources`, `sitemap`.
- No depender de redeploy para publicar contenido editorial.
- Tras publicar, actualizar también sitemap y rutas relacionadas si cambian enlaces internos.

---

## 6. SEO Técnico

### 6.1 Metadata

Cada página indexable debe definir:

- `title` único y orientado a intención de búsqueda.
- `description` entre 120 y 155 caracteres cuando sea posible.
- Canonical explícita.
- Open Graph básico.
- Alternativas solo si existe multidioma real.
- `robots` con `noindex` cuando aplique.

Usar helpers centralizados en `/lib/seo` para evitar divergencias.

### 6.2 JSON-LD

Implementar datos estructurados según plantilla:


| Página          | Schema recomendado                           |
| --------------- | -------------------------------------------- |
| Home            | `LocalBusiness` o `ProfessionalService`      |
| Servicio        | `Service` + `BreadcrumbList`                 |
| Geo-landing     | `Service`/`LocalBusiness` + `BreadcrumbList` |
| Caso de estudio | `Article` o `CreativeWork`                   |
| Blog            | `Article`                                    |
| Equipo          | `Person`                                     |
| Acreditaciones  | `Organization`                               |
| FAQ             | `FAQPage`                                    |
| Recursos        | `CreativeWork`                               |


Los builders de schema deben validar que no se emite JSON-LD incompleto, duplicado o incoherente con el contenido visible.

### 6.3 URLs, canonical y noindex

- Las URLs públicas deben ser legibles, estables y sin IDs internos.
- No indexar `/admin`, thank you pages, previews, búsquedas internas, filtros combinatorios sin curación, parámetros UTM ni variantes duplicadas.
- Las páginas de intersección servicio + zona solo deben indexarse si tienen contenido original suficiente y valor de búsqueda.
- Evitar contenido thin en geo-landings; si no hay contenido útil, dejar la ruta en borrador o `noindex`.

### 6.4 Enlazado interno

- Cada servicio debe enlazar a casos, zonas, FAQs y formulario contextual.
- Cada geo-landing debe enlazar a servicios disponibles, casos de la zona y CTA con provincia preseleccionada.
- Cada caso debe enlazar al servicio, zona y presupuesto contextual.
- Cada artículo debe enlazar a servicios o recursos relacionados cuando aporte intención comercial real.

---

## 7. Formularios y Conversión

### 7.1 Formularios principales

Los formularios de captación prioritarios son:

- Solicitud de presupuesto multipaso.
- Envío de ubicación o referencia catastral.
- Descarga de lead magnet.
- Contacto para licitaciones.
- Calculadora de alcance geotécnico.
- Click-to-call, WhatsApp y email segmentados.

### 7.2 Reglas de implementación

- Usar inputs controlados o React Hook Form en formularios complejos.
- Validar en cliente para UX y en servidor como fuente de verdad.
- Compartir schemas Zod entre frontend y backend cuando sea viable.
- Mostrar progreso claro en formularios multipaso.
- Permitir prefill desde URL segura: `servicio`, `provincia`, `tipo_obra`.
- Deshabilitar submit durante el envío.
- Mostrar confirmación con número de referencia cuando exista.
- Redirigir a thank you page solo si aporta medición o UX clara.
- No registrar PII en consola, dataLayer, Sentry breadcrumbs ni eventos GA4.

### 7.3 Estados de carga y error

Todo flujo asíncrono debe contemplar:

- Estado inicial.
- Estado enviando/cargando.
- Éxito con feedback accionable.
- Error recuperable con mensaje claro.
- Error de validación por campo.

Los mensajes al usuario final deben estar en español y evitar detalles internos:

```typescript
setFormError('No hemos podido enviar la solicitud. Inténtalo de nuevo en unos minutos.');
```

### 7.4 Anti-spam y consentimiento

- Formularios públicos con riesgo de spam deben integrar Cloudflare Turnstile.
- El token de Turnstile se valida siempre en servidor.
- No cargar etiquetas de marketing hasta tener consentimiento válido.
- La ausencia de consentimiento no debe impedir enviar formularios necesarios.

---

## 8. UI/UX y Sistema de Diseño

### 8.1 Principios visuales

La interfaz debe transmitir solvencia técnica, claridad y rapidez de contacto:

- Jerarquía clara: problema, servicio, metodología, normativa, casos, CTA.
- CTAs visibles y contextuales, sin saturar la página.
- Diseño mobile-first para usuarios en obra o desplazamiento.
- Lenguaje técnico preciso sin convertir la UI en un informe largo.
- Prueba de confianza: casos reales, acreditaciones, equipo, maquinaria y normativa.

### 8.2 Mobile First

El diseño y desarrollo deben partir siempre de dispositivos móviles. En Geoteknia, una parte relevante de los usuarios puede consultar la web desde obra, durante desplazamientos o en situaciones de urgencia técnica; por tanto, la experiencia móvil no es una adaptación secundaria del escritorio.

- Diseñar primero para el viewport móvil y ampliar después a tablet y desktop mediante mejoras progresivas.
- Priorizar contenido, CTAs y formularios críticos en móvil antes de añadir layouts complejos de escritorio.
- Usar breakpoints como mejora de espacio, no como solución a contenido mal jerarquizado.
- Evitar interacciones que dependan de hover; toda acción debe funcionar con touch y teclado.
- Mantener objetivos táctiles cómodos, con separación suficiente entre botones, enlaces y controles.
- Reducir pasos, campos visibles y carga cognitiva en formularios móviles.
- Validar visualmente cada plantilla crítica en móvil antes de darla por terminada.
- Considerar conexión móvil y dispositivos de gama media al añadir imágenes, mapas, scripts o widgets.

### 8.3 Atomic Design

El uso de **Atomic Design es obligatorio** para organizar, diseñar y evolucionar componentes frontend. Cada componente nuevo debe ubicarse en el nivel más bajo que represente correctamente su responsabilidad.


| Nivel      | Responsabilidad                                                                              | Ejemplos Geoteknia                                                                     |
| ---------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Átomos     | Primitivas indivisibles, sin conocimiento de dominio                                         | `Button`, `Input`, `Label`, `Badge`, `Icon`, `Spinner`                                 |
| Moléculas  | Combinaciones pequeñas de átomos con una función UI concreta                                 | `FormField`, `SearchBox`, `PhoneLink`, `ProvinceSelect`, `StepIndicator`               |
| Organismos | Bloques funcionales completos que combinan moléculas y pueden conocer un contexto de dominio | `SiteHeader`, `BudgetLeadForm`, `ServiceHero`, `CaseStudyGrid`, `ConsentBanner`        |
| Templates  | Estructuras de página que definen layout, jerarquía y slots sin acoplarse a una URL concreta | `ServiceLandingTemplate`, `GeoLandingTemplate`, `ArticleTemplate`, `AdminListTemplate` |
| Pages      | Rutas de Next.js en `app/**/page.tsx`; cargan datos, metadata y componen templates           | `app/(public)/servicios/[slug]/page.tsx`                                               |


Reglas de aplicación:

- No saltar directamente a organismos si el bloque puede expresarse como átomo o molécula reutilizable.
- Los átomos no deben importar moléculas, organismos, datos de dominio, hooks de negocio ni analytics.
- Las moléculas pueden coordinar varios átomos, pero no deben cargar datos ni ejecutar mutaciones.
- Los organismos pueden contener interacción y contexto de dominio, pero la lógica de negocio debe vivir en `/lib`.
- Los templates deben recibir datos ya preparados o view models y componer organismos sin conocer detalles de fetching.
- Las pages del App Router son responsables de `generateMetadata`, carga de datos, `notFound`, ISR y composición final.
- Si un componente solo se usa en un dominio, puede vivir en una subcarpeta de su nivel: `components/organisms/leads/BudgetLeadForm.tsx`.
- Evitar carpetas genéricas como `misc`, `common` o `shared` para componentes sin clasificación clara.

Ejemplo recomendado:

```text
components/
├── atoms/
│   ├── Button.tsx
│   └── Input.tsx
├── molecules/
│   ├── FormField.tsx
│   └── PhoneLink.tsx
├── organisms/
│   ├── leads/BudgetLeadForm.tsx
│   └── layout/SiteHeader.tsx
└── templates/
    └── ServiceLandingTemplate.tsx
```

### 8.4 Componentes base

El sistema de diseño debe cubrir como mínimo:

- `Button`, `LinkButton`.
- `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`.
- `FormField`, `FieldError`, `StepIndicator`.
- `Card`, `Badge`, `Alert`.
- `Breadcrumbs`.
- `Container`, `Section`, `Grid`.
- `Modal` o `Dialog` accesible si se usa.
- `Tabs`/`Accordion` accesibles para FAQs y contenido técnico.

Los componentes base deben ser accesibles por defecto y no depender de estilos globales frágiles.

### 8.5 Navegación

- Header público claro, con servicios, zonas, casos, recursos y contacto.
- CTA de presupuesto persistente o fácilmente accesible en móvil.
- Breadcrumbs en páginas profundas.
- Footer con NAP, cobertura, enlaces legales, acreditaciones y acceso no destacado a `/admin`.
- `/admin` debe tener navegación separada del sitio público.

### 8.6 Contenido técnico

- Evitar bloques interminables sin escaneo visual.
- Usar tablas solo cuando mejoren comparación técnica.
- Mostrar normativa aplicable de forma verificable.
- Diferenciar contenido editorial, comercial y legal.
- No ocultar CTAs detrás de interacciones innecesarias.

---

## 9. Accesibilidad

El estándar mínimo es WCAG 2.2 AA para plantillas críticas.

- Usar HTML semántico: `header`, `nav`, `main`, `section`, `article`, `footer`.
- Mantener orden lógico de encabezados.
- Asegurar navegación completa por teclado.
- Usar foco visible en todos los elementos interactivos.
- Asociar labels reales a inputs.
- Añadir `aria-label` solo cuando el texto visible no sea suficiente.
- Proporcionar `alt` útil en imágenes informativas y `alt=""` en decorativas.
- No depender solo del color para estados o errores.
- Respetar contraste mínimo.
- Evitar captchas o widgets que bloqueen tecnología asistiva.

Los formularios críticos deben anunciar errores por campo y resumen de error cuando proceda.

---

## 10. Rendimiento y Core Web Vitals

### 10.1 Objetivos


| Métrica                  | Objetivo                     |
| ------------------------ | ---------------------------- |
| LCP                      | < 2,5 s                      |
| INP                      | < 200 ms                     |
| CLS                      | < 0,1                        |
| Lighthouse Performance   | >= 90 en plantillas críticas |
| Lighthouse Accessibility | >= 95 en plantillas críticas |


### 10.2 Reglas de rendimiento

- Server Components por defecto para reducir JavaScript.
- No importar librerías pesadas en layouts globales.
- Cargar widgets de terceros bajo demanda y tras consentimiento cuando aplique.
- Usar `next/image` con `sizes`, dimensiones conocidas y prioridad solo para imagen hero crítica.
- Evitar cambios de layout reservando espacio para imágenes, banners y formularios.
- Usar fuentes optimizadas con `next/font` y subsets mínimos.
- Hacer code splitting en componentes interactivos no críticos.
- Revisar bundle si se añade una dependencia UI, mapas, gráficos o editor enriquecido.

### 10.3 Plantillas críticas

Lighthouse CI debe cubrir al menos:

- Home.
- Landing de servicio.
- Geo-landing.
- Intersección servicio + zona.
- Caso de estudio.
- Artículo de blog.
- Formulario de presupuesto.
- Login de `/admin`.

---

## 11. Analítica, Consent Mode y Eventos

### 11.1 Principios

- GA4/GTM no son fuente de verdad para leads; la base de datos lo es.
- No enviar PII a GA4, GTM, dataLayer, Sentry o herramientas de marketing.
- Los eventos deben ser estables, documentados y reutilizables.
- Consent Mode v2 debe bloquear o ajustar tags según consentimiento.

### 11.2 Eventos canónicos


| Evento              | Uso                                      |
| ------------------- | ---------------------------------------- |
| `generate_lead`     | Formulario de presupuesto enviado        |
| `send_location`     | Ubicación o referencia catastral enviada |
| `resource_download` | Lead magnet descargado                   |
| `calculator_use`    | Calculadora completada                   |
| `click_tel`         | Clic en teléfono                         |
| `click_whatsapp`    | Clic en WhatsApp                         |
| `click_email`       | Clic en email                            |
| `scroll_depth`      | Profundidad de lectura                   |


Los parámetros permitidos deben evitar PII:

```typescript
type ConversionEventPayload = {
  serviceSlug?: string;
  provinceSlug?: string;
  leadType?: 'presupuesto' | 'licitacion' | 'recurso' | 'ubicacion';
  sourcePage: string;
};
```

### 11.3 DataLayer

- Centralizar helpers de `dataLayer` en `/lib/analytics` o `components/analytics`.
- Comprobar existencia de `window` antes de acceder desde cliente.
- No duplicar eventos por re-render.
- En formularios, disparar eventos solo tras confirmación del servidor.

---

## 12. Portal Admin

### 12.1 Aislamiento

- Todo `/admin` debe estar protegido por Auth.js, RBAC y 2FA según rol.
- Añadir `noindex` a layouts y páginas admin.
- No enlazar `/admin` como CTA público destacado.
- No compartir layouts públicos si arrastran scripts de marketing innecesarios.

### 12.2 UX interna

El portal admin prioriza eficiencia y trazabilidad:

- Listados con filtros por estado, servicio, provincia, autor y fecha.
- Estados editoriales visibles: borrador IA, en revisión, aprobado, publicado, rechazado, despublicado.
- Acciones destructivas con confirmación.
- Feedback claro tras guardar, publicar, aprobar o revalidar.
- Indicar cuándo una acción genera audit log o revalidación ISR.

### 12.3 Seguridad en cliente

- La UI puede ocultar acciones no permitidas, pero el servidor valida permisos siempre.
- No exponer permisos sensibles, tokens ni datos innecesarios en props cliente.
- Evitar almacenar datos sensibles en `localStorage`.
- Limpiar estados al cerrar sesión.

### 12.4 Cuenta y segundo factor (GTK-24)

- Ruta interna `app/(admin)/perfil/seguridad/`: Server Component con `metadata.robots` `noindex`, redirección si no hay sesión portal.
- Formulario cliente (`totp-setup-form.tsx`): labels asociados, `role="alert"` en errores, `role="status"` en mensajes de éxito; QR solo durante enrolamiento (data-URL generada en servidor).
- Copy y mensajes de error en español; no mostrar el secreto Base32 en UI (solo QR / instrucciones durante enrolamiento pendiente).

---

## 13. Testing

### 13.1 Unit y componentes

Usar Vitest y Testing Library para:

- Componentes base accesibles.
- Helpers de SEO y JSON-LD.
- Builders de metadata.
- Validaciones de formularios.
- Lógica de steps en formularios multipaso.
- Helpers de analítica sin PII.

Los tests deben comprobar comportamiento observable, no detalles internos de implementación.

### 13.2 E2E con Playwright

Playwright debe cubrir flujos críticos:

- Envío de presupuesto multipaso con éxito.
- Validaciones y errores del formulario.
- Envío de ubicación de parcela.
- Descarga de recurso técnico.
- Click-to-call/WhatsApp/email con evento esperado.
- Navegación de servicio a caso, zona y formulario contextual.
- Login admin + 2FA.
- Flujo editorial: borrador IA → revisión → aprobado → publicado.

### 13.3 SEO y accesibilidad en pruebas

- Validar presencia de canonical, metadata básica y JSON-LD en plantillas críticas.
- Comprobar que `/admin` y thank you pages no se indexan.
- Ejecutar checks de accesibilidad en flujos principales.
- Incluir pruebas de sitemap/robots cuando cambie la lógica de indexación.

---

## 14. Configuración

### 14.1 TypeScript

Configurar TypeScript con:

- `strict: true`.
- Path aliases consistentes, preferentemente `@/*`.
- Tipos de Node, Vitest y Playwright cuando correspondan.
- `noUncheckedIndexedAccess` recomendado si el coste de migración es asumible.

### 14.2 ESLint y formato

- Usar la configuración recomendada de Next.js.
- Tratar warnings relevantes como deuda a resolver, no como ruido permanente.
- Mantener formato automatizado con Prettier o formatter estándar del proyecto.
- No desactivar reglas sin comentario que explique el motivo.

### 14.3 Variables de entorno públicas

- Solo exponer al cliente variables con prefijo `NEXT_PUBLIC_`.
- No poner secretos, claves de servidor, tokens de webhooks ni credenciales en variables públicas.
- Documentar variables necesarias para analítica, mapas, Turnstile site key y entorno.

---

## 15. Flujo de Desarrollo

- Trabajar en ramas pequeñas y enfocadas.
- Usar sufijos descriptivos cuando ayuden a separar trabajo paralelo, por ejemplo `-frontend`.
- Escribir commits descriptivos en español.
- Antes de abrir PR, ejecutar lint, typecheck y tests aplicables.
- Para componentes nuevos, justificar su nivel Atomic Design y reutilizar niveles inferiores existentes.
- Para cambios en plantillas públicas, revisar Lighthouse y SEO básico.
- Para cambios visuales o de interacción, validar primero la experiencia móvil.
- Para cambios en formularios, probar validación cliente, validación servidor y evento de conversión.
- Para cambios en `/admin`, revisar permisos, noindex y auditabilidad.

Scripts esperados:

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Si los nombres de scripts cambian, deben mantener esta intención.

---

## 16. Checklist de Pull Request Frontend

Antes de considerar una tarea frontend como terminada:

- La página o componente usa Server/Client Components de forma intencionada.
- No se han expuesto secretos ni dependencias server-only al cliente.
- Los textos visibles están en español.
- Los componentes nuevos respetan Atomic Design y están en el nivel correcto.
- La experiencia móvil se ha diseñado y validado antes de la versión desktop.
- La plantilla mantiene metadata, canonical y JSON-LD cuando aplica.
- Las imágenes usan `next/image` o una justificación clara.
- Los formularios validan en cliente y servidor.
- No se envía PII a analítica ni logs del navegador.
- Los estados de carga, error y éxito son claros.
- La navegación por teclado y labels de formularios funcionan.
- Las rutas indexables y `noindex` son correctas.
- Se han añadido o actualizado pruebas proporcionales al riesgo.
- Lighthouse no degrada plantillas críticas.

---

## 17. Estrategia de Evolución

### 17.1 MVP

Durante el MVP, priorizar:

- Plantillas SEO robustas para servicios, zonas, casos y blog.
- Formulario de presupuesto multipaso.
- Microconversiones de llamada, WhatsApp, email y ubicación.
- Consent banner funcional.
- Atomic Design mínimo viable: átomos, moléculas y organismos base suficientes, sin construir una librería excesiva.
- Playwright sobre los flujos que sostienen captación y publicación.

### 17.2 Fase 2

Cuando el portal crezca:

- Formalizar un design system con tokens, variantes y documentación.
- Añadir visual regression testing en plantillas críticas.
- Incorporar dashboards internos de rendimiento, conversión y coste IA.
- Evaluar extracción de componentes admin si el back-office evoluciona a producto propio.
- Añadir caching client-side solo donde aporte UX clara y no complique la consistencia.

Este documento sirve como base para mantener calidad, rendimiento y coherencia en el frontend de Geoteknia. Cualquier excepción debe justificarse por impacto de negocio, seguridad, SEO o mantenibilidad.