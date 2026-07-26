import { WorkflowStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/env', () => ({
  env: { MEDIA_STORAGE_BASE_URL: 'https://media.example.com' },
}));

const {
  geoZoneFindFirst,
  geoZoneFindMany,
  serviceZoneCoverageFindMany,
  serviceZonePageFindMany,
  mediaAssetFindFirst,
} = vi.hoisted(() => ({
  geoZoneFindFirst: vi.fn(),
  geoZoneFindMany: vi.fn(),
  serviceZoneCoverageFindMany: vi.fn(),
  serviceZonePageFindMany: vi.fn(),
  mediaAssetFindFirst: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    geoZone: { findFirst: geoZoneFindFirst, findMany: geoZoneFindMany },
    serviceZoneCoverage: { findMany: serviceZoneCoverageFindMany },
    serviceZonePage: { findMany: serviceZonePageFindMany },
    mediaAsset: { findFirst: mediaAssetFindFirst },
  },
}));

import {
  getPublishedGeoZoneBySlug,
  listPublishedGeoZones,
  listServiceCoverageByZone,
} from '@/lib/content/geo-zones';
import { resolveRevalidationPaths } from '@/lib/content/revalidate';

const publishedWhere = {
  workflowStatus: WorkflowStatus.publicado,
  deletedAt: null,
};

describe('lecturas públicas GTK-51', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    geoZoneFindFirst.mockResolvedValue(null);
    geoZoneFindMany.mockResolvedValue([]);
    serviceZoneCoverageFindMany.mockResolvedValue([]);
    serviceZonePageFindMany.mockResolvedValue([]);
    mediaAssetFindFirst.mockResolvedValue(null);
  });

  it('getPublishedGeoZoneBySlug devuelve null si no hay fila publicada', async () => {
    await expect(getPublishedGeoZoneBySlug('inexistente')).resolves.toBeNull();
    expect(geoZoneFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'inexistente', ...publishedWhere },
      }),
    );
  });

  it('getPublishedGeoZoneBySlug incluye geología, provincia y hero', async () => {
    geoZoneFindFirst.mockResolvedValue({
      id: 'zone-1',
      name: 'Madrid',
      slug: 'madrid',
      localGeology: 'Arcillas del Mioceno',
      operationalBase: 'Base en Móstoles',
      body: 'Texto largo de la zona.',
      h1: null,
      heroImageId: 'img-1',
      metaTitle: 'T',
      metaDescription: 'D',
      canonicalUrl: null,
      schemaType: 'LocalBusiness',
      noindex: false,
      province: { name: 'Madrid', slug: 'madrid', ccaa: 'Comunidad de Madrid' },
    });
    mediaAssetFindFirst.mockResolvedValue({
      fileUrl: '/hero.jpg',
      altText: 'Obra en Madrid',
    });
    const row = await getPublishedGeoZoneBySlug('madrid');
    expect(row?.localGeology).toContain('Arcillas');
    expect(row?.province.slug).toBe('madrid');
    expect(row?.heroImageUrl).toContain('hero.jpg');
  });

  it('listServiceCoverageByZone prefiere service_zone_page publicada', async () => {
    serviceZoneCoverageFindMany.mockResolvedValue([
      {
        service: { id: 'svc-1', name: 'Estudios', slug: 'estudios' },
      },
    ]);
    serviceZonePageFindMany.mockResolvedValue([
      {
        serviceId: 'svc-1',
        slug: 'estudios-madrid',
        h1: 'Estudios en Madrid',
        service: { slug: 'estudios' },
      },
    ]);
    const links = await listServiceCoverageByZone('zone-1', 'madrid');
    expect(links).toHaveLength(1);
    expect(links[0]?.isIntersectionPage).toBe(true);
    expect(links[0]?.href).toBe('/servicios/estudios/madrid');
    expect(links[0]?.label).toBe('Estudios en Madrid');
  });

  it('listServiceCoverageByZone enlaza al servicio genérico sin intersección', async () => {
    serviceZoneCoverageFindMany.mockResolvedValue([
      {
        service: { id: 'svc-2', name: 'Ensayos', slug: 'ensayos' },
      },
    ]);
    serviceZonePageFindMany.mockResolvedValue([]);
    const links = await listServiceCoverageByZone('zone-1', 'madrid');
    expect(links[0]?.href).toBe('/servicios/ensayos');
    expect(links[0]?.isIntersectionPage).toBe(false);
  });

  it('listPublishedGeoZones filtra publicadas', async () => {
    await listPublishedGeoZones({ take: 10 });
    expect(geoZoneFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: publishedWhere,
        take: 10,
      }),
    );
  });

  it('resolveRevalidationPaths geo_zone devuelve /zonas/[slug]', async () => {
    const paths = await resolveRevalidationPaths('geo_zone', 'id-1', {
      slug: 'valencia',
    });
    expect(paths).toEqual(['/zonas/valencia']);
  });
});
