import 'server-only';

import { AiModel, PromptPageType } from '@prisma/client';

import { env } from '@/lib/env';

/** Identificador de API Anthropic (coincide con `@map` del enum Prisma). */
const AI_MODEL_API_ID: Record<AiModel, string> = {
  [AiModel.claude_sonnet_4_6]: 'claude-sonnet-4-6',
  [AiModel.claude_opus_4_8]: 'claude-opus-4-8',
};

export const DEFAULT_MODEL: AiModel = env.IA_DEFAULT_MODEL;

export function toApiModelId(model: AiModel): string {
  return AI_MODEL_API_ID[model];
}

/**
 * Opus para piezas pillar; en otro caso el default de entorno (Sonnet 4.6).
 */
export function selectModel(
  _pageType: PromptPageType,
  isPillar: boolean,
): AiModel {
  if (isPillar) {
    return AiModel.claude_opus_4_8;
  }
  return DEFAULT_MODEL;
}
