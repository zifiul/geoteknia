import { WorkflowStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/env', () => ({
  env: { MEDIA_STORAGE_BASE_URL: 'https://media.example.com' },
}));

const {
  blogCategoryFindMany,
  blogCategoryFindFirst,
  blogPostCount,
  blogPostFindMany,
  mediaAssetFindMany,
} = vi.hoisted(() => ({
  blogCategoryFindMany: vi.fn(),
  blogCategoryFindFirst: vi.fn(),
  blogPostCount: vi.fn(),
  blogPostFindMany: vi.fn(),
  mediaAssetFindMany: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    blogCategory: {
      findMany: blogCategoryFindMany,
      findFirst: blogCategoryFindFirst,
    },
    blogPost: { count: blogPostCount, findMany: blogPostFindMany },
    mediaAsset: { findMany: mediaAssetFindMany },
  },
}));

import {
  getPublishedBlogCategoryBySlug,
  listPublishedBlogCategories,
  listPublishedBlogPostsByCategory,
} from '@/lib/content/blog-faqs';

const publishedWhere = {
  workflowStatus: WorkflowStatus.publicado,
  deletedAt: null,
};

describe('GTK-54 listado blog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    blogCategoryFindMany.mockResolvedValue([]);
    blogCategoryFindFirst.mockResolvedValue(null);
    blogPostCount.mockResolvedValue(0);
    blogPostFindMany.mockResolvedValue([]);
    mediaAssetFindMany.mockResolvedValue([]);
  });

  it('listPublishedBlogCategories devuelve categorías no borradas ordenadas', async () => {
    blogCategoryFindMany.mockResolvedValue([
      { id: '1', name: 'Normativa', slug: 'normativa', metaTitle: null, metaDescription: null, noindex: false },
    ]);
    const rows = await listPublishedBlogCategories();
    expect(blogCategoryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      }),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.slug).toBe('normativa');
  });

  it('getPublishedBlogCategoryBySlug resuelve slug', async () => {
    blogCategoryFindFirst.mockResolvedValue({
      id: 'c1',
      name: 'Técnicas',
      slug: 'tecnicas',
      description: null,
      metaTitle: 'Meta',
      metaDescription: 'Desc',
      noindex: false,
    });
    const cat = await getPublishedBlogCategoryBySlug('tecnicas');
    expect(cat?.name).toBe('Técnicas');
    expect(cat?.metaTitle).toBe('Meta');
  });

  it('listPublishedBlogPostsByCategory sin categoría lista todos los publicados', async () => {
    blogPostCount.mockResolvedValue(1);
    blogPostFindMany.mockResolvedValue([
      {
        id: 'p1',
        title: 'Post',
        slug: 'post',
        excerpt: null,
        publishedAt: new Date('2024-01-01'),
        readingMinutes: 5,
        heroImageId: null,
        category: { name: 'Normativa', slug: 'normativa' },
        teamAuthor: { slug: 'autor', fullName: 'Autor' },
      },
    ]);
    const result = await listPublishedBlogPostsByCategory({
      page: 1,
      pageSize: 12,
    });
    expect(blogPostCount).toHaveBeenCalledWith({ where: publishedWhere });
    expect(result.items).toHaveLength(1);
    expect(result.totalPages).toBe(1);
  });

  it('listPublishedBlogPostsByCategory filtra por categoría', async () => {
    blogPostCount.mockResolvedValue(0);
    blogPostFindMany.mockResolvedValue([]);
    await listPublishedBlogPostsByCategory({
      categorySlug: 'geologia',
      page: 1,
      pageSize: 12,
    });
    expect(blogPostCount).toHaveBeenCalledWith({
      where: {
        AND: [publishedWhere, { category: { slug: 'geologia', deletedAt: null } }],
      },
    });
  });

  it('listPublishedBlogPostsByCategory pagina y reclampa página fuera de rango', async () => {
    blogPostCount.mockResolvedValue(25);
    blogPostFindMany.mockResolvedValue([]);
    const result = await listPublishedBlogPostsByCategory({
      page: 99,
      pageSize: 12,
    });
    expect(result.page).toBe(3);
    expect(result.totalPages).toBe(3);
  });

  it('categoría vacía no rompe el listado', async () => {
    blogPostCount.mockResolvedValue(0);
    blogPostFindMany.mockResolvedValue([]);
    const result = await listPublishedBlogPostsByCategory({
      categorySlug: 'normativa',
      page: 1,
      pageSize: 12,
    });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});
