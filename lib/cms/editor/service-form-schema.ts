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

export const cmsSeoBlockSchema = seoBlockSchema.extend({
  slug: z
    .string()
    .min(1, 'El slug URL es obligatorio')
    .max(200, 'El slug URL no puede superar 200 caracteres'),
  metaTitle: z
    .string()
    .max(60, 'El meta título no puede superar 60 caracteres')
    .nullable()
    .optional(),
  metaDescription: z
    .string()
    .max(155, 'La meta descripción no puede superar 155 caracteres')
    .nullable()
    .optional(),
  canonicalUrl: z
    .url('La URL canónica no es válida')
    .nullable()
    .optional(),
});

export const cmsServiceFormSchema = serviceBodySchema
  .merge(cmsSeoBlockSchema)
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
