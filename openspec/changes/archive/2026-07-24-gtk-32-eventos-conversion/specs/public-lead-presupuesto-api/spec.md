## ADDED Requirements

### Requirement: Registro generate_lead tras alta de presupuesto

Tras persistir con éxito el lead de presupuesto (post-commit de la transacción CRM), el caso de uso SHALL invocar `recordConversionEvent` con `eventName=generate_lead`, `leadId` del lead creado y atributos de atribución disponibles (`serviceSlug`, `provinceSlug`, `leadType=presupuesto`, `source`, `value`/`estimatedValue` si aplica). La llamada SHALL ser best-effort: un fallo de telemetría SHALL NOT revertir ni alterar el `201` del endpoint.

#### Scenario: generate_lead registrado

- **WHEN** `createBudgetLead` completa la transacción contact+lead+project
- **THEN** se invoca `recordConversionEvent` con `eventName='generate_lead'` y el `leadId` creado

#### Scenario: Fallo de telemetría no rompe el alta

- **WHEN** `recordConversionEvent` devuelve `null` o rechaza internamente
- **THEN** el alta de lead sigue devolviendo éxito (`referenceNumber`) y no propaga el error al cliente
