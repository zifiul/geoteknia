import { z } from 'zod';

export const h2h3EntrySchema = z.object({
  level: z.enum(['h2', 'h3']),
  text: z.string().min(1),
});

export const internalLinkSchema = z.object({
  anchor: z.string().min(1),
  url: z.string().min(1),
});

export const generationOutputSchema = z
  .object({
    h1: z.string().min(1),
    h2h3: z.array(h2h3EntrySchema),
    body: z.string().min(1),
    metaTitle: z.string().max(60),
    metaDescription: z.string().max(155),
    schemaSuggestion: z.string().optional(),
    internalLinks: z.array(internalLinkSchema).optional(),
  })
  .strict();

export type GenerationOutput = z.infer<typeof generationOutputSchema>;

const SECTION_KEYS = {
  h1: ['h1'],
  body: ['body'],
  h2h3: ['h2h3'],
  metaTitle: ['metaTitle'],
  metaDescription: ['metaDescription'],
  meta: ['metaTitle', 'metaDescription'],
  schemaSuggestion: ['schemaSuggestion'],
  internalLinks: ['internalLinks'],
} as const;

export type RegenerationSection = keyof typeof SECTION_KEYS;

export function isRegenerationSection(value: string): value is RegenerationSection {
  return value in SECTION_KEYS;
}

export function sectionOutputSchema(section: RegenerationSection): z.ZodType<Partial<GenerationOutput>> {
  switch (section) {
    case 'h1':
      return generationOutputSchema.pick({ h1: true });
    case 'body':
      return generationOutputSchema.pick({ body: true });
    case 'h2h3':
      return generationOutputSchema.pick({ h2h3: true });
    case 'metaTitle':
      return generationOutputSchema.pick({ metaTitle: true });
    case 'metaDescription':
      return generationOutputSchema.pick({ metaDescription: true });
    case 'meta':
      return generationOutputSchema.pick({ metaTitle: true, metaDescription: true });
    case 'schemaSuggestion':
      return generationOutputSchema.pick({ schemaSuggestion: true });
    case 'internalLinks':
      return generationOutputSchema.pick({ internalLinks: true });
    default: {
      const _exhaustive: never = section;
      return _exhaustive;
    }
  }
}
