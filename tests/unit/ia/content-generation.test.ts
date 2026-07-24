/**
 * Tests GTK-38 — orquestación generateContent (runGeneration mockeado).
 */
import {
  AiGenerationStatus,
  AiModel,
  PromptPageType,
} from '@prisma/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const assertWithinBudget = vi.fn();
const runGeneration = vi.fn();
const persistTokenUsage = vi.fn();
const recordAudit = vi.fn();
const promptFindFirst = vi.fn();
const generationCreate = vi.fn();
const generationFindFirst = vi.fn();
const generationUpdate = vi.fn();
const transaction = vi.fn();

vi.mock('@/lib/ia/budget', () => ({
  assertWithinBudget,
}));

vi.mock('@/lib/ia/generate', () => ({
  runGeneration,
}));

vi.mock('@/lib/ia/token-usage', () => ({
  persistTokenUsage,
}));

vi.mock('@/lib/audit/log', () => ({
  recordAudit,
}));

vi.mock('@/lib/db', () => ({
  db: {
    promptTemplate: { findFirst: promptFindFirst },
    aiGeneration: {
      create: generationCreate,
      findFirst: generationFindFirst,
      update: generationUpdate,
    },
    $transaction: transaction,
  },
}));

const validOutputJson = {
  h1: 'Estudio geotécnico en Madrid',
  h2h3: [{ level: 'h2', text: 'Introducción' }],
  body: 'Cuerpo del contenido con detalle técnico.',
  metaTitle: 'Estudio geotécnico Madrid',
  metaDescription: 'Servicios de geotecnia en Madrid con Geoteknia.',
};

const templateRow = {
  id: '11111111-1111-4111-8111-111111111111',
  pageType: PromptPageType.service,
  templateBody: 'Servicio {{serviceName}} keyword {{primaryKeyword}}',
  inputSchema: {
    type: 'object',
    properties: {
      serviceName: { type: 'string' },
      primaryKeyword: { type: 'string' },
    },
    required: ['serviceName', 'primaryKeyword'],
  },
  defaultModel: AiModel.claude_sonnet_4_6,
  cacheablePrefix: 'Prefijo cacheable',
  isActive: true,
};

const editorUser = {
  userId: '22222222-2222-4222-8222-222222222222',
  roleId: '33333333-3333-4333-8333-333333333333',
  roleName: 'editor' as const,
};

describe('lib/ia/content-generation (GTK-38)', () => {
  beforeEach(() => {
    vi.resetModules();
    assertWithinBudget.mockReset();
    runGeneration.mockReset();
    persistTokenUsage.mockReset();
    recordAudit.mockReset();
    promptFindFirst.mockReset();
    generationCreate.mockReset();
    generationFindFirst.mockReset();
    generationUpdate.mockReset();
    transaction.mockReset();

    assertWithinBudget.mockResolvedValue(undefined);
    recordAudit.mockResolvedValue({ id: 'audit-1' });
    promptFindFirst.mockResolvedValue(templateRow);
    generationCreate.mockResolvedValue({ id: 'gen-1' });
    transaction.mockImplementation(async (fn: (tx: {
      aiGeneration: { update: typeof generationUpdate };
    }) => Promise<void>) => {
      await fn({ aiGeneration: { update: generationUpdate } });
    });
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('SEC-2: presupuesto superado no crea fila ni invoca Claude', async () => {
    const { BudgetExceededError } = await import('@/lib/ia/errors');
    assertWithinBudget.mockRejectedValue(new BudgetExceededError());

    const { generateContent } = await import('@/lib/ia/content-generation');
    const result = await generateContent(
      editorUser,
      {
        pageType: PromptPageType.service,
        inputs: { serviceName: 'Sondeos', primaryKeyword: 'geotecnia' },
      },
      { ip: null, userAgent: null },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('budget_exceeded');
    }
    expect(generationCreate).not.toHaveBeenCalled();
    expect(runGeneration).not.toHaveBeenCalled();
  });

  it('crea ai_generations y persiste token usage en éxito', async () => {
    runGeneration.mockResolvedValue({
      ok: true,
      status: 'success',
      text: JSON.stringify(validOutputJson),
      usage: {
        inputTokens: 10,
        outputTokens: 20,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
      },
      model: AiModel.claude_sonnet_4_6,
      latencyMs: 1200,
    });

    const { generateContent } = await import('@/lib/ia/content-generation');
    const result = await generateContent(
      editorUser,
      {
        pageType: PromptPageType.service,
        inputs: { serviceName: 'Sondeos', primaryKeyword: 'geotecnia' },
      },
      { ip: '127.0.0.1', userAgent: 'vitest' },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.status).toBe('success');
      expect(result.data.output?.h1).toBe(validOutputJson.h1);
    }
    expect(generationCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: AiGenerationStatus.retrying,
          requestedById: editorUser.userId,
        }),
      }),
    );
    expect(runGeneration).toHaveBeenCalled();
    expect(persistTokenUsage).toHaveBeenCalled();
    expect(recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'ai_generate',
        metadata: expect.objectContaining({
          generationId: 'gen-1',
          pageType: PromptPageType.service,
        }),
      }),
    );
  });

  it('salida inválida marca partial sin output publicable', async () => {
    runGeneration.mockResolvedValue({
      ok: true,
      status: 'success',
      text: '{"h1":"solo h1"}',
      usage: {
        inputTokens: 1,
        outputTokens: 1,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
      },
      model: AiModel.claude_sonnet_4_6,
      latencyMs: 500,
    });

    const { generateContent } = await import('@/lib/ia/content-generation');
    const result = await generateContent(
      editorUser,
      {
        pageType: PromptPageType.service,
        inputs: { serviceName: 'Sondeos', primaryKeyword: 'geotecnia' },
      },
      { ip: null, userAgent: null },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.status).toBe('partial');
      expect(result.data.output).toBeNull();
      expect(result.data.partialReason).toBeTruthy();
    }
  });

  it('SEC-3: userMessage no incluye email de lead en inputs', async () => {
    runGeneration.mockResolvedValue({
      ok: true,
      status: 'success',
      text: JSON.stringify(validOutputJson),
      usage: {
        inputTokens: 1,
        outputTokens: 1,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
      },
      model: AiModel.claude_sonnet_4_6,
      latencyMs: 100,
    });

    const { generateContent } = await import('@/lib/ia/content-generation');
    await generateContent(
      editorUser,
      {
        pageType: PromptPageType.service,
        inputs: {
          serviceName: 'Sondeos',
          primaryKeyword: 'geotecnia',
        },
      },
      { ip: null, userAgent: null },
    );

    const call = runGeneration.mock.calls[0]?.[0];
    expect(call.userMessage).not.toMatch(/@example\.com/);
    expect(call.userMessage).toContain('Sondeos');
  });

  it('rechaza parent_generation_id inválido', async () => {
    generationFindFirst.mockResolvedValue(null);

    const { generateContent } = await import('@/lib/ia/content-generation');
    const result = await generateContent(
      editorUser,
      {
        pageType: PromptPageType.service,
        inputs: { serviceName: 'Sondeos', primaryKeyword: 'geotecnia' },
        regenerateSection: {
          parentGenerationId: '33333333-3333-4333-8333-333333333333',
          section: 'h1',
        },
      },
      { ip: null, userAgent: null },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('parent_invalid');
    }
    expect(runGeneration).not.toHaveBeenCalled();
  });
});
