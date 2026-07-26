import { WorkflowStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/env', () => ({
  env: { MEDIA_STORAGE_BASE_URL: 'https://media.example.com' },
}));

const {
  serviceFindFirst,
  geoZoneFindFirst,
  serviceZonePageFindFirst,
  serviceZonePageFindMany,
  mediaAssetFindFirst,
} = vi.hoisted(() => ({
  serviceFindFirst: vi.fn(),
  geoZoneFindFirst: vi.fn(),
  serviceZonePageFindFirst: vi.fn(),
  serviceZonePageFindMany: vi.fn(),
  mediaAssetFindFirst: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    service: { findFirst: serviceFindFirst },
    geoZone: { findFirst: geoZoneFindFirst },
    serviceZonePage: {
      findFirst: serviceZonePageFindFirst,
      findMany: serviceZonePageFindMany,
    },
    mediaAsset: { findFirst: mediaAssetFindFirst },
  },
}));

import {
  getPublishedServiceZonePageBySlugs,
  listPublishedServiceZonePageStaticParams,
} from '@/lib/content/service-zone-pages';

const publishedWhere = {
  workflowStatus: WorkflowStatus.publicado,
  deletedAt: null,
};

describe('lecturas públicas GTK-52', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceFindFirst.mockResolvedValue(null);
    geoZoneFindFirst.mockResolvedValue(null);
    serviceZonePageFindFirst.mockResolvedValue(null);
    serviceZonePageFindMany.mockResolvedValue([]);
    mediaAssetFindFirst.mockResolvedValue(null);
  });

  it('getPublishedServiceZonePageBySlugs devuelve null si el servicio no está publicado', async () => {
    await expect(getPublishedServiceZonePageBySlugs('ensayos', 'madrid')).resolves.toBeNull();
    expect(serviceFindFirst).toHaveBeenCalled();
    expect(serviceZonePageFindFirst).not.toHaveBeenCalled();
  });

  it('getPublishedServiceZonePageBySlugs devuelve null si no hay intersección publicada', async () => {
    serviceFindFirst.mockResolvedValue({ id: 'svc-1', name: 'Estudios', slug: 'estudios' });
    geoZoneFindFirst.mockResolvedValue({
      id: 'zone-1',
      name: 'Madrid',
      slug: 'madrid',
      province: { name: 'Madrid', slug: 'madrid' },
    });
    serviceZonePageFindFirst.mockResolvedValue(null);

    await expect(getPublishedServiceZonePageBySlugs('estudios', 'madrid')).resolves.toBeNull();
    expect(serviceZonePageFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          serviceId: 'svc-1',
          zoneId: 'zone-1',
          ...publishedWhere,
        }),
      }),
    );
  });

  it('getPublishedServiceZonePageBySlugs incluye body, targetKeyword y SEO', async () => {
    serviceFindFirst.mockResolvedValue({
      id: 'svc-1',
      name: 'Estudios geotécnicos',
      slug: 'estudios',
      summary: 'Resumen servicio',
      heroImageId: null,
    });
    geoZoneFindFirst.mockResolvedValue({
      id: 'zone-1',
      name: 'Madrid',
      slug: 'madrid',
      province: { name: 'Madrid', slug: 'madrid' },
    });
    serviceZonePageFindFirst.mockResolvedValue({
      id: 'sz-1',
      slug: 'estudios-madrid',
      body: 'Contexto geológico único para Madrid.',
      targetKeyword: 'estudios geotécnicos madrid',
      h1: 'Estudios geotécnicos en Madrid',
      metaTitle: 'Meta',
      metaDescription: 'Desc',
      canonicalUrl: null,
      schemaType: 'Service',
      noindex: false,
    });

    const result = await getPublishedServiceZonePageBySlugs('estudios', 'madrid');
    expect(result).toMatchObject({
      body: 'Contexto geológico único para Madrid.',
      targetKeyword: 'estudios geotécnicos madrid',
      service: { slug: 'estudios' },
      zone: { slug: 'madrid' },
    });
  });

  it('listPublishedServiceZonePageStaticParams enumera pares servicio/zona', async () => {
    serviceZonePageFindMany.mockResolvedValue([
      { service: { slug: 'estudios' }, zone: { slug: 'madrid' } },
      { service: { slug: 'ensayos' }, zone: { slug: 'valencia' } },
    ]);
    await expect(listPublishedServiceZonePageStaticParams()).resolves.toEqual([
      { slug: 'estudios', zona: 'madrid' },
      { slug: 'ensayos', zona: 'valencia' },
    ]);
  });
});
