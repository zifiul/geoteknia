import { WorkflowStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/env', () => ({
  env: { MEDIA_STORAGE_BASE_URL: 'https://media.example.com' },
}));

const {
  caseStudyCount,
  caseStudyFindMany,
  serviceFindFirst,
  workTypologyFindFirst,
  provinceFindFirst,
  mediaAssetFindMany,
  provinceFindMany,
  workTypologyFindMany,
} = vi.hoisted(() => ({
  caseStudyCount: vi.fn(),
  caseStudyFindMany: vi.fn(),
  serviceFindFirst: vi.fn(),
  workTypologyFindFirst: vi.fn(),
  provinceFindFirst: vi.fn(),
  mediaAssetFindMany: vi.fn(),
  provinceFindMany: vi.fn(),
  workTypologyFindMany: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    caseStudy: { count: caseStudyCount, findMany: caseStudyFindMany },
    service: { findFirst: serviceFindFirst },
    workTypology: { findFirst: workTypologyFindFirst, findMany: workTypologyFindMany },
    province: { findFirst: provinceFindFirst, findMany: provinceFindMany },
    mediaAsset: { findMany: mediaAssetFindMany },
  },
}));

import {
  buildCaseCatalogWhere,
  listPublishedCaseStudiesCatalog,
  listPublishedCaseStudyProjectYears,
} from '@/lib/content/case-studies';
import { listOperationalProvinces, listWorkTypologies } from '@/lib/content/masters';
import { parseCatalogYearRaw } from '@/lib/cases/catalog-search-params';

const publishedWhere = {
  workflowStatus: WorkflowStatus.publicado,
  deletedAt: null,
};

describe('GTK-50 catálogo de casos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    caseStudyCount.mockResolvedValue(0);
    caseStudyFindMany.mockResolvedValue([]);
    serviceFindFirst.mockResolvedValue(null);
    workTypologyFindFirst.mockResolvedValue(null);
    provinceFindFirst.mockResolvedValue(null);
    mediaAssetFindMany.mockResolvedValue([]);
    provinceFindMany.mockResolvedValue([]);
    workTypologyFindMany.mockResolvedValue([]);
  });

  it('parseCatalogYearRaw ignora años inválidos', () => {
    expect(parseCatalogYearRaw('')).toBeUndefined();
    expect(parseCatalogYearRaw('abc')).toBeUndefined();
    expect(parseCatalogYearRaw('1899')).toBeUndefined();
    expect(parseCatalogYearRaw('2024')).toBe(2024);
  });

  it('buildCaseCatalogWhere combina publicado con serviceId resuelto', async () => {
    serviceFindFirst.mockResolvedValue({ id: 'svc-1' });
    const where = await buildCaseCatalogWhere({ serviceSlug: 'sondeos' });
    expect(serviceFindFirst).toHaveBeenCalled();
    expect(where).toEqual({
      AND: [publishedWhere, { serviceId: 'svc-1' }],
    });
  });

  it('buildCaseCatalogWhere ignora slug de servicio inexistente', async () => {
    const where = await buildCaseCatalogWhere({ serviceSlug: 'no-existe' });
    expect(where).toEqual(publishedWhere);
  });

  it('listPublishedCaseStudiesCatalog pagina y cuenta', async () => {
    caseStudyCount.mockResolvedValue(25);
    caseStudyFindMany.mockResolvedValue([
      {
        id: 'c1',
        title: 'Caso',
        slug: 'caso',
        projectYear: 2023,
        boreholesCount: 2,
        metersDrilled: null,
        ogImageId: null,
        service: { id: 's1', name: 'S', slug: 's' },
        workTypology: { name: 'T', slug: 't' },
        province: { name: 'Madrid', slug: 'madrid', ccaa: 'Madrid' },
      },
    ]);

    const result = await listPublishedCaseStudiesCatalog(
      { provinceSlug: 'madrid' },
      { page: 2, pageSize: 12 },
    );

    expect(caseStudyCount).toHaveBeenCalled();
    expect(caseStudyFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 12,
        take: 12,
        where: publishedWhere,
      }),
    );
    expect(result.total).toBe(25);
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(3);
    expect(result.items).toHaveLength(1);
  });

  it('listOperationalProvinces filtra isOperational', async () => {
    await listOperationalProvinces();
    expect(provinceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isOperational: true, deletedAt: null },
      }),
    );
  });

  it('listWorkTypologies ordena por order', async () => {
    await listWorkTypologies();
    expect(workTypologyFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
      }),
    );
  });

  it('listPublishedCaseStudyProjectYears solo años publicados', async () => {
    caseStudyFindMany.mockResolvedValue([{ projectYear: 2022 }, { projectYear: 2020 }]);
    const years = await listPublishedCaseStudyProjectYears();
    expect(caseStudyFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining(publishedWhere),
        distinct: ['projectYear'],
      }),
    );
    expect(years).toEqual([2022, 2020]);
  });
});
