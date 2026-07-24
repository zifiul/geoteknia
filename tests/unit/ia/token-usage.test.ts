/**
 * Tests GTK-36 — coste y persistencia de tokens.
 */
import { AiModel, PromptPageType } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { applyVitestEnv } from '../../helpers/test-env';

vi.mock('server-only', () => ({}));

const createUsage = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    aiTokenUsage: { create: createUsage },
  },
}));

vi.mock('@/lib/ia/budget', () => ({
  currentBillingPeriodUtc: () => '2026-07',
}));

describe('lib/ia/token-usage', () => {
  beforeEach(() => {
    applyVitestEnv();
    vi.resetModules();
    createUsage.mockReset();
    process.env.IA_USD_TO_EUR_RATE = '1';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('computeCostEur aplica tarifas y multiplicadores de caché (Sonnet)', async () => {
    const { computeCostEur } = await import('@/lib/ia/token-usage');
    const cost = computeCostEur(
      {
        inputTokens: 1_000_000,
        outputTokens: 0,
        cacheReadTokens: 1_000_000,
        cacheWriteTokens: 1_000_000,
      },
      AiModel.claude_sonnet_4_6,
    );
    // 3 + 0.3 + 3.75 USD con FX 1
    expect(cost).toBe(7.05);
  });

  it('persistTokenUsage inserta billingPeriod y columnas mapeadas', async () => {
    createUsage.mockResolvedValue({ id: 'u1' });

    const { persistTokenUsage } = await import('@/lib/ia/token-usage');
    await persistTokenUsage('gen-1', {
      inputTokens: 10,
      outputTokens: 20,
      cacheReadTokens: 5,
      cacheWriteTokens: 2,
    }, AiModel.claude_opus_4_8);

    expect(createUsage).toHaveBeenCalledWith({
      data: expect.objectContaining({
        aiGenerationId: 'gen-1',
        model: AiModel.claude_opus_4_8,
        inputTokens: 10,
        outputTokens: 20,
        cacheReadTokens: 5,
        cacheWriteTokens: 2,
        billingPeriod: expect.stringMatching(/^\d{4}-\d{2}$/),
        costEur: expect.anything(),
      }),
    });
  });
});

describe('lib/ia/models', () => {
  beforeEach(() => {
    applyVitestEnv();
    vi.resetModules();
  });

  it('selectModel usa Opus para pillar', async () => {
    const { selectModel } = await import('@/lib/ia/models');
    expect(
      selectModel(PromptPageType.service, true),
    ).toBe(AiModel.claude_opus_4_8);
  });
});
