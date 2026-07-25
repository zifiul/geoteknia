/**
 * GTK-78 — regresiones: no reimplementar GTK-42/43; solo verificar comportamiento existente.
 */
import { WorkflowStatus } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/env', () => ({
  env: { NEXT_PUBLIC_SITE_URL: 'https://geoteknia.es' },
}));

const serviceFindMany = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    service: { findMany: serviceFindMany, findFirst: vi.fn() },
    geoZone: { findMany: vi.fn(), findFirst: vi.fn() },
    serviceZonePage: { findMany: vi.fn(), findFirst: vi.fn() },
    caseStudy: { findMany: vi.fn(), findFirst: vi.fn() },
    blogPost: { findMany: vi.fn(), findFirst: vi.fn() },
    teamMember: { findMany: vi.fn(), findFirst: vi.fn() },
    machinery: { findMany: vi.fn(), findFirst: vi.fn() },
    faqGroup: { findMany: vi.fn(), findFirst: vi.fn() },
    contentMedia: { findMany: vi.fn() },
  },
}));

describe('GTK-78 regresiones SEO', () => {
  it('sitemap-sources consulta solo publicado noindex:false (GTK-42)', async () => {
    serviceFindMany.mockResolvedValue([]);
    const { getIndexableServiceUrls } = await import('@/lib/seo/sitemap-sources');
    await getIndexableServiceUrls();
    expect(serviceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          workflowStatus: WorkflowStatus.publicado,
          noindex: false,
          deletedAt: null,
        },
      }),
    );
  });

  it('admin layout metadata noindex (GTK-43)', async () => {
    const { metadata: adminGroupMetadata } = await import(
      '@/app/(admin)/layout'
    );
    expect(adminGroupMetadata.robots).toEqual({
      index: false,
      follow: false,
    });
  });

  it('buildMetadata mantiene canonical de entidad sin query (GTK-45)', async () => {
    const { buildMetadata } = await import('@/lib/seo/metadata');
    const meta = buildMetadata('https://geoteknia.es', 'service', {
      slug: 'sondeos',
      schemaType: 'Service' as never,
      noindex: false,
    });
    expect(meta.alternates?.canonical).toBe(
      'https://geoteknia.es/servicios/sondeos',
    );
  });
});
