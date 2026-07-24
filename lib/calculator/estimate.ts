import {
  boreholesFormulaSchema,
  type CalculatorInput,
  type CalculatorPrefill,
} from './schema';

export type CalculatorRuleData = {
  id: string;
  createdAt: Date;
  minFloors: number | null;
  maxFloors: number | null;
  minAreaM2: number | null;
  maxAreaM2: number | null;
  boreholesFormula: unknown;
  depthEstimate: string | null;
  recommendedTests: string | null;
  cteReference: string | null;
};

export type EstimateSuccess = {
  boreholes: number;
  depthEstimate: string | null;
  recommendedTests: string | null;
  cteReference: string | null;
};

export type EstimateResult = EstimateSuccess | { noRule: true };

export class CalculatorFormulaError extends Error {
  constructor(message = 'Fórmula de sondeos inválida') {
    super(message);
    this.name = 'CalculatorFormulaError';
  }
}

export function buildPrefill(input: CalculatorInput): CalculatorPrefill {
  return {
    servicio: null,
    provincia: input.provincia,
    tipoObra: input.tipoObra,
    plantas: input.plantas,
    superficie: input.superficie,
  };
}

function matchesFloors(rule: CalculatorRuleData, plantas: number): boolean {
  if (rule.minFloors != null && plantas < rule.minFloors) {
    return false;
  }
  if (rule.maxFloors != null && plantas > rule.maxFloors) {
    return false;
  }
  return true;
}

function matchesArea(rule: CalculatorRuleData, superficie: number): boolean {
  if (rule.minAreaM2 != null && superficie < rule.minAreaM2) {
    return false;
  }
  if (rule.maxAreaM2 != null && superficie > rule.maxAreaM2) {
    return false;
  }
  return true;
}

/** Ancho del rango de área; extremos abiertos → Infinity (menor prioridad en desempate). */
export function areaSpan(rule: CalculatorRuleData): number {
  const min = rule.minAreaM2 ?? Number.NEGATIVE_INFINITY;
  const max = rule.maxAreaM2 ?? Number.POSITIVE_INFINITY;
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return Number.POSITIVE_INFINITY;
  }
  return max - min;
}

export function selectRule(
  rules: CalculatorRuleData[],
  plantas: number,
  superficie: number,
): CalculatorRuleData | null {
  const candidates = rules.filter(
    (rule) => matchesFloors(rule, plantas) && matchesArea(rule, superficie),
  );
  if (candidates.length === 0) {
    return null;
  }
  candidates.sort((a, b) => {
    const spanDiff = areaSpan(a) - areaSpan(b);
    if (spanDiff !== 0) {
      return spanDiff;
    }
    const timeDiff = a.createdAt.getTime() - b.createdAt.getTime();
    if (timeDiff !== 0) {
      return timeDiff;
    }
    return a.id.localeCompare(b.id);
  });
  return candidates[0] ?? null;
}

export function estimate(
  input: CalculatorInput,
  rules: CalculatorRuleData[],
): EstimateResult {
  const candidate = selectRule(rules, input.plantas, input.superficie);
  if (!candidate) {
    return { noRule: true };
  }

  const parsed = boreholesFormulaSchema.safeParse(candidate.boreholesFormula);
  if (!parsed.success) {
    throw new CalculatorFormulaError();
  }
  const formula = parsed.data;
  const raw =
    formula.base +
    (formula.perFloor ?? 0) * input.plantas +
    formula.per1000m2 * (input.superficie / 1000);

  return {
    boreholes: Math.max(1, Math.ceil(raw)),
    depthEstimate: candidate.depthEstimate,
    recommendedTests: candidate.recommendedTests,
    cteReference: candidate.cteReference,
  };
}
