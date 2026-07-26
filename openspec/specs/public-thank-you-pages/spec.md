# public-thank-you-pages Specification

## Purpose

Páginas Thank You de URL única por tipo de conversión (presupuesto, licitación, ubicación, recurso), `noindex`, confirmación con referencia y señal GA4 en cliente. Materializado con GTK-63.

## Requirements

### Requirement: Thank You por tipo con URL estable y noindex

Las rutas `/gracias/presupuesto`, `/gracias/licitacion`, `/gracias/ubicacion` y `/gracias/recurso` SHALL renderizar en servidor una confirmación común parametrizada. Cada página SHALL emitir `robots: THANK_YOU_PAGE_ROBOTS` (`noindex, nofollow`) y SHALL NOT definir canonical indexable.

#### Scenario: Metadata noindex en presupuesto
- **WHEN** se solicita `/gracias/presupuesto`
- **THEN** el HTML incluye `meta name="robots"` con `noindex`

### Requirement: Referencia y copy alineado con email

Con `?ref=` válido, la página SHALL mostrar el número de referencia. El técnico y el plazo SHALL derivarse de `resolveTechnicianDisplayName()` y `RESPONSE_DEADLINE_COPY` sin copy duplicado en frontend.

#### Scenario: Sin ref en URL
- **WHEN** se accede sin `?ref=`
- **THEN** se muestra confirmación genérica sin número de referencia y la página sigue siendo noindex

### Requirement: Descarga de recurso vía query

La Thank You de recurso SHALL mostrar enlace de descarga solo si `?download=` contiene una ruta relativa permitida (`/api/recursos/download`); SHALL NOT reconstruir tokens.

#### Scenario: Download presente
- **WHEN** `?download=/api/recursos/download?token=abc` es válido
- **THEN** existe un enlace accesible con esa URL

### Requirement: Evento cliente único por referencia

`ThankYouConversionPing` SHALL empujar al `dataLayer` el evento de conversión del tipo correspondiente solo si hay `ref`, y SHALL NOT repetir el evento en recargas (clave `sessionStorage` `ty_fired:{ref}`). SHALL NOT invocar `recordConversionEvent` ni POST `/api/eventos`.

#### Scenario: Recarga sin duplicar
- **WHEN** el visitante recarga la Thank You con el mismo `ref` y consentimiento de analítica
- **THEN** el dataLayer no recibe un segundo evento de conversión para esa referencia

### Requirement: robots.txt excluye /gracias

`app/robots.ts` SHALL incluir `/gracias` y `/gracias/` en `disallow` además del noindex por página.

#### Scenario: robots.txt
- **WHEN** se solicita `/robots.txt`
- **THEN** la regla `disallow` incluye `/gracias`
