import { SchemaType } from '@prisma/client';
import { z } from 'zod';

import { editorialCrudBlockSchema } from '@/lib/content/schemas/editorial';
import { seoBlockSchema } from '@/lib/content/schemas/seo';

const serviceBodySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  summary: z.string().nullable().optional(),
  body: z.string().min(1, 'El cuerpo es obligatorio'),
  methodology: z.unknown().optional(),
  applicableNorms: z.string().nullable().optional(),
  deliverables: z.unknown().optional(),
  heroImageId: z.uuid().nullable().optional(),
  order: z.number().int().nullable().optional(),
  isPillar: z.boolean().optional(),
  zoneIds: z.array(z.uuid()).optional(),
});

export const cmsServiceFormSchema = serviceBodySchema
  .merge(seoBlockSchema)
  .merge(editorialCrudBlockSchema);

export type CmsServiceFormValues = z.infer<typeof cmsServiceFormSchema>;

export const defaultNewServiceFormValues: CmsServiceFormValues = {
  name: '',
  summary: '',
  body: '',
  slug: '',
  schemaType: SchemaType.Service,
  noindex: false,
  isPillar: true,
  zoneIds: [],
  methodology: [],
  deliverables: [],
};
