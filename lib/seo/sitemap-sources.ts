import 'server-only';

import { WorkflowStatus } from '@prisma/client';

import { env } from '@/lib/env';
import { db } from '@/lib/db';
import {
  SITEMAP_PRIORITY_BY_KIND,
  type SitemapChangeFrequency,
  type SitemapPriorityKind,
} from '@/lib/seo/sitemap-config';
import { resolveContentUrl } from '@/lib/seo/silo-urls';

const INDEXABLE_EDITORIAL = {
  workflowStatus: WorkflowStatus.publicado,
  noindex: false,
  deletedAt: null,
} as const;

export type SitemapEntry = {
  url: string;
  lastModified?: Date;
  changeFrequency?: SitemapChangeFrequency;
  priority?: number;
};

export type ImageSitemapEntry = {
  pageUrl: string;
  imageLoc: string;
  caption?: string;
};

function lastMod(publishedAt: Date | null, updatedAt: Date): Date {
  return publishedAt ?? updatedAt;
}

function withMeta(
  kind: SitemapPriorityKind,
  entry: Omit<SitemapEntry, 'changeFrequency' | 'priority'>,
): SitemapEntry {
  const meta = SITEMAP_PRIORITY_BY_KIND[kind];
  return {
    ...entry,
    changeFrequency: meta.changeFrequency,
    priority: meta.priority,
  };
}

function siteUrl(): string {
  return env.NEXT_PUBLIC_SITE_URL;
}

export async function getIndexableServiceUrls(): Promise<SitemapEntry[]> {
  const rows = await db.service.findMany({
    where: INDEXABLE_EDITORIAL,
    select: {
      slug: true,
      canonicalUrl: true,
      publishedAt: true,
      updatedAt: true,
    },
  });
  const base = siteUrl();
  return rows.map((row) =>
    withMeta('service', {
      url: resolveContentUrl(base, 'service', row),
      lastModified: lastMod(row.publishedAt, row.updatedAt),
    }),
  );
}

export async function getIndexableGeoZoneUrls(): Promise<SitemapEntry[]> {
  const rows = await db.geoZone.findMany({
    where: INDEXABLE_EDITORIAL,
    select: {
      slug: true,
      canonicalUrl: true,
      publishedAt: true,
      updatedAt: true,
    },
  });
  const base = siteUrl();
  return rows.map((row) =>
    withMeta('geo_zone', {
      url: resolveContentUrl(base, 'geo_zone', row),
      lastModified: lastMod(row.publishedAt, row.updatedAt),
    }),
  );
}

export async function getIndexableServiceZonePageUrls(): Promise<SitemapEntry[]> {
  const rows = await db.serviceZonePage.findMany({
    where: INDEXABLE_EDITORIAL,
    select: {
      slug: true,
      canonicalUrl: true,
      publishedAt: true,
      updatedAt: true,
      service: { select: { slug: true } },
      zone: { select: { slug: true } },
    },
  });
  const base = siteUrl();
  return rows.map((row) =>
    withMeta('service_zone_page', {
      url: resolveContentUrl(base, 'service_zone_page', row, {
        serviceSlug: row.service.slug,
        zoneSlug: row.zone.slug,
      }),
      lastModified: lastMod(row.publishedAt, row.updatedAt),
    }),
  );
}

export async function getIndexableCaseStudyUrls(): Promise<SitemapEntry[]> {
  const rows = await db.caseStudy.findMany({
    where: INDEXABLE_EDITORIAL,
    select: {
      slug: true,
      canonicalUrl: true,
      publishedAt: true,
      updatedAt: true,
    },
  });
  const base = siteUrl();
  return rows.map((row) =>
    withMeta('case_study', {
      url: resolveContentUrl(base, 'case_study', row),
      lastModified: lastMod(row.publishedAt, row.updatedAt),
    }),
  );
}

export async function getIndexableBlogPostUrls(): Promise<SitemapEntry[]> {
  const rows = await db.blogPost.findMany({
    where: INDEXABLE_EDITORIAL,
    select: {
      slug: true,
      canonicalUrl: true,
      publishedAt: true,
      updatedAt: true,
      category: { select: { slug: true } },
    },
  });
  const base = siteUrl();
  return rows.map((row) =>
    withMeta('blog_post', {
      url: resolveContentUrl(base, 'blog_post', row, {
        categorySlug: row.category.slug,
      }),
      lastModified: lastMod(row.publishedAt, row.updatedAt),
    }),
  );
}

