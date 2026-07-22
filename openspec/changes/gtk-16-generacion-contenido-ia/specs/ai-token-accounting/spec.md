## ADDED Requirements

### Requirement: Contabilidad de tokens por generación en ledger append-only

El sistema SHALL registrar el consumo de tokens de cada invocación a Claude en tabla `ai_token_usage` (append-only, una fila por generación). Cada registro captura:
- Modelo Claude utilizado (`model`).
- Tokens de entrada (`input_tokens`).
- Tokens de salida (`output_tokens`).
- Tokens leídos del cache (si activado, `cache_read_tokens`).
- Tokens escritos al cache (si activado, `cache_write_tokens`).
- Coste calculado en EUR (`cost_eur`, hasta 4 decimales).
- Período de facturación (`billing_period` en formato `YYYY-MM`).

#### Scenario: Registrar tokens de generación exitosa
- **WHEN** Claude retorna output exitoso consumiendo 150 input tokens, 250 output tokens, coste calculado = 0.0045 EUR
- **THEN** se crea `ai_token_usage` con `model='claude-sonnet-4-6'`, `input_tokens=150`, `output_tokens=250`, `cost_eur=0.0045`, `billing_period='2026-07'`, relación 1:1 a la `ai_generation`.

#### Scenario: Generación con cache hit
- **WHEN** Claude procesa prompt con `cacheable_prefix` cacheado previamente, leyendo 100 tokens del cache
- **THEN** se registra `cache_read_tokens=100`, `input_tokens=(resto nuevos)`, `cost_eur=(cálculo con descuento cache)`.

#### Scenario: Imposibilidad de actualizar o eliminar registro
- **WHEN** se intenta ejecutar UPDATE en `ai_token_usage`
- **THEN** operación es permitida por Prisma pero constituye violación de contrato (append-only). Tests unitarios detectan intentos.

### Requirement: Agregación de coste por período de facturación

El sistema SHALL permitir consultar el coste acumulado de generaciones IA por período de facturación (`billing_period`).

#### Scenario: Calcular gasto de julio
- **WHEN** consulta `SUM(cost_eur) FROM ai_token_usage WHERE billing_period='2026-07'`
- **THEN** retorna coste total en EUR consumido en julio (p. ej. 125.50).

#### Scenario: Listar generaciones por período
- **WHEN** RF-20 (admin dashboard) solicita generaciones de `billing_period='2026-07'`
- **THEN** retorna todas las `ai_token_usage` de ese mes, agregadas por modelo o por usuario, permitiendo análisis de gasto.
