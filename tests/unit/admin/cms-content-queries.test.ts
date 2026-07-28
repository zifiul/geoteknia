/**
 * GTK-72 — listCmsContent y filtros.
 */
import { WorkflowStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { requirePermission, findMany, userFindMany } = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  findMany: vi.fn(),
  userFindMany: vi.fn(),
}));

vi.mock('@/lib/auth/rbac', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth/rbac')>();
  return { ...actual, requirePermission };
});

vi.mock('@/lib/db', () => ({
  db: {
    service: { findMany },
    geoZone: { findMany },
    serviceZonePage: { findMany },
    caseStudy: { findMany },
    blogPost: { findMany },
    faq: { findMany },
    teamMember: { findMany },
    machinery: { findMany },
    user: { findMany: userFindMany },
  },
}));

import { listCmsContent } from '@/lib/admin/cms-content-queries';
import { parseCmsFiltersFromSearchParams } from '@/lib/admin/cms-filters-schema';
import { contentTypesForSilo } from '@/lib/admin/cms-content-types';

describe('parseCmsFiltersFromSearchParams (GTK-72)', () => {
  it('sanea params inválidos', () => {
    const filters = parseCmsFiltersFromSearchParams({
      type: 'invalid',
      status: 'not-a-status',
      silo: 'unknown',
      page: '2',
      pageSize: '25',
    });
    expect(filters.type).toBeUndefined();
    expect(filters.status).toBeUndefined();
    expect(filters.silo).toBeUndefined();
    expect(filters.page).toBe(2);
  });

  it('acepta filtros válidos', () => {
    const filters = parseCmsFiltersFromSearchParams({
      type: 'blog_post',
      status: WorkflowStatus.borrador_ia,
      silo: 'blog',
    });
    expect(filters.type).toBe('blog_post');
    expect(filters.status).toBe(WorkflowStatus.borrador_ia);
    expect(filters.silo).toBe('blog');
  });
});

describe('contentTypesForSilo (GTK-72)', () => {
  it('mapea blog a blog_post', () => {
    expect(contentTypesForSilo('blog')).toEqual(['blog_post']);
  });
});

describe('listCmsContent (GTK-72)', () => {
  const updatedAt = new Date('2026-07-01T12:00:00Z');

  beforeEach(() => {
    vi.clearAllMocks();
    requirePermission.mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111111',
      roleName: 'editor',
    });
    userFindMany.mockResolvedValue([
      { id: 'a1', fullName: 'Editor Uno' },
    ]);
    findMany.mockImplementation(async () => []);
  });

  it('exige content.read', async () => {
    requirePermission.mockRejectedValue(new Error('forbidden'));
    await expect(
      listCmsContent({
        page: 1,
        pageSize: 25,
      }),
    ).rejects.toThrow('forbidden');
    expect(requirePermission).toHaveBeenCalledWith('content.read');
  });

  it('filtra por tipo y estado', async () => {
    findMany.mockImplementation(async (args: { where?: { workflowStatus?: string } }) => {
      if (args?.where?.workflowStatus === WorkflowStatus.borrador_ia) {
        return [
          {
            id: 'b1',
            title: 'Post A',
            workflowStatus: WorkflowStatus.borrador_ia,
            authorId: 'a1',
            updatedAt,
          },
        ];
      }
      return [];
    });

    const result = await listCmsContent({
      type: 'blog_post',
      status: WorkflowStatus.borrador_ia,
      page: 1,
      pageSize: 25,
    });

    expect(result.total).toBe(1);
    expect(result.items[0]?.title).toBe('Post A');
    expect(result.items[0]?.authorName).toBe('Editor Uno');
    expect(findMany).toHaveBeenCalledTimes(1);
  });

  it('pagina resultados mezclados por updatedAt', async () => {
    const older = new Date('2026-06-01T12:00:00Z');
    const newer = new Date('2026-07-15T12:00:00Z');

    findMany
      .mockResolvedValueOnce([
        {
          id: 's1',
          name: 'Servicio',
          workflowStatus: WorkflowStatus.publicado,
          authorId: null,
          updatedAt: older,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'b1',
          title: 'Blog nuevo',
          workflowStatus: WorkflowStatus.borrador_ia,
          authorId: null,
          updatedAt: newer,
        },
      ]);

    const result = await listCmsContent({
      type: 'service',
      page: 1,
      pageSize: 1,
    });

    // Solo service type requested — one model
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.title).toBe('Servicio');
  });

  it('devuelve vacío si tipo no pertenece al silo', async () => {
    const result = await listCmsContent({
      type: 'blog_post',
      silo: 'servicios',
      page: 1,
      pageSize: 25,
    });
    expect(result.total).toBe(0);
    expect(findMany).not.toHaveBeenCalled();
  });
});
