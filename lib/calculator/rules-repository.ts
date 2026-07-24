import { db } from '@/lib/db';

import type { CalculatorRuleData } from './estimate';

export async function loadActiveRulesForTypology(
  workTypologyId: string,
): Promise<CalculatorRuleData[]> {
  const rows = await db.calculatorRule.findMany({
    where: {
      workTypologyId,
      isActive: true,
      deletedAt: null,
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      createdAt: true,
      minFloors: true,
      maxFloors: true,
      minAreaM2: true,
      maxAreaM2: true,
      boreholesFormula: true,
      depthEstimate: true,
      recommendedTests: true,
      cteReference: true,
    },
  });

  return rows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt,
    minFloors: row.minFloors,
    maxFloors: row.maxFloors,
    minAreaM2: row.minAreaM2?.toNumber() ?? null,
    maxAreaM2: row.maxAreaM2?.toNumber() ?? null,
    boreholesFormula: row.boreholesFormula,
    depthEstimate: row.depthEstimate,
    recommendedTests: row.recommendedTests,
    cteReference: row.cteReference,
  }));
}
