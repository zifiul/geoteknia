# env-validation — delta GTK-26

## ADDED Requirements

### Requirement: Umbrales de rate limiting en entorno

El módulo `lib/env.ts` SHALL validar `RATE_LIMIT_LOGIN_PER_MIN` y `RATE_LIMIT_PUBLIC_PER_MIN` como enteros positivos con valores por defecto 5 y 20 respectivamente cuando no se definen en el entorno.

#### Scenario: Variables con valores válidos

- **WHEN** `RATE_LIMIT_LOGIN_PER_MIN` y `RATE_LIMIT_PUBLIC_PER_MIN` son enteros positivos
- **THEN** `env` expone ambos números tipados

#### Scenario: Variables ausentes usan defaults

- **WHEN** las variables no están definidas en el entorno de despliegue
- **THEN** `env.RATE_LIMIT_LOGIN_PER_MIN` es 5 y `env.RATE_LIMIT_PUBLIC_PER_MIN` es 20

### Requirement: Placeholders opcionales Upstash

El schema de `lib/env.ts` SHALL aceptar `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` como cadenas opcionales sin exigirlas en el arranque del MVP in-memory.

#### Scenario: Sin Upstash configurado

- **WHEN** las variables Upstash no están definidas
- **THEN** el arranque del servidor Node continúa sin error y los campos opcionales quedan `undefined`
