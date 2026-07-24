export const BUDGET_EXCEEDED_CODE = 'BUDGET_EXCEEDED' as const;

export class BudgetExceededError extends Error {
  readonly code = BUDGET_EXCEEDED_CODE;
  readonly status = 429;

  constructor() {
    super('Presupuesto mensual de IA alcanzado');
    this.name = 'BudgetExceededError';
  }
}
