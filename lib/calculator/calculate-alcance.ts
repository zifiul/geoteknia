import 'server-only';

import { db } from '@/lib/db';

import {
  buildPrefill,
  estimate,
} from './estimate';
import { loadActiveRulesForTypology } from './rules-repository';
import type { CalculatorEstimateData, CalculatorInput } from './schema';

export type CalculateAlcanceSuccess = {
  kind: 'success';
  data: CalculatorEstimateData;
  boreholes: number;
};

export type CalculateAlcanceNoRule = {
  kind: 'no_rule';
  message: string;
  prefill: CalculatorEstimateData['prefill'];
};

export type CalculateAlcanceCatalogError = {
  kind: 'catalog';
  field: 'tipoObra' | 'provincia';
};

export type CalculateAlcanceResult =
  | CalculateAlcanceSuccess
  | CalculateAlcanceNoRule
  | CalculateAlcanceCatalogError;

export async function calculateAlcance(
  input: CalculatorInput,
): Promise<CalculateAlcanceResult> {
  const prefill = buildPrefill(input);

  const [workTypology, province] = await Promise.all([
    db.workTypology.findFirst({
      where: { slug: input.tipoObra, deletedAt: null },
      select: { id: true },
    }),
    db.province.findFirst({
      where: { slug: input.provincia, deletedAt: null },
      select: { id: true },
    }),
  ]);

  if (!workTypology) {
    return { kind: 'catalog', field: 'tipoObra' };
  }
  if (!province) {
    return { kind: 'catalog', field: 'provincia' };
  }

  const rules = await loadActiveRulesForTypology(workTypology.id);

  const result = estimate(input, rules);

  if ('noRule' in result) {
    return {
      kind: 'no_rule',
      message:
        'No hay una regla de alcance aplicable para estos parámetros. Solicite un presupuesto exacto.',
      prefill,
    };
  }

  return {
    kind: 'success',
    boreholes: result.boreholes,
    data: {
      boreholes: result.boreholes,
      depthEstimate: result.depthEstimate,
      recommendedTests: result.recommendedTests,
      cteReference: result.cteReference,
      prefill,
    },
  };
}
