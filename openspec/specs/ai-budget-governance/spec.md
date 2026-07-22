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