export async function getIndexableTeamMemberUrls(): Promise<SitemapEntry[]> {
  const rows = await db.teamMember.findMany({
    where: {
      workflowStatus: WorkflowStatus.publicado,
      deletedAt: null,
    },
    select: {
      slug: true,
      publishedAt: true,
      updatedAt: true,
    },
  });
  const base = siteUrl();
  return rows.map((row) =>
    withMeta('team_member', {
      url: resolveContentUrl(base, 'team_member', row),
      lastModified: lastMod(row.publishedAt, row.updatedAt),
    }),
  );
}

export async function getIndexableMachineryUrls(): Promise<SitemapEntry[]> {
  const rows = await db.machinery.findMany({
    where: {
      workflowStatus: WorkflowStatus.publicado,
      deletedAt: null,
    },
    select: {
      slug: true,
      publishedAt: true,
      updatedAt: true,
    },
  });
  const base = siteUrl();
  return rows.map((row) =>
    withMeta('machinery', {
      url: resolveContentUrl(base, 'machinery', row),
      lastModified: lastMod(row.publishedAt, row.updatedAt),
    }),
  );
}

export async function getIndexableFaqGroupUrls(): Promise<SitemapEntry[]> {
  const rows = await db.faqGroup.findMany({
    where: {
      deletedAt: null,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });
  const base = siteUrl();
  return rows.map((row) =>
    withMeta('faq_group', {
      url: resolveContentUrl(base, 'faq_group', row),
      lastModified: row.updatedAt,
    }),
  );
}

export async function getIndexableMasterUrls(): Promise<SitemapEntry[]> {
  const [team, machinery, faqs] = await Promise.all([
    getIndexableTeamMemberUrls(),
    getIndexableMachineryUrls(),
    getIndexableFaqGroupUrls(),
  ]);
  return [...team, ...machinery, ...faqs];
}

async function isOwnerIndexable(
  contentType: string,
  contentId: string,
): Promise<boolean> {
  switch (contentType) {
    case 'service':
      return Boolean(
        await db.service.findFirst({
          where: { id: contentId, ...INDEXABLE_EDITORIAL },
          select: { id: true },
        }),
      );
    case 'geo_zone':
      return Boolean(
        await db.geoZone.findFirst({
          where: { id: contentId, ...INDEXABLE_EDITORIAL },
          select: { id: true },
        }),
      );
    case 'service_zone_page':
      return Boolean(
        await db.serviceZonePage.findFirst({
          where: { id: contentId, ...INDEXABLE_EDITORIAL },
          select: { id: true },
        }),
      );
    case 'case_study':
      return Boolean(
        await db.caseStudy.findFirst({
          where: { id: contentId, ...INDEXABLE_EDITORIAL },
          select: { id: true },
        }),
      );
    case 'blog_post':
      return Boolean(
        await db.blogPost.findFirst({
          where: { id: contentId, ...INDEXABLE_EDITORIAL },
          select: { id: true },
        }),
      );
    case 'team_member':
      return Boolean(
        await db.teamMember.findFirst({
          where: {
            id: contentId,
            workflowStatus: WorkflowStatus.publicado,
            deletedAt: null,
          },
          select: { id: true },
        }),
      );
    case 'machinery':
      return Boolean(
        await db.machinery.findFirst({
          where: {
            id: contentId,
            workflowStatus: WorkflowStatus.publicado,
            deletedAt: null,
          },
          select: { id: true },
        }),
      );
    case 'faq_group':
      return Boolean(
        await db.faqGroup.findFirst({
          where: { id: contentId, deletedAt: null },
          select: { id: true },
        }),
      );
    default:
      return false;
  }
}

async function resolveOwnerPageUrl(
  contentType: string,
  contentId: string,
): Promise<string | null> {
  const base = siteUrl();
  switch (contentType) {
    case 'service': {
      const row = await db.service.findFirst({
        where: { id: contentId, ...INDEXABLE_EDITORIAL },
        select: { slug: true, canonicalUrl: true },
      });
      return row ? resolveContentUrl(base, 'service', row) : null;
    }
    case 'geo_zone': {
      const row = await db.geoZone.findFirst({
        where: { id: contentId, ...INDEXABLE_EDITORIAL },
        select: { slug: true, canonicalUrl: true },
      });
      return row ? resolveContentUrl(base, 'geo_zone', row) : null;
    }
    case 'service_zone_page': {
      const row = await db.serviceZonePage.findFirst({
        where: { id: contentId, ...INDEXABLE_EDITORIAL },
        select: {
          slug: true,
          canonicalUrl: true,
          service: { select: { slug: true } },
          zone: { select: { slug: true } },
        },
      });
      return row
        ? resolveContentUrl(base, 'service_zone_page', row, {
            serviceSlug: row.service.slug,
            zoneSlug: row.zone.slug,
          })
        : null;
    }
    case 'case_study': {
      const row = await db.caseStudy.findFirst({
        where: { id: contentId, ...INDEXABLE_EDITORIAL },
        select: { slug: true, canonicalUrl: true },
      });
      return row ? resolveContentUrl(base, 'case_study', row) : null;
    }
    case 'blog_post': {
      const row = await db.blogPost.findFirst({
        where: { id: contentId, ...INDEXABLE_EDITORIAL },
        select: {
          slug: true,
          canonicalUrl: true,
          category: { select: { slug: true } },
        },
      });
      return row
        ? resolveContentUrl(base, 'blog_post', row, {
            categorySlug: row.category.slug,
          })
        : null;
    }
    case 'team_member': {
      const row = await db.teamMember.findFirst({
        where: {
          id: contentId,
          workflowStatus: WorkflowStatus.publicado,
          deletedAt: null,
        },
        select: { slug: true },
      });
      return row ? resolveContentUrl(base, 'team_member', row) : null;
    }
    case 'machinery': {
      const row = await db.machinery.findFirst({
        where: {
          id: contentId,
          workflowStatus: WorkflowStatus.publicado,
          deletedAt: null,
        },
        select: { slug: true },
      });
      return row ? resolveContentUrl(base, 'machinery', row) : null;
    }
    case 'faq_group': {
      const row = await db.faqGroup.findFirst({
        where: { id: contentId, deletedAt: null },
        select: { slug: true },
      });
      return row ? resolveContentUrl(base, 'faq_group', row) : null;
    }
    default:
      return null;
  }
}

export async function getIndexableImageEntries(): Promise<ImageSitemapEntry[]> {
  const links = await db.contentMedia.findMany({
    where: {
      mediaAsset: {
        includeInImageSitemap: true,
        deletedAt: null,
      },
    },
    select: {
      contentType: true,
      contentId: true,
      mediaAsset: {
        select: {
          fileUrl: true,
          altText: true,
          title: true,
        },
      },
    },
  });

  const entries: ImageSitemapEntry[] = [];
  for (const link of links) {
    const indexable = await isOwnerIndexable(
      link.contentType,
      link.contentId,
    );
    if (!indexable) continue;

    const pageUrl = await resolveOwnerPageUrl(
      link.contentType,
      link.contentId,
    );
    if (!pageUrl) continue;

    const caption =
      link.mediaAsset.altText?.trim() ||
      link.mediaAsset.title?.trim() ||
      undefined;

    entries.push({
      pageUrl,
      imageLoc: link.mediaAsset.fileUrl,
      ...(caption ? { caption } : {}),
    });
  }
  return entries;
}

type SourceLoader = () => Promise<SitemapEntry[]>;

const MAIN_SOURCES: SourceLoader[] = [
  getIndexableServiceUrls,
  getIndexableGeoZoneUrls,
  getIndexableServiceZonePageUrls,
  getIndexableCaseStudyUrls,
  getIndexableBlogPostUrls,
  getIndexableMasterUrls,
];

/** Agrega todas las fuentes; ante error en una fuente, log y continúa (observabilidad GTK-42). */
export async function gatherMainSitemapEntries(): Promise<SitemapEntry[]> {
  const results = await Promise.allSettled(
    MAIN_SOURCES.map((load) => load()),
  );
  const merged: SitemapEntry[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      merged.push(...result.value);
    } else {
      console.error('[sitemap] source failed', {
        message:
          result.reason instanceof Error
            ? result.reason.message
            : 'unknown',
      });
    }
  }
  return merged;
}
