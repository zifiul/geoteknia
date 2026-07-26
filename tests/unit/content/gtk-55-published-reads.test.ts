import { WorkflowStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sanitizeCmsHtml } from '@/lib/content/sanitize-cms-html';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/env', () => ({
  env: { MEDIA_STORAGE_BASE_URL: 'https://media.example.com' },
}));

const { blogPostFindMany, blogPostFindFirst, blogPostServiceFindMany, serviceFindMany, mediaAssetFindFirst } =
  vi.hoisted(() => ({
    blogPostFindMany: vi.fn(),
    blogPostFindFirst: vi.fn(),
    blogPostServiceFindMany: vi.fn(),
    serviceFindMany: vi.fn(),
    mediaAssetFindFirst: vi.fn(),
  }));

vi.mock('@/lib/db', () => ({
  db: {
    blogPost: { findMany: blogPostFindMany, findFirst: blogPostFindFirst },
    blogPostService: { findMany: blogPostServiceFindMany },
    service: { findMany: serviceFindMany },
    mediaAsset: { findFirst: mediaAssetFindFirst },
  },
}));

import {
  getPublishedBlogPostBySlug,
  listPublishedBlogPostParams,
  listRelatedServicesByBlogPost,
} from '@/lib/content/blog-faqs';

const publishedWhere = {
  workflowStatus: WorkflowStatus.publicado,
  deletedAt: null,
};

describe('lecturas públicas GTK-55', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    blogPostFindMany.mockResolvedValue([]);
    blogPostFindFirst.mockResolvedValue(null);
    blogPostServiceFindMany.mockResolvedValue([]);
    serviceFindMany.mockResolvedValue([]);
    mediaAssetFindFirst.mockResolvedValue(null);
  });

  it('listPublishedBlogPostParams filtra publicados', async () => {
    blogPostFindMany.mockResolvedValue([
      { slug: 'post-a', category: { slug: 'normativa' } },
    ]);
    const params = await listPublishedBlogPostParams();
    expect(params).toEqual([{ categoria: 'normativa', slug: 'post-a' }]);
    expect(blogPostFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: publishedWhere }),
    );
  });

  it('getPublishedBlogPostBySlug exige categoría y slug publicados', async () => {
    await getPublishedBlogPostBySlug('normativa', 'ausente');
    expect(blogPostFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          ...publishedWhere,
          slug: 'ausente',
          category: { slug: 'normativa', deletedAt: null },
        },
      }),
    );
  });

  it('getPublishedBlogPostBySlug parsea toc almacenado', async () => {
    blogPostFindFirst.mockResolvedValue({
      id: 'bp-1',
      title: 'Título',
      slug: 'titulo',
      h1: null,
      excerpt: null,
      body: '<p>Hola</p>',
      toc: [{ id: 'sec-1', text: 'Intro', level: 2 }],
      readingMinutes: 5,
      publishedAt: new Date('2024-06-01'),
      updatedAt: new Date('2024-07-01'),
      metaTitle: null,
      metaDescription: null,
      canonicalUrl: null,
      schemaType: 'Article',
      noindex: false,
      ogImageId: null,
      heroImageId: null,
      category: { id: 'c1', name: 'Normativa', slug: 'normativa' },
      teamAuthor: { slug: 'autor' },
    });
    const post = await getPublishedBlogPostBySlug('normativa', 'titulo');
    expect(post?.toc).toEqual([{ id: 'sec-1', text: 'Intro', level: 2 }]);
  });

  it('listRelatedServicesByBlogPost solo servicios publicados', async () => {
    blogPostServiceFindMany.mockResolvedValue([{ serviceId: 's1' }]);
    await listRelatedServicesByBlogPost('bp-1');
    expect(serviceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: ['s1'] },
          ...publishedWhere,
        }),
      }),
    );
  });
});

describe('sanitizeCmsHtml GTK-55', () => {
  it('elimina scripts y handlers de evento', () => {
    const dirty =
      '<p>OK</p><script>alert(1)</script><img src=x onerror=alert(1)>';
    const clean = sanitizeCmsHtml(dirty);
    expect(clean).not.toMatch(/<script/i);
    expect(clean).not.toMatch(/onerror/i);
    expect(clean).toContain('OK');
  });
});
