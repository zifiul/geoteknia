import { FaqScope, WorkflowStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { faqGroupFindMany, faqGroupFindFirst } = vi.hoisted(() => ({
  faqGroupFindMany: vi.fn(),
  faqGroupFindFirst: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    faqGroup: { findMany: faqGroupFindMany, findFirst: faqGroupFindFirst },
  },
}));

import {
  getPublishedFaqGroupBySlug,
  listPublishedGeneralFaqGroups,
} from '@/lib/content/blog-faqs';
import { buildFaqPageSchema } from '@/lib/seo/jsonld';

const publishedWhere = {
  workflowStatus: WorkflowStatus.publicado,
  deletedAt: null,
};

describe('lecturas públicas GTK-62', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    faqGroupFindMany.mockResolvedValue([]);
    faqGroupFindFirst.mockResolvedValue(null);
  });

  it('listPublishedGeneralFaqGroups filtra scope general y FAQs publicadas', async () => {
    await listPublishedGeneralFaqGroups();
    expect(faqGroupFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          scope: FaqScope.general,
          deletedAt: null,
          faqs: { some: publishedWhere },
        },
      }),
    );
  });

  it('getPublishedFaqGroupBySlug devuelve null si no hay FAQs publicadas', async () => {
    faqGroupFindFirst.mockResolvedValue({
      id: 'g1',
      name: 'Grupo',
      slug: 'grupo',
      faqs: [],
    });
    await expect(getPublishedFaqGroupBySlug('grupo')).resolves.toBeNull();
  });

  it('getPublishedFaqGroupBySlug devuelve grupo con FAQs ordenadas', async () => {
    faqGroupFindFirst.mockResolvedValue({
      id: 'g1',
      name: 'Normativa',
      slug: 'normativa',
      faqs: [
        {
          id: 'f1',
          question: '¿Qué norma aplica?',
          answer: 'CTE.',
          internalLinkUrl: null,
          order: 1,
        },
      ],
    });
    const group = await getPublishedFaqGroupBySlug('normativa');
    expect(group?.faqs).toHaveLength(1);
    expect(faqGroupFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'normativa', scope: FaqScope.general, deletedAt: null },
        select: expect.objectContaining({
          faqs: expect.objectContaining({
            where: publishedWhere,
          }),
        }),
      }),
    );
  });

  it('buildFaqPageSchema genera FAQPage para un grupo', () => {
    const schema = buildFaqPageSchema([
      { question: '¿Plazo?', answer: '2-4 semanas.' },
    ]);
    expect(schema['@type']).toBe('FAQPage');
    expect(schema.mainEntity).toHaveLength(1);
  });
});
