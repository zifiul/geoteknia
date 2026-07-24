# ai-budget-governance Specification

## Purpose

Configuración de presupuesto mensual, umbrales de alerta y overrides de modelo por tipo de página para la gobernanza de coste IA. Materializa GTK-16 y RNF-IA.

## Requirements

### Requirement: Configuración de presupuesto mensual y alertas

El sistema SHALL almacenar configuración de presupuesto en tabla `ai_budget_config`, permitiendo:
- Presupuesto mensual global (en EUR, campo `monthly_budget_eur`).
- Umbral de alerta (% del presupuesto, p. ej. 80%, campo `alert_threshold_pct`).
- Overrides de modelo por tipo de página (JSON, p. ej. `{"blog": "claude-3-sonnet", "case_study": "claude-sonnet-4-6"}`, campo `model_by_page_type`).
- Correos de notificación cuando se alcanza umbral (`notify_emails`, JSON array).
- Configuración por período de facturación (NULL = global; `"2026-07"` = específico de julio).
- Estado activo/inactivo.

#### Scenario: Crear configuración global de presupuesto

- **WHEN** admin crea `ai_budget_config` con `billing_period=NULL`, `monthly_budget_eur=1000.00`, `alert_threshold_pct=80`, `notify_emails=["finance@geoteknia.es"]`
- **THEN** se almacena como configuración global aplicable a todos los meses sin override

#### Scenario: Override de presupuesto para período específico

- **WHEN** admin crea `ai_budget_config` con `billing_period='2026-08'`, `monthly_budget_eur=500.00` (reducido para prueba)
- **THEN** agosto usa 500 EUR, resto de meses usa configuración global

#### Scenario: Override de modelo por tipo de página

- **WHEN** admin configura `model_by_page_type={"blog": "claude-3-haiku", "case_study": "claude-sonnet-4-6"}`
- **THEN** blogs se generan con Haiku (más barato), case studies con Sonnet (más potente), overriding `default_model` de plantilla

#### Scenario: Alerta de umbral alcanzado

- **WHEN** gasto acumulado en `ai_token_usage` para `billing_period='2026-07'` alcanza `800.00 EUR` (80% de presupuesto 1000)
- **THEN** RF-19/RF-20 emite alerta (implementación del mecanismo en fase RF-19) y notifica `notify_emails`

### Requirement: Validación de límites de presupuesto

El sistema SHALL permitir a RF-19 consultar si una generación propuesta excedería el presupuesto configurado.

#### Scenario: Chequear presupuesto antes de generar

- **WHEN** RF-19 consulta `ai_budget_config` y calcula coste estimado de generación
- **THEN** retorna indicador de espacio disponible o alerta si se violaría `monthly_budget_eur` (implementación del bloqueo en RF-19)

#### Scenario: Desactivar presupuesto

- **WHEN** admin actualiza `ai_budget_config` con `is_active=false`
- **THEN** los límites y alertas no se aplican (permitir generación sin restricción, para debugging)

### Requirement: Presupuesto mensual configurable vía admin (GTK-37)

El sistema SHALL exponer `updateBudgetConfigAction` con permiso `ai.configure`, validación Zod (`monthlyBudgetEur > 0`, `alertThresholdPct` 1–100, `billingPeriod` opcional `YYYY-MM`, `modelByPageType` con claves `PromptPageType` y valores `AiModel`, `notifyEmails` opcional) y auditoría `ai_config_update` (mustAudit) con metadata `previousBudget` / `newBudget`.

#### Scenario: Admin actualiza presupuesto global

- **WHEN** un admin envía `updateBudgetConfigAction` con presupuesto mensual 500 EUR y umbral 80 %
- **THEN** se persiste o actualiza la fila global (`billing_period` NULL) y se registra `audit_logs` con acción `ai_config_update`

#### Scenario: Sin permiso ai.configure

- **WHEN** un usuario con rol `editor` invoca la acción de configuración
- **THEN** el servidor responde con denegación RBAC (403) sin modificar la configuración

### Requirement: Agregación de gasto por periodo UTC (GTK-37)

El sistema SHALL calcular `getCurrentSpend(period)` como suma de `cost_eur` en `ai_token_usage` donde `billing_period = period` (mes UTC `YYYY-MM`).

#### Scenario: Aislar periodos

- **WHEN** existen usos en `2026-06` y `2026-07`
- **THEN** `getCurrentSpend('2026-07')` solo incluye filas de julio

### Requirement: Guardarraíl assertWithinBudget (GTK-37)

El sistema SHALL exponer `assertWithinBudget(period?)` en `lib/ia/budget.ts` para invocar antes de cada generación (GTK-38). Si existe configuración activa y `getCurrentSpend(period) >= monthly_budget_eur`, SHALL lanzar `BudgetExceededError` (`BUDGET_EXCEEDED`, HTTP 429). Sin config activa: fail-open con advertencia estructurada sin PII.

#### Scenario: Gasto en el tope

- **WHEN** presupuesto 100 EUR y gasto 100 EUR
- **THEN** `assertWithinBudget` lanza `BudgetExceededError`

#### Scenario: Sin configuración activa

- **WHEN** no hay fila activa en `ai_budget_config`
- **THEN** el guardarraíl permite la operación (fail-open)

### Requirement: Alerta por umbral idempotente durable (GTK-37)

El sistema SHALL enviar como máximo un email de alerta por periodo cuando el gasto supera el umbral configurado, persistiendo el envío en `ai_budget_alerts` (`billing_period` PK).

#### Scenario: Segunda comprobación mismo periodo

- **WHEN** ya existe marcador en `ai_budget_alerts` para el periodo
- **THEN** no se reenvía email

### Requirement: Reporte de coste (GTK-37)

El sistema SHALL exponer `getCostReport` y vista `/ia/presupuesto` con permiso `ai.read`, con desglose por periodo, modelo y tipo de página.

#### Scenario: Desglose por modelo

- **WHEN** se consulta el reporte del periodo con usos de dos modelos
- **THEN** la respuesta incluye totales por cada `AiModel`
