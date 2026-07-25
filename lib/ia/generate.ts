import 'server-only';

import { APIError } from '@anthropic-ai/sdk';
import type {
  Message,
  MessageCreateParamsNonStreaming,
} from '@anthropic-ai/sdk/resources/messages/messages';
import type { AiModel } from '@prisma/client';

import { AiGenerationError } from './errors';
import { anthropic } from './client';
import { toApiModelId } from './models';
import type { NormalizedUsage } from './token-usage';

/** Por encima de este umbral se usa streaming para evitar timeouts HTTP. */
export const STREAMING_MAX_TOKENS_THRESHOLD = 16_384;

export type RunGenerationInput = {
  model: AiModel;
  userMessage: string;
  cacheablePrefix?: string;
  volatileSystemSuffix?: string;
  maxTokens?: number;
};

export type GenerationResult =
  | {
      ok: true;
      status: 'success' | 'partial';
      text: string;
      usage: NormalizedUsage;
      model: AiModel;
      latencyMs: number;
    }
  | {
      ok: false;
      status: 'error';
      error: AiGenerationError;
      usage?: NormalizedUsage;
      latencyMs: number;
    };

export function normalizeUsage(usage: Message['usage']): NormalizedUsage {
  return {
    inputTokens: usage.input_tokens ?? 0,
    outputTokens: usage.output_tokens ?? 0,
    cacheReadTokens: usage.cache_read_input_tokens ?? 0,
    cacheWriteTokens: usage.cache_creation_input_tokens ?? 0,
  };
}

function extractText(message: Message): string {
  const parts: string[] = [];
  for (const block of message.content) {
    if (block.type === 'text') {
      parts.push(block.text);
    }
  }
  return parts.join('');
}

function buildSystemParam(
  cacheablePrefix?: string,
  volatileSystemSuffix?: string,
): MessageCreateParamsNonStreaming['system'] | undefined {
  const blocks: Array<{
    type: 'text';
    text: string;
    cache_control?: { type: 'ephemeral' };
  }> = [];

  if (cacheablePrefix?.trim()) {
    blocks.push({
      type: 'text',
      text: cacheablePrefix,
      cache_control: { type: 'ephemeral' },
    });
  }
  if (volatileSystemSuffix?.trim()) {
    blocks.push({ type: 'text', text: volatileSystemSuffix });
  }

  if (blocks.length === 0) {
    return undefined;
  }
  if (blocks.length === 1 && !cacheablePrefix?.trim()) {
    return volatileSystemSuffix;
  }
  return blocks;
}

function mapSdkError(error: unknown): AiGenerationError {
  if (error instanceof APIError) {
    const status = error.status;
    const transient =
      status === 408 ||
      status === 409 ||
      status === 429 ||
      (status !== undefined && status >= 500);
    return new AiGenerationError('Error al invocar Claude', {
      transient,
      httpStatus: status,
    });
  }
  if (error instanceof Error && error.name === 'TimeoutError') {
    return new AiGenerationError('Timeout al invocar Claude', {
      transient: true,
    });
  }
  return new AiGenerationError('Error inesperado al invocar Claude', {
    transient: false,
  });
}

function logGenerationOutcome(payload: {
  model: AiModel;
  status: string;
  usage?: NormalizedUsage;
  latencyMs: number;
}): void {
  console.info(
    JSON.stringify({
      event: 'ai_generation',
      model: payload.model,
      status: payload.status,
      inputTokens: payload.usage?.inputTokens,
      outputTokens: payload.usage?.outputTokens,
      cacheReadTokens: payload.usage?.cacheReadTokens,
      cacheWriteTokens: payload.usage?.cacheWriteTokens,
      latencyMs: payload.latencyMs,
    }),
  );
}

export async function runGeneration(
  input: RunGenerationInput,
): Promise<GenerationResult> {
  const started = Date.now();
  const maxTokens = input.maxTokens ?? 4096;
  const model = input.model;
  const apiModel = toApiModelId(model);

  const baseParams = {
    model: apiModel,
    max_tokens: maxTokens,
    system: buildSystemParam(input.cacheablePrefix, input.volatileSystemSuffix),
    messages: [{ role: 'user' as const, content: input.userMessage }],
  };

  try {
    const message =
      maxTokens > STREAMING_MAX_TOKENS_THRESHOLD
        ? await anthropic.messages.stream(baseParams).finalMessage()
        : await anthropic.messages.create(baseParams);

    const usage = normalizeUsage(message.usage);
    const text = extractText(message);
    const status = message.stop_reason === 'max_tokens' ? 'partial' : 'success';
    const latencyMs = Date.now() - started;

    logGenerationOutcome({ model, status, usage, latencyMs });

    return {
      ok: true,
      status,
      text,
      usage,
      model,
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - started;
    const mapped = mapSdkError(error);
    logGenerationOutcome({ model, status: 'error', latencyMs });
    return {
      ok: false,
      status: 'error',
      error: mapped,
      latencyMs,
    };
  }
}
