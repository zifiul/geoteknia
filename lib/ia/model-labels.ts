import { AiModel } from '@prisma/client';

const AI_MODEL_API_ID: Record<AiModel, string> = {
  [AiModel.claude_sonnet_4_6]: 'claude-sonnet-4-6',
  [AiModel.claude_opus_4_8]: 'claude-opus-4-8',
};

export function displayApiModelId(model: AiModel): string {
  return AI_MODEL_API_ID[model];
}

export const AI_MODEL_OPTIONS: AiModel[] = [
  AiModel.claude_sonnet_4_6,
  AiModel.claude_opus_4_8,
];
