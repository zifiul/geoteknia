## ADDED Requirements

### Requirement: Presupuesto mensual configurable (admin)

El sistema SHALL permitir a usuarios con permiso `ai.configure` crear o actualizar la configuración de presupuesto en `ai_budget_config`, con validación Zod: `monthlyBudgetEur > 0`, `alertThresholdPct` entre 1 y 100, `billingPeriod` opcional en formato `YYYY-MM`, `modelByPageType` opcional con claves `PromptPageType` y valores `AiModel`, y `notifyEmails` opcional (lista de emails internos).

#### Scenario: Admin actualiza presupuesto global
- **WHEN** un admin envía `updateBudgetConfigAction` con presupuesto mensual 500 EUR y umbral 80 %
- **THEN** se persiste o actualiza la fila global (`billing_period` NULL) y se registra `audit_logs` con acción `ai_config_update` y metadata saneada (`previousBudget`, `newBudget`).

#### Scenario: Sin permiso ai.configure
- **WHEN** un usuario con rol `editor` invoca la acción de configuración
- **THEN** el servidor responde con denegación RBAC (403) sin modificar la configuración.

### Requirement: Agregación de gasto por periodo UTC

El sistema SHALL calcular `getCurrentSpend(period)` como suma de `cost_eur` en `ai_token_usage` donde `billing_period = period` (mes UTC `YYYY-MM`).

#### Scenario: Aislar periodos
- **WHEN** existen usos en `2026-06` y `2026-07`
- **THEN** `getCurrentSpend('2026-07')` solo incluye filas de julio.

### Requirement: Guardarraíl assertWithinBudget

El sistema SHALL exponer `assertWithinBudget(period)` para invocar antes de cada generación (GTK-38). Si existe configuración activa y `getCurrentSpend(period) >= monthly_budget_eur`, SHALL lanzar `BudgetExceededError` con código `BUDGET_EXCEEDED` (HTTP 429) sin llamar a Claude.

#### Scenario: Gasto bajo el tope
- **WHEN** presupuesto 100 EUR y gasto 40 EUR
- **THEN** `assertWithinBudget` resuelve sin error.

#### Scenario: Gasto en el tope
- **WHEN** presupuesto 100 EUR y gasto 100 EUR
- **THEN** `assertWithinBudget` lanza `BudgetExceededError`.

#### Scenario: Sin configuración activa
- **WHEN** no hay fila activa en `ai_budget_config`
- **THEN** el guardarraíl permite la operación (fail-open) y registra advertencia estructurada sin PII.

### Requirement: Alerta por umbral idempotente durable

El sistema SHALL enviar como máximo un email de alerta por periodo cuando `spend >= monthly_budget_eur * (alert_threshold_pct / 100)`, persistiendo el envío en `ai_budget_alerts` para sobrevivir redeploys.

#### Scenario: Primera superación de umbral
- **WHEN** gasto cruza el 80 % del presupuesto y no existe fila en `ai_budget_alerts` para el periodo
- **THEN** se envía email a `notify_emails` y se crea el marcador durable.

#### Scenario: Segunda comprobación mismo periodo
- **WHEN** ya existe marcador para el periodo
- **THEN** no se reenvía email.

### Requirement: Reporte de coste (ai.read)

El sistema SHALL exponer un reporte agregado por periodo, modelo y tipo de página (`getCostReport`) accesible con permiso `ai.read` (solo admin en la matriz actual).

#### Scenario: Desglose por modelo
- **WHEN** se consulta el reporte del periodo con usos de dos modelos
- **THEN** la respuesta incluye totales por cada `AiModel`.
