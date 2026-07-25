import { z } from 'zod';

import { editorialContentTypeSchema } from '@/lib/content/schemas/workflow';

export const publishContentInputSchema = z.object({
  contentType: editorialContentTypeSchema,
  contentId: z.uuid(),
});

export type PublishContentInput = z.infer<typeof publishContentInputSchema>;

export const scheduledPublishCronSummarySchema = z.object({
  published: z.number().int().min(0),
  skipped: z.number().int().min(0),
  failed: z.number().int().min(0),
});

export type ScheduledPublishCronSummary = z.infer<
  typeof scheduledPublishCronSummarySchema
>;
