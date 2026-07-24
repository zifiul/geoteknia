export const BUDGET_EXCEEDED_CODE = 'BUDGET_EXCEEDED' as const;

export class BudgetExceededError extends Error {
  readonly code = BUDGET_EXCEEDED_CODE;
  readonly status = 429;

  constructor() {
    super('Presupuesto mensual de IA alcanzado');
    this.name = 'BudgetExceededError';
  }
}

export const AI_GENERATION_ERROR_CODE = 'AI_GENERATION_FAILED' as const;

export class AiGenerationError extends Error {
  readonly code = AI_GENERATION_ERROR_CODE;
  readonly transient: boolean;
  readonly httpStatus?: number;

  constructor(message: string, options: { transient: boolean; httpStatus?: number }) {
    super(message);
    this.name = 'AiGenerationError';
    this.transient = options.transient;
    this.httpStatus = options.httpStatus;
  }
}
