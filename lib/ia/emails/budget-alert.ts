export type BudgetAlertEmailProps = {
  billingPeriod: string;
  spendEur: number;
  budgetEur: number;
  thresholdPct: number;
};

export function buildBudgetAlertSubject(billingPeriod: string): string {
  return `[Geoteknia] Alerta presupuesto IA — ${billingPeriod}`;
}
