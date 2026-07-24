/**
 * QA GTK-36 — persistencia real Neon (db-state-verify).
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  AiGenerationStatus,
  AiModel,
  PrismaClient,
  PromptPageType,
} from '@prisma/client';

import { applyVitestEnv } from '../helpers/test-env';

const db = new PrismaClient();

describe('QA GTK-36 — ledger ai_token_usage', () => {
  let generationId: string | null = null;
  let templateId: string | null = null;
  let userId: string | null = null;
  let billingPeriod: string;

  beforeAll(async () => {
    applyVitestEnv();

    const user = await db.user.create({
      data: {
        email: `gtk36-qa-${Date.now()}@example.com`,
        fullName: 'GTK36 QA',
        passwordHash: 'hash',
        role: { connect: { name: 'admin' } },
      },
    });
    userId = user.id;

    const template = await db.promptTemplate.create({
      data: {
        name: `gtk36-qa-template-${Date.now()}`,
        pageType: PromptPageType.service,
        templateBody: 'hola {{keyword}}',
        inputSchema: { keyword: 'string' },
        cacheablePrefix: 'prefijo',
        defaultModel: AiModel.claude_sonnet_4_6,
        version: 1,
        isActive: true,
      },
    });
    templateId = template.id;

    const generation = await db.aiGeneration.create({
      data: {
        promptTemplateId: template.id,
        requestedById: user.id,
        model: AiModel.claude_sonnet_4_6,
        inputParams: { keyword: 'estudio geotécnico' },
        status: AiGenerationStatus.success,
      },
    });
    generationId = generation.id;

    const now = new Date();
    billingPeriod = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  });

  afterAll(async () => {
    if (generationId) {
      await db.aiTokenUsage.deleteMany({ where: { aiGenerationId: generationId } });
      await db.aiGeneration.delete({ where: { id: generationId } });
    }
    if (templateId) {
      await db.promptTemplate.delete({ where: { id: templateId } });
    }
    if (userId) {
      await db.user.delete({ where: { id: userId } });
    }
    await db.$disconnect();
  });

  it('persistTokenUsage alimenta el agregado de coste del periodo', async () => {
    const { persistTokenUsage } = await import('@/lib/ia/token-usage');

    const before = await db.aiTokenUsage.aggregate({
      where: { billingPeriod },
      _sum: { costEur: true },
    });
    const sumBefore = Number(before._sum.costEur ?? 0);

    await persistTokenUsage(
      generationId!,
      {
        inputTokens: 1_000_000,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
      },
      AiModel.claude_sonnet_4_6,
    );

    const after = await db.aiTokenUsage.aggregate({
      where: { billingPeriod },
      _sum: { costEur: true },
    });
    const sumAfter = Number(after._sum.costEur ?? 0);

    expect(sumAfter - sumBefore).toBeCloseTo(3, 2);
  });
});
