import { SchemaType, WorkflowStatus } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import { ContentConflictError } from '@/lib/content/errors';
import { editorialCrudBlockSchema } from '@/lib/content/schemas/editorial';
import { seoBlockSchema } from '@/lib/content/schemas/seo';
import { ensureUniqueSlug, slugify } from '@/lib/content/slug';

describe('content slug', () => {
  it('slugify normaliza texto', () => {
    expect(slugify('Estudio Geotécnico Madrid')).toBe('estudio-geotecnico-madrid');
  });

  it('ensureUniqueSlug rechaza duplicado', async () => {
    const delegate = {
      findFirst: async () => ({ id: 'existing-id' }),
    };
    await expect(ensureUniqueSlug(delegate, 'mi-slug')).rejects.toBeInstanceOf(
      ContentConflictError,
    );
  });
});

describe('seoBlockSchema', () => {
  it('rechaza meta_title > 60', () => {
    const result = seoBlockSchema.safeParse({
      slug: 'test',
      metaTitle: 'a'.repeat(61),
      schemaType: SchemaType.Service,
    });
    expect(result.success).toBe(false);
  });

  it('rechaza meta_description > 155', () => {
    const result = seoBlockSchema.safeParse({
      slug: 'test',
      metaDescription: 'b'.repeat(156),
      schemaType: SchemaType.Service,
    });
    expect(result.success).toBe(false);
  });
});

describe('editorialCrudBlockSchema', () => {
  it('rechaza workflow_status publicado (SEC-3)', () => {
    const result = editorialCrudBlockSchema.safeParse({
      workflowStatus: WorkflowStatus.publicado,
    });
    expect(result.success).toBe(false);
  });
});
