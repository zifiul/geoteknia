import { WorkflowStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/env', () => ({
  env: { MEDIA_STORAGE_BASE_URL: 'https://media.example.com' },
}));

const {
  serviceFindFirst,
  serviceFindMany,
  caseStudyFindMany,
  faqFindMany,
  serviceZonePageFindMany,
  machineryServiceFindMany,
  machineryFindMany,
  mediaAssetFindFirst,
  mediaAssetFindMany,
} = vi.hoisted(() => ({
  serviceFindFirst: vi.fn(),
  serviceFindMany: vi.fn(),
  caseStudyFindMany: vi.fn(),
  faqFindMany: vi.fn(),
  serviceZonePageFindMany: vi.fn(),
  machineryServiceFindMany: vi.fn(),
  machineryFindMany: vi.fn(),
  mediaAssetFindFirst: vi.fn(),
  mediaAssetFindMany: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    service: { findFirst: serviceFindFirst, findMany: serviceFindMany },
    caseStudy: { findMany: caseStudyFindMany },
    faq: { findMany: faqFindMany },
    serviceZonePage: { findMany: serviceZonePageFindMany },
    machineryService: { findMany: machineryServiceFindMany },
    machinery: { findMany: machineryFindMany },
    mediaAsset: { findFirst: mediaAssetFindFirst, findMany: mediaAssetFindMany },
  },
}));

import { listPublishedFaqsByService } from '@/lib/content/blog-faqs';
import { listPublishedCaseStudiesByService } from '@/lib/content/case-studies';
import { listMachineryByService } from '@/lib/content/machinery';
import { listPublishedServiceZonePagesByService } from '@/lib/content/service-zone-pages';
import { getPublishedServiceBySlug } from '@/lib/content/services';

const publishedWhere = {
  workflowStatus: WorkflowStatus.publicado,
  deletedAt: null,
};

describe('lecturas públicas GTK-49', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceFindFirst.mockResolvedValue(null);
    caseStudyFindMany.mockResolvedValue([]);
    faqFindMany.mockResolvedValue([]);
    serviceZonePageFindMany.mockResolvedValue([]);
    machineryServiceFindMany.mockResolvedValue([]);
    machineryFindMany.mockResolvedValue([]);
    mediaAssetFindFirst.mockResolvedValue(null);
    mediaAssetFindMany.mockResolvedValue([]);
  });

  it('getPublishedServiceBySlug devuelve null si no hay fila publicada', async () => {
    serviceFindFirst.mockResolvedValue(null);
    await expect(getPublishedServiceBySlug('inexistente')).resolves.toBeNull();
    expect(serviceFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'inexistente', ...publishedWhere },
      }),
    );
  });

  it('getPublishedServiceBySlug resuelve hero y campos editoriales', async () => {
    serviceFindFirst.mockResolvedValue({
      id: 'svc-1',
      name: 'Estudios',
      slug: 'estudios',
      summary: 'Resumen',
      body: 'Cuerpo',
      methodology: [{ title: 'Paso 1' }],
      applicableNorms: 'CTE',
      deliverables: ['Memoria'],
      h1: null,
      heroImageId: 'img-1',
      metaTitle: 'T',
      metaDescription: 'D',
      canonicalUrl: null,
      schemaType: 'Service',
      noindex: false,
    });
    mediaAssetFindFirst.mockResolvedValue({
      fileUrl: '/hero.jpg',
      altText: 'Hero',
    });
    const row = await getPublishedServiceBySlug('estudios');
    expect(row?.heroImageUrl).toContain('hero.jpg');
    expect(row?.body).toBe('Cuerpo');
  });

  it('listPublishedCaseStudiesByService filtra por serviceId y publicado', async () => {
    await listPublishedCaseStudiesByService('svc-1', 4);
    expect(caseStudyFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { serviceId: 'svc-1', ...publishedWhere },
        take: 4,
      }),
    );
  });

  it('listPublishedFaqsByService filtra grupo de servicio y FAQ publicada', async () => {
    await listPublishedFaqsByService('svc-1');
    expect(faqFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          ...publishedWhere,
          faqGroup: { serviceId: 'svc-1', deletedAt: null },
        },
      }),
    );
  });

  it('listPublishedServiceZonePagesByService filtra páginas publicadas', async () => {
    await listPublishedServiceZonePagesByService('svc-1');
    expect(serviceZonePageFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { serviceId: 'svc-1', ...publishedWhere },
      }),
    );
  });

  it('listMachineryByService solo maquinaria publicada enlazada', async () => {
    machineryServiceFindMany.mockResolvedValue([{ machineryId: 'm1' }]);
    await listMachineryByService('svc-1');
    expect(machineryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: ['m1'] },
          ...publishedWhere,
        }),
      }),
    );
  });
});
