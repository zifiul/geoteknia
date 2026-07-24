/**
 * QA GTK-38 — persistencia ai_generations + ai_token_usage (db-state-verify).
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

describe('QA GTK-38 — ledger tras generación', () => {
  let generationId: string | null = null;
  let templateId: string | null = null;
  let userId: string | null = null;

  beforeAll(async () => {
    applyVitestEnv();

    const user = await db.user.create({
      data: {
        email: `gtk38-qa-${Date.now()}@example.com`,
        fullName: 'GTK38 QA',
        passwordHash: 'hash',
        role: { connect: { name: 'editor' } },
      },
    });
    userId = user.id;

    const template = await db.promptTemplate.create({
      data: {
        name: `gtk38-qa-template-${Date.now()}`,
        pageType: PromptPageType.service,
        templateBody: 'Servicio {{serviceName}}',
        inputSchema: {
          type: 'object',
          properties: { serviceName: { type: 'string' } },
          required: ['serviceName'],
        },
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
        inputParams: { serviceName: 'Sondeos' },
        status: AiGenerationStatus.success,
        outputStructured: {
          h1: 'Título',
          body: 'Cuerpo',
          metaTitle: 'Meta',
          metaDescription: 'Desc',
          h2h3: [],
        },
      },
    });
    generationId = generation.id;

    const { persistTokenUsage } = await import('@/lib/ia/token-usage');
    await persistTokenUsage(generation.id, {
      inputTokens: 100,
      outputTokens: 50,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
    }, AiModel.claude_sonnet_4_6);
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

  it('persiste cost_eur coherente con computeCostEur', async () => {
    const { computeCostEur } = await import('@/lib/ia/token-usage');
    const usage = await db.aiTokenUsage.findUnique({
      where: { aiGenerationId: generationId! },
    });
    expect(usage).not.toBeNull();
    const expected = computeCostEur(
      {
        inputTokens: 100,
        outputTokens: 50,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
      },
      AiModel.claude_sonnet_4_6,
    );
    expect(Number(usage!.costEur)).toBe(expected);
  });
});
