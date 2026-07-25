## ADDED Requirements

### Requirement: Secreto de cron de publicación

El módulo `lib/env.ts` SHALL validar `CRON_SECRET` como cadena de al menos 32 caracteres en entornos de producción y preview donde se declare el cron en `vercel.json`. En desarrollo local MAY omitirse si el endpoint de cron no se invoca. El valor SHALL NOT exponerse al cliente ni loguearse.

#### Scenario: Secreto válido en producción

- **WHEN** `CRON_SECRET` tiene longitud ≥ 32 y se importa `lib/env.ts` en despliegue
- **THEN** `env.CRON_SECRET` está disponible server-side

#### Scenario: Secreto demasiado corto

- **WHEN** `CRON_SECRET` está definido pero tiene menos de 32 caracteres en entorno que lo exige
- **THEN** el arranque falla identificando `CRON_SECRET` sin volcar el valor
