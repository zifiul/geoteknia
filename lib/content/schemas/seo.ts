import { SchemaType } from '@prisma/client';
import { z } from 'zod';

export const seoBlockSchema = z.object({
  slug: z.string().min(1).max(200),
  metaTitle: z.string().max(60).nullable().optional(),
  metaDescription: z.string().max(155).nullable().optional(),
  canonicalUrl: z.url().nullable().optional(),
  schemaType: z.nativeEnum(SchemaType),
  noindex: z.boolean().optional(),
  ogImageId: z.uuid().nullable().optional(),
  h1: z.string().max(500).nullable().optional(),
});

export type SeoBlockInput = z.infer<typeof seoBlockSchema>;

export const seoBlockPartialSchema = seoBlockSchema.partial().extend({
  slug: z.string().min(1).max(200).optional(),
  schemaType: z.nativeEnum(SchemaType).optional(),
});

export const blogCategorySeoSchema = z.object({
  slug: z.string().min(1).max(200),
  metaTitle: z.string().max(60).nullable().optional(),
  metaDescription: z.string().max(155).nullable().optional(),
  noindex: z.boolean().optional(),
});

export const teamMachinerySeoSchema = z.object({
  slug: z.string().min(1).max(200),
});

export const faqGroupSeoSchema = z.object({
  slug: z.string().min(1).max(200),
  schemaType: z.nativeEnum(SchemaType),
});
