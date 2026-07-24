import { AiModel, PromptPageType } from '@prisma/client';
import { z } from 'zod';

export const regenerateSectionSchema = z
  .object({
    parentGenerationId: z.uuid(),
    section: z.string().min(1).max(64),
  })
  .strict();

export const generateContentSchema = z
  .object({
    pageType: z.nativeEnum(PromptPageType),
    templateId: z.uuid().optional(),
    inputs: z.record(z.string(), z.unknown()),
    model: z.nativeEnum(AiModel).optional(),
    targetContentType: z.string().min(1).max(64).optional(),
    targetContentId: z.uuid().optional(),
    regenerateSection: regenerateSectionSchema.optional(),
  })
  .strict();

export type GenerateContentInput = z.infer<typeof generateContentSchema>;
