/**
 * Tests GTK-36 — runGeneration (SDK mockeado).
 */
import { AiModel } from '@prisma/client';
import { APIError } from '@anthropic-ai/sdk';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { applyVitestEnv } from '../../helpers/test-env';

vi.mock('server-only', () => ({}));

const createMock = vi.fn();
const finalMessageMock = vi.fn();
const streamMock = vi.fn(() => ({
  finalMessage: finalMessageMock,
}));

vi.mock('@/lib/ia/client', () => ({
  anthropic: {
    messages: {
      create: createMock,
      stream: streamMock,
    },
  },
}));

describe('lib/ia/generate', () => {
  beforeEach(() => {
    applyVitestEnv();
    vi.resetModules();
    createMock.mockReset();
    streamMock.mockReset();
    finalMessageMock.mockReset();
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('mapea usage incluyendo tokens de caché', async () => {
    createMock.mockResolvedValue({
      content: [{ type: 'text', text: 'Hola SEO' }],
      stop_reason: 'end_turn',
      usage: {
        input_tokens: 100,
        output_tokens: 50,
        cache_read_input_tokens: 200,
        cache_creation_input_tokens: 10,
      },
    });

    const { runGeneration } = await import('@/lib/ia/generate');
    const result = await runGeneration({
      model: AiModel.claude_sonnet_4_6,
      userMessage: 'Genera intro',
      cacheablePrefix: 'Eres redactor SEO geotécnico.',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.usage).toEqual({
        inputTokens: 100,
        outputTokens: 50,
        cacheReadTokens: 200,
        cacheWriteTokens: 10,
      });
      expect(result.text).toBe('Hola SEO');
    }
  });

  it('incluye cache_control en el prefijo cacheable', async () => {
    createMock.mockResolvedValue({
      content: [{ type: 'text', text: 'ok' }],
      stop_reason: 'end_turn',
      usage: {
        input_tokens: 1,
        output_tokens: 1,
        cache_read_input_tokens: 0,
        cache_creation_input_tokens: 0,
      },
    });

    const { runGeneration } = await import('@/lib/ia/generate');
    await runGeneration({
      model: AiModel.claude_sonnet_4_6,
      userMessage: 'cuerpo',
      cacheablePrefix: 'prefijo estable',
    });

    const params = createMock.mock.calls[0]?.[0];
    expect(params.system).toEqual([
      {
        type: 'text',
        text: 'prefijo estable',
        cache_control: { type: 'ephemeral' },
      },
    ]);
    expect(params.temperature).toBeUndefined();
    expect(params.top_p).toBeUndefined();
  });

  it('SEC-2: el log estructurado no incluye el prompt del usuario', async () => {
    createMock.mockResolvedValue({
      content: [{ type: 'text', text: 'ok' }],
      stop_reason: 'end_turn',
      usage: {
        input_tokens: 1,
        output_tokens: 1,
        cache_read_input_tokens: 0,
        cache_creation_input_tokens: 0,
      },
    });

    const { runGeneration } = await import('@/lib/ia/generate');
    await runGeneration({
      model: AiModel.claude_opus_4_8,
      userMessage: 'dato-sensible@cliente.com',
      cacheablePrefix: 'prefijo',
    });

    const logLine = (console.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
    expect(logLine).not.toContain('dato-sensible@cliente.com');
    expect(logLine).toContain('ai_generation');
  });

  it('devuelve error controlado tras agotar reintentos del SDK (429)', async () => {
    createMock.mockRejectedValue(
      new APIError(429, undefined, 'rate limit', undefined),
    );

    const { runGeneration } = await import('@/lib/ia/generate');
    const result = await runGeneration({
      model: AiModel.claude_sonnet_4_6,
      userMessage: 'x',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.transient).toBe(true);
      expect(result.error.httpStatus).toBe(429);
    }
  });

  it('usa streaming cuando max_tokens supera el umbral', async () => {
    finalMessageMock.mockResolvedValue({
      content: [{ type: 'text', text: 'largo' }],
      stop_reason: 'end_turn',
      usage: {
        input_tokens: 10,
        output_tokens: 10,
        cache_read_input_tokens: 0,
        cache_creation_input_tokens: 0,
      },
    });

    const { runGeneration, STREAMING_MAX_TOKENS_THRESHOLD } = await import(
      '@/lib/ia/generate'
    );
    await runGeneration({
      model: AiModel.claude_sonnet_4_6,
      userMessage: 'pillar',
      maxTokens: STREAMING_MAX_TOKENS_THRESHOLD + 1,
    });

    expect(streamMock).toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
  });
});
