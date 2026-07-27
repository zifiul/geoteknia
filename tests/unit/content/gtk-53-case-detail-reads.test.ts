import { WorkflowStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/env', () => ({
  env: { MEDIA_STORAGE_BASE_URL: 'https://media.example.com' },
}));

const { caseStudyFindFirst, caseStudyFindMany, mediaAssetFindFirst } = vi.hoisted(() => ({
  caseStudyFindFirst: vi.fn(),
  caseStudyFindMany: vi.fn(),
  mediaAssetFindFirst: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    caseStudy: { findFirst: caseStudyFindFirst, findMany: caseStudyFindMany },
    mediaAsset: { findFirst: mediaAssetFindFirst },
  },
}));

import {
  getPublishedCaseStudyBySlug,
  listPublishedCaseStudySlugs,
} from '@/lib/content/case-studies';

const publishedWhere = {
  workflowStatus: WorkflowStatus.publicado,
  deletedAt: null,
};

describe('lecturas públicas GTK-53 — detalle de caso', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    caseStudyFindFirst.mockResolvedValue(null);
    caseStudyFindMany.mockResolvedValue([]);
    mediaAssetFindFirst.mockResolvedValue(null);
  });

  it('listPublishedCaseStudySlugs filtra publicados', async () => {
    caseStudyFindMany.mockResolvedValue([{ slug: 'caso-a' }]);
    const slugs = await listPublishedCaseStudySlugs();
    expect(slugs).toEqual([{ slug: 'caso-a' }]);
    expect(caseStudyFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: publishedWhere }),
    );
  });

  it('getPublishedCaseStudyBySlug devuelve null si no existe', async () => {
    const result = await getPublishedCaseStudyBySlug('ausente');
    expect(result).toBeNull();
    expect(caseStudyFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ...publishedWhere, slug: 'ausente' },
      }),
    );
  });

  it('getPublishedCaseStudyBySlug oculta clientName si clientIsPublic es false', async () => {
    caseStudyFindFirst.mockResolvedValue({
      id: 'cs-1',
      title: 'Caso',
      slug: 'caso',
      h1: null,
      problem: 'Problema',
      solution: 'Solución',
      result: null,
      testsSummary: null,
      boreholesCount: 3,
      metersDrilled: { toString: () => '120.5' },
      projectYear: 2024,
      latitude: null,
      longitude: null,
      clientName: 'Cliente secreto',
      clientIsPublic: false,
      metaTitle: null,
      metaDescription: null,
      canonicalUrl: null,
      schemaType: 'Article',
      noindex: false,
      publishedAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-06-01'),
      ogImageId: null,
      service: { id: 'svc-1', name: 'Estudios', slug: 'estudios' },
      province: { name: 'Valencia', slug: 'valencia', ccaa: 'Comunidad Valenciana' },
      workTypology: { name: 'Obra', slug: 'obra' },
      teamMembers: [],
    });

    const detail = await getPublishedCaseStudyBySlug('caso');
    expect(detail?.clientName).toBeNull();
    expect(detail?.metersDrilled).toBe(120.5);
    expect(detail?.teamMembers).toEqual([]);
  });

  it('getPublishedCaseStudyBySlug expone clientName y equipo cuando aplica', async () => {
    caseStudyFindFirst.mockResolvedValue({
      id: 'cs-2',
      title: 'Caso público',
      slug: 'caso-publico',
      h1: 'H1',
      problem: 'P',
      solution: 'S',
      result: 'R',
      testsSummary: 'SPT',
      boreholesCount: 1,
      metersDrilled: null,
      projectYear: 2023,
      latitude: { toString: () => '39.47' },
      longitude: { toString: () => '-0.38' },
      clientName: 'Puerto Valencia',
      clientIsPublic: true,
      metaTitle: 'Meta',
      metaDescription: 'Desc',
      canonicalUrl: null,
      schemaType: 'CreativeWork',
      noindex: false,
      publishedAt: null,
      updatedAt: new Date('2024-06-01'),
      ogImageId: 'img-1',
      service: { id: 'svc-2', name: 'Sondeos', slug: 'sondeos' },
      province: { name: 'Valencia', slug: 'valencia', ccaa: 'CV' },
      workTypology: { name: 'Infra', slug: 'infra' },
      teamMembers: [
        {
          role: 'Director',
          teamMember: {
            fullName: 'Ana López',
            slug: 'ana-lopez',
            jobTitle: 'Geóloga',
          },
        },
      ],
    });
    mediaAssetFindFirst.mockResolvedValue({
      fileUrl: '/photos/hero.jpg',
      altText: 'Campo',
    });

    const detail = await getPublishedCaseStudyBySlug('caso-publico');
    expect(detail?.clientName).toBe('Puerto Valencia');
    expect(detail?.latitude).toBe(39.47);
    expect(detail?.heroImageUrl).toBe('https://media.example.com/photos/hero.jpg');
    expect(detail?.teamMembers).toEqual([
      {
        fullName: 'Ana López',
        slug: 'ana-lopez',
        jobTitle: 'Geóloga',
        role: 'Director',
      },
    ]);
  });
});
