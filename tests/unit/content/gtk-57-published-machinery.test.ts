import { WorkflowStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/env', () => ({
  env: { MEDIA_STORAGE_BASE_URL: 'https://media.example.com' },
}));

const { machineryFindMany, mediaAssetFindMany } = vi.hoisted(() => ({
  machineryFindMany: vi.fn(),
  mediaAssetFindMany: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    machinery: { findMany: machineryFindMany },
    mediaAsset: { findMany: mediaAssetFindMany },
  },
}));

import { listPublishedMachinery } from '@/lib/content/machinery';

const publishedWhere = {
  workflowStatus: WorkflowStatus.publicado,
  deletedAt: null,
};

describe('GTK-57 listPublishedMachinery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    machineryFindMany.mockResolvedValue([]);
    mediaAssetFindMany.mockResolvedValue([]);
  });

  it('filtra por PUBLISHED_EDITORIAL_WHERE', async () => {
    await listPublishedMachinery();
    expect(machineryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: publishedWhere,
        orderBy: { name: 'asc' },
      }),
    );
  });

  it('resuelve foto y servicios vinculados', async () => {
    machineryFindMany.mockResolvedValue([
      {
        id: 'm1',
        name: 'Sonda Hütte',
        slug: 'sonda-hutte',
        equipmentType: 'sonda_rotacion',
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
      },
    ]);
    mediaAssetFindMany.mockResolvedValue([
      {
        id: 'ph1',
        fileUrl: '/machinery/hutte.jpg',
        altText: 'Sonda en obra',
      },
    ]);

    const rows = await listPublishedMachinery();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.photoUrl).toBe('https://media.example.com/machinery/hutte.jpg');
    expect(rows[0]?.photoAlt).toBe('Sonda en obra');
    expect(rows[0]?.services).toEqual([
      { id: 's1', name: 'Estudio geotécnico', slug: 'estudio-geotecnico' },
    ]);
    expect(rows[0]?.inSituTests).toEqual(['SPT', 'DPSH']);
    expect(rows[0]?.maxDepthM).toBe('50.00');
  });

  it('tolera inSituTests y hasEnacLab nulos', async () => {
    machineryFindMany.mockResolvedValue([
      {
        id: 'm2',
        name: 'Oruga',
        slug: 'oruga',
        equipmentType: 'vehiculo_especial',
        model: null,
        maxDepthM: null,
        diameters: null,
        inSituTests: null,
        hasEnacLab: null,
        photoId: null,
        services: [],
      },
    ]);

    const rows = await listPublishedMachinery();
    expect(rows[0]?.inSituTests).toBeNull();
    expect(rows[0]?.hasEnacLab).toBeNull();
    expect(rows[0]?.photoUrl).toBeNull();
    expect(mediaAssetFindMany).not.toHaveBeenCalled();
  });

  it('ignora inSituTests JSON inválido', async () => {
    machineryFindMany.mockResolvedValue([
      {
        id: 'm3',
        name: 'Equipo',
        slug: 'equipo',
        equipmentType: 'ensayo_in_situ',
        model: null,
        maxDepthM: null,
        diameters: null,
        inSituTests: { invalid: true },
        hasEnacLab: false,
        photoId: null,
        services: [],
      },
    ]);

    const rows = await listPublishedMachinery();
    expect(rows[0]?.inSituTests).toBeNull();
  });
});
