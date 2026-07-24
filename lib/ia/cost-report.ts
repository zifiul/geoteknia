import 'server-only';

import type { AiModel, PromptPageType } from '@prisma/client';

import { db } from '@/lib/db';

import type { CostReportFilters } from './budget-config-schema';
import { currentBillingPeriodUtc } from './budget';

export type CostReport = {
  billingPeriod: string;
  totalEur: number;
  byModel: Array<{ model: AiModel; totalEur: number }>;
  byPageType: Array<{ pageType: PromptPageType; totalEur: number }>;
};

function toNumber(value: { toNumber(): number } | number): number {
  return typeof value === 'number' ? value : value.toNumber();
}

export async function getCostReport(
  filters: CostReportFilters = {},
): Promise<CostReport> {
  const billingPeriod = filters.billingPeriod ?? currentBillingPeriodUtc();

  const rows = await db.aiTokenUsage.findMany({
    where: { billingPeriod },
    select: {
      costEur: true,
      model: true,
      aiGeneration: {
        select: {
          promptTemplate: { select: { pageType: true } },
        },
      },
    },
  });

  let totalEur = 0;
  const byModelMap = new Map<AiModel, number>();
  const byPageTypeMap = new Map<PromptPageType, number>();

  for (const row of rows) {
    const cost = toNumber(row.costEur);
    totalEur += cost;
    byModelMap.set(row.model, (byModelMap.get(row.model) ?? 0) + cost);
    const pageType = row.aiGeneration.promptTemplate.pageType;
    byPageTypeMap.set(pageType, (byPageTypeMap.get(pageType) ?? 0) + cost);
  }

  return {
    billingPeriod,
    totalEur,
    byModel: [...byModelMap.entries()].map(([model, totalEurModel]) => ({
      model,
      totalEur: totalEurModel,
    })),
    byPageType: [...byPageTypeMap.entries()].map(([pageType, totalEurPage]) => ({
      pageType,
      totalEur: totalEurPage,
    })),
  };
}
