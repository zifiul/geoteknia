import { WorkflowStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/env', () => ({
  env: {
    MEDIA_STORAGE_BASE_URL: 'https://media.example.com',
    NEXT_PUBLIC_SITE_URL: 'https://geoteknia.es',
  },
}));

const { machineryFindMany, machineryFindFirst, mediaAssetFindMany } = vi.hoisted(() => ({
  machineryFindMany: vi.fn(),
  machineryFindFirst: vi.fn(),
  mediaAssetFindMany: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    machinery: { findMany: machineryFindMany, findFirst: machineryFindFirst },
    mediaAsset: { findMany: mediaAssetFindMany },
  },
}));

import {
  getPublishedMachineryBySlug,
  listPublishedMachinery,
} from '@/lib/content/machinery';

const publishedWhere = {
  workflowStatus: WorkflowStatus.publicado,
  deletedAt: null,
};

const sampleRow = {
  id: 'm1',
  name: 'Sonda Hütte',
  slug: 'sonda-hutte',
  equipmentType: 'sonda_rotacion' as const,
  model: 'HBR 203',
  maxDepthM: { toString: () => '50.00' },
  diameters: 'HQ, NQ',
  inSituTests: ['SPT', 'DPSH'],
  hasEnacLab: true,
  photoId: 'ph1',
  services: [
    {
      service: {
        id: 's1',
        name: 'Estudio geotécnico',
        slug: 'estudio-geotecnico',
      },
    },
  ],
};

describe('getPublishedMachineryBySlug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    machineryFindFirst.mockResolvedValue(null);
    mediaAssetFindMany.mockResolvedValue([]);
  });

  it('filtra por slug y PUBLISHED_EDITORIAL_WHERE', async () => {
    await getPublishedMachineryBySlug('sonda-hutte');
    expect(machineryFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          slug: 'sonda-hutte',
          ...publishedWhere,
        },
      }),
    );
  });

  it('devuelve null si no existe o no está publicado', async () => {
    machineryFindFirst.mockResolvedValue(null);
    expect(await getPublishedMachineryBySlug('inexistente')).toBeNull();
  });

  it('devuelve DTO completo con foto y servicios publicados', async () => {
    machineryFindFirst.mockResolvedValue(sampleRow);
    mediaAssetFindMany.mockResolvedValue([
      {
        id: 'ph1',
        fileUrl: '/machinery/hutte.jpg',
        altText: 'Sonda en obra',
      },
    ]);

    const item = await getPublishedMachineryBySlug('sonda-hutte');
    expect(item).toMatchObject({
      slug: 'sonda-hutte',
      name: 'Sonda Hütte',
      maxDepthM: '50.00',
      inSituTests: ['SPT', 'DPSH'],
      photoUrl: 'https://media.example.com/machinery/hutte.jpg',
      services: [{ slug: 'estudio-geotecnico' }],
    });
  });

  it('tolera inSituTests inválido sin excepción', async () => {
    machineryFindFirst.mockResolvedValue({
      ...sampleRow,
      inSituTests: { invalid: true },
    });

    const item = await getPublishedMachineryBySlug('sonda-hutte');
    expect(item?.inSituTests).toBeNull();
  });
});

describe('listPublishedMachinery (regresión tras refactor)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    machineryFindMany.mockResolvedValue([]);
    mediaAssetFindMany.mockResolvedValue([]);
  });

  it('sigue filtrando por PUBLISHED_EDITORIAL_WHERE', async () => {
    await listPublishedMachinery();
    expect(machineryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: publishedWhere,
      }),
    );
  });
});
