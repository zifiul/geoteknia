/**
 * GTK-42 — fuentes del sitemap (mocks Prisma).
 */
import { WorkflowStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/env', () => ({
  env: { NEXT_PUBLIC_SITE_URL: 'https://geoteknia.es' },
}));

const serviceFindMany = vi.fn();
const geoZoneFindMany = vi.fn();
const serviceZonePageFindMany = vi.fn();
const caseStudyFindMany = vi.fn();
const blogPostFindMany = vi.fn();
const teamMemberFindMany = vi.fn();
const machineryFindMany = vi.fn();
const faqGroupFindMany = vi.fn();
const contentMediaFindMany = vi.fn();
const serviceFindFirst = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    service: {
      findMany: serviceFindMany,
      findFirst: serviceFindFirst,
    },
    geoZone: { findMany: geoZoneFindMany, findFirst: vi.fn() },
    serviceZonePage: { findMany: serviceZonePageFindMany, findFirst: vi.fn() },
    caseStudy: { findMany: caseStudyFindMany, findFirst: vi.fn() },
    blogPost: { findMany: blogPostFindMany, findFirst: vi.fn() },
    teamMember: { findMany: teamMemberFindMany, findFirst: vi.fn() },
    machinery: { findMany: machineryFindMany, findFirst: vi.fn() },
    faqGroup: { findMany: faqGroupFindMany, findFirst: vi.fn() },
    contentMedia: { findMany: contentMediaFindMany },
  },
}));

describe('getIndexableServiceUrls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    geoZoneFindMany.mockResolvedValue([]);
    serviceZonePageFindMany.mockResolvedValue([]);
    caseStudyFindMany.mockResolvedValue([]);
    blogPostFindMany.mockResolvedValue([]);
    teamMemberFindMany.mockResolvedValue([]);
    machineryFindMany.mockResolvedValue([]);
    faqGroupFindMany.mockResolvedValue([]);
  });

  it('devuelve solo publicado con canonical y lastModified', async () => {
    const publishedAt = new Date('2026-01-15T00:00:00Z');
    serviceFindMany.mockResolvedValue([
      {
        slug: 'sondeos',
        canonicalUrl: null,
        publishedAt,
        updatedAt: new Date('2026-02-01'),
      },
    ]);

    const { getIndexableServiceUrls } = await import('@/lib/seo/sitemap-sources');
    const entries = await getIndexableServiceUrls();

    expect(serviceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          workflowStatus: WorkflowStatus.publicado,
          noindex: false,
          deletedAt: null,
        },
      }),
    );
    expect(entries).toHaveLength(1);
    expect(entries[0]?.url).toBe('https://geoteknia.es/servicios/sondeos');
    expect(entries[0]?.lastModified).toEqual(publishedAt);
    expect(entries[0]?.priority).toBe(1);
  });
});

describe('getIndexableImageEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('excluye media de contenido no publicado (SEC-1 imágenes)', async () => {
    contentMediaFindMany.mockResolvedValue([
      {
        contentType: 'service',
        contentId: 'uuid-draft',
        mediaAsset: {
          fileUrl: 'https://cdn.example.com/a.jpg',
          altText: null,
          title: null,
        },
      },
    ]);
    serviceFindFirst.mockResolvedValue(null);

    const { getIndexableImageEntries } = await import('@/lib/seo/sitemap-sources');
    const entries = await getIndexableImageEntries();
    expect(entries).toHaveLength(0);
  });

  it('omite caption si alt y title son null', async () => {
    contentMediaFindMany.mockResolvedValue([
      {
        contentType: 'service',
        contentId: 'uuid-ok',
        mediaAsset: {
          fileUrl: 'https://cdn.example.com/b.jpg',
          altText: null,
          title: null,
        },
      },
    ]);
    serviceFindFirst
      .mockResolvedValueOnce({ id: 'uuid-ok' })
      .mockResolvedValueOnce({
        slug: 'svc',
        canonicalUrl: 'https://geoteknia.es/servicios/svc',
      });

    const { getIndexableImageEntries } = await import('@/lib/seo/sitemap-sources');
    const entries = await getIndexableImageEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]?.caption).toBeUndefined();
  });
});
