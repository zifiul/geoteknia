import 'server-only';

import { AiModel } from '@prisma/client';
import { Prisma } from '@prisma/client';
import type { Prisma as PrismaTypes } from '@prisma/client';

import { db } from '@/lib/db';
import { env } from '@/lib/env';

import { currentBillingPeriodUtc } from './billing-period';

export type NormalizedUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
};

/** Tarifas USD por millón de tokens (input base, output, cache read, cache write). */
const RATES_USD_PER_M: Record<
  AiModel,
  { input: number; output: number; cacheRead: number; cacheWrite: number }
> = {
  [AiModel.claude_sonnet_4_6]: {
    input: 3,
    output: 15,
    cacheRead: 0.3,
    cacheWrite: 3.75,
  },
  [AiModel.claude_opus_4_8]: {
    input: 5,
    output: 25,
    cacheRead: 0.5,
    cacheWrite: 6.25,
  },
};

function costBucketUsd(tokens: number, usdPerMillion: number): number {
  return (tokens / 1_000_000) * usdPerMillion;
}

export function computeCostEur(usage: NormalizedUsage, model: AiModel): number {
  const rates = RATES_USD_PER_M[model];
  const usd =
    costBucketUsd(usage.inputTokens, rates.input) +
    costBucketUsd(usage.outputTokens, rates.output) +
    costBucketUsd(usage.cacheReadTokens, rates.cacheRead) +
    costBucketUsd(usage.cacheWriteTokens, rates.cacheWrite);
  const eur = usd * env.IA_USD_TO_EUR_RATE;
  return Math.round(eur * 10_000) / 10_000;
}

export async function persistTokenUsage(
  aiGenerationId: string,
  usage: NormalizedUsage,
  model: AiModel,
  tx?: PrismaTypes.TransactionClient,
): Promise<void> {
  const client = tx ?? db;
  const costEur = computeCostEur(usage, model);

  await client.aiTokenUsage.create({
    data: {
      aiGenerationId,
      model,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      cacheReadTokens: usage.cacheReadTokens,
      cacheWriteTokens: usage.cacheWriteTokens,
      costEur: new Prisma.Decimal(costEur.toFixed(4)),
      billingPeriod: currentBillingPeriodUtc(),
    },
  });
}
