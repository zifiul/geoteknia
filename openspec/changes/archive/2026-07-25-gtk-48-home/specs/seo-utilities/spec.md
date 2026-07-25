## ADDED Requirements

### Requirement: LocalBusiness schema extendido

`buildLocalBusinessSchema()` SHALL aceptar NAP (`address`, `telephone`, `email`), `areaServed` multivalor, `hasOfferCatalog` con `itemListElement` de servicios, y `aggregateRating` solo cuando `ratingValue` y `reviewCount` son válidos. Propiedades ausentes SHALL omitirse del JSON (no `null`).

#### Scenario: Catálogo de ofertas
- **WHEN** se pasa `offerCatalog.items` con al menos un servicio
- **THEN** el objeto incluye `hasOfferCatalog` con `@type` `OfferCatalog`
