# Design — gtk-37-control-coste-ia

> US: [GTK-37](https://linear.app/geoteknia/issue/GTK-37)

## Decisiones (hallazgos Linear)

| # | Tema | Decisión |
|---|------|----------|
| 1 | Idempotencia alerta | Tabla `ai_budget_alerts` (`billing_period` PK/unique, `sent_at`). No idempotencia in-memory. |
| 2 | Auditoría | Nuevo valor `AuditAction.ai_config_update` (mustAudit). No reutilizar `content_update`. |
| 3 | RBAC reporte | Reporte con `ai.read` — solo `admin` tiene el permiso en matriz; no ampliar `editor`. |
| 4 | Sin config | **Fail-open** + `console.warn` estructurado; seed opcional vía `IA_DEFAULT_MONTHLY_BUDGET_EUR`. |
| 5 | Concurrencia | Límite **soft** (TOCTOU aceptado en MVP). |
| 6 | Modelos Zod | `z.nativeEnum(AiModel)` y claves validadas contra `PromptPageType`. |
| 7 | Periodo | Mes **UTC** `YYYY-MM` — `currentBillingPeriodUtc()` fuente única con GTK-38. |
| 8 | HTTP bloqueo | `BudgetExceededError` → código `BUDGET_EXCEEDED`, status **429**. |

## Arquitectura

```
app/(admin)/ia/presupuesto/actions.ts  → withPermission(ai.configure | ai.read)
        ↓
lib/ia/budget-config.ts (Zod) + updateBudgetConfig (tx + recordAudit)
lib/ia/budget.ts                       → spend, active config, assertWithinBudget, checkThresholdAndNotify
lib/ia/cost-report.ts                  → agregación Prisma + join pageType vía aiGeneration
lib/ia/emails/budget-alert.tsx         → sendEmail (best-effort)
```

`getActiveBudget(period)`: fila con `billing_period = period` activa; si no, fila global (`billing_period IS NULL`).

`checkThresholdAndNotify`: tras registrar uso (GTK-38) o en job explícito; crea `ai_budget_alerts` en la misma transacción lógica que el envío (insert alert first con unique constraint para idempotencia).

## Persistencia

```prisma
model AiBudgetAlert {
  billingPeriod String   @id @map("billing_period")
  sentAt        DateTime @default(now()) @map("sent_at")
  @@map("ai_budget_alerts")
}
```

Enum `AuditAction` += `ai_config_update`.

## Threat model

### Superficie de ataque

- Server Actions `updateBudgetConfigAction` (mutación) y carga de reporte en `app/(admin)/ia/presupuesto/`.
- Funciones internas `assertWithinBudget` / `checkThresholdAndNotify` (sin exposición HTTP directa).

### Actores

- Anónimo: sin acceso (rutas bajo `(admin)` + sesión portal).
- `editor` / `tecnico` / `gestor`: sin `ai.configure`; sin `ai.read` en matriz actual.
- `admin`: configura presupuesto y lee reporte.
- Atacante con sesión de rol inferior: intento de mutar presupuesto o ver costes.

### Datos sensibles

- Cifras de coste agregado (no PII de clientes).
- `notify_emails` en JSON — PII interna; no en logs ni metadata de auditoría.

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Escalada a config IA | Server Action sin RBAC | Sobrecoste / cambio de modelos | `withPermission('ai.configure')` solo admin |
| T2 | Lectura de costes por editor | Reporte sin authz | Fuga operativa | `requirePermission('ai.read')` en página |
| T3 | Payload malicioso en config | JSON arbitrario | Persistencia inválida / DoS | Zod estricto + límites de array emails |
| T4 | Re-alertas spam | Umbral cruzado N veces | Fatiga / coste email | Tabla `ai_budget_alerts` unique por periodo |
| T5 | PII en audit | Metadata con emails | RGPD | Whitelist `previousBudget`/`newBudget` numéricos |

### Requisitos de seguridad (criterios de aceptación)

- [ ] SEC-1: `updateBudgetConfigAction` sin `ai.configure` → 403 genérico.
- [ ] SEC-2: Reporte sin `ai.read` → 403.
- [ ] SEC-3: Input fuera de schema Zod → 400 sin persistir.
- [ ] SEC-4: Metadata de `ai_config_update` sin claves de email ni PII.
- [ ] SEC-5: `assertWithinBudget` no expone presupuesto en mensaje de error al cliente final (GTK-38 mapea error).

### Amenazas descartadas

- **Rate limit público:** no hay endpoint público nuevo.
- **Turnstile:** acciones solo autenticadas admin.
- **Prompt injection:** este ticket no invoca Claude.

## Contrato GTK-38

`assertWithinBudget(period?: string)` usa `period ?? currentBillingPeriodUtc()`. Lanza `BudgetExceededError` con `{ code: 'BUDGET_EXCEEDED', status: 429 }`. Fail-open sin config activa.
