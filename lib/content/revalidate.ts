import 'server-only';

import { revalidatePath, revalidateTag } from 'next/cache';

import type { EditorialContentType } from '@/lib/content/schemas/workflow';
import { buildSiloPath } from '@/lib/seo/silo-urls';
import { SITEMAP_CACHE_TAG } from '@/lib/seo/sitemap-config';
import { db } from '@/lib/db';

export type RevalidationRow = {
  slug: string;
  schemaType?: string | null;
};

/**
 * Rutas relativas del silo a revalidar tras publicar/despublicar.
 */
export async function resolveRevalidationPaths(
  contentType: EditorialContentType,
  contentId: string,
  row: RevalidationRow,
): Promise<string[]> {
  switch (contentType) {
    case 'service':
      return [buildSiloPath('service', { slug: row.slug })];
    case 'geo_zone':
      return [buildSiloPath('geo_zone', { slug: row.slug })];
    case 'case_study':
      return [buildSiloPath('case_study', { slug: row.slug })];
    case 'team_member':
      return [buildSiloPath('team_member', { slug: row.slug })];
    case 'machinery':
      return [buildSiloPath('machinery', { slug: row.slug })];
    case 'service_zone_page': {
      const sz = await db.serviceZonePage.findFirst({
        where: { id: contentId, deletedAt: null },
        select: {
          service: { select: { slug: true } },
          zone: { select: { slug: true } },
        },
      });
      if (!sz?.service?.slug || !sz.zone?.slug) {
        throw new Error(
          'service_zone_page sin slugs de servicio/zona para revalidación',
        );
      }
      return [
        buildSiloPath('service_zone_page', {
          slug: row.slug,
          serviceSlug: sz.service.slug,
          zoneSlug: sz.zone.slug,
        }),
      ];
    }
    case 'blog_post': {
      const post = await db.blogPost.findFirst({
        where: { id: contentId, deletedAt: null },
        select: { category: { select: { slug: true } } },
      });
      if (!post?.category?.slug) {
        throw new Error('blog_post sin categorySlug para revalidación');
      }
      return [
        buildSiloPath('blog_post', {
          slug: row.slug,
          categorySlug: post.category.slug,
        }),
      ];
    }
    case 'faq': {
      const faq = await db.faq.findFirst({
        where: { id: contentId, deletedAt: null },
        select: {
          faqGroup: {
            select: {
              slug: true,
              service: { select: { slug: true } },
            },
          },
        },
      });
      if (!faq?.faqGroup?.slug) {
        throw new Error('faq sin faq_group para revalidación');
      }
      const paths = [buildSiloPath('faq_group', { slug: faq.faqGroup.slug })];
      if (faq.faqGroup.service?.slug) {
        paths.push(
          buildSiloPath('service', { slug: faq.faqGroup.service.slug }),
        );
      }
      return paths;
    }
    default: {
      const _exhaustive: never = contentType;
      return _exhaustive;
    }
  }
}

export async function revalidatePublishedContent(
  contentType: EditorialContentType,
  contentId: string,
  row: RevalidationRow,
): Promise<void> {
  try {
    const paths = await resolveRevalidationPaths(contentType, contentId, row);
    for (const path of paths) {
      revalidatePath(path);
    }
    revalidateTag(SITEMAP_CACHE_TAG);
  } catch (error) {
    console.error(
      JSON.stringify({
        event: 'revalidate_failed',
        contentType,
        contentId,
        message: error instanceof Error ? error.message : 'unknown',
      }),
    );
  }
}
