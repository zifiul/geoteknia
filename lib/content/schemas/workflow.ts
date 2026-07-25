import { z } from 'zod';

/** Tipos de contenido publicable con bloque EDITORIAL (GTK-39). */
export const EDITORIAL_CONTENT_TYPES = [
  'service',
  'geo_zone',
  'service_zone_page',
  'case_study',
  'blog_post',
  'faq',
  'team_member',
  'machinery',
] as const;

export const editorialContentTypeSchema = z.enum(EDITORIAL_CONTENT_TYPES);

export type EditorialContentType = z.infer<typeof editorialContentTypeSchema>;

export const workflowNoteSchema = z.string().trim().max(2000).optional();

export const regenerateBodySchema = z.object({
  body: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  aiGenerationId: z.uuid().optional(),
  changeSummary: z.string().trim().max(500).optional(),
});

export type RegenerateBodyInput = z.infer<typeof regenerateBodySchema>;
