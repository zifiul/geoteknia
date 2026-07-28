import 'server-only';

import { PromptPageType, SchemaType } from '@prisma/client';

import { getCmsContentTypeMeta } from '@/lib/admin/cms-content-types';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { can } from '@/lib/auth/rbac';
import { getServiceById } from '@/lib/content/services';
import { editorialContentTypeSchema } from '@/lib/content/schemas/workflow';
import type { EditorialContentType } from '@/lib/content/schemas/workflow';
import { ContentNotFoundError } from '@/lib/content/errors';
import { env } from '@/lib/env';
import { db } from '@/lib/db';
import { resolveMediaFileUrl } from '@/lib/content/slug';
import { editorialContentTypeToPromptPageType } from '@/lib/cms/ia/prompt-page-type-map';

export type GeoZoneOption = { id: string; name: string; slug: string };

export type CmsEditorPageData = {
  contentType: EditorialContentType;
  typeLabel: string;
  isNew: boolean;
  entityId: string | null;
  canSave: boolean;
  initial: Record<string, unknown>;
  zoneOptions: GeoZoneOption[];
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  canUseAi: boolean;
  promptPageType: PromptPageType | null;
};

async function resolveHero(heroImageId: string | null | undefined) {
  if (!heroImageId) {
    return { heroImageUrl: null, heroImageAlt: null };
  }
  const asset = await db.mediaAsset.findFirst({
    where: { id: heroImageId, deletedAt: null },
    select: { fileUrl: true, altText: true },
  });
  if (!asset) {
    return { heroImageUrl: null, heroImageAlt: null };
  }
  return {
    heroImageUrl: resolveMediaFileUrl(asset.fileUrl, env.MEDIA_STORAGE_BASE_URL),
    heroImageAlt: asset.altText,
  };
}

export async function loadCmsEditorPage(
  typeParam: string,
  idParam: string,
  session: PortalSessionPayload,
): Promise<CmsEditorPageData | null> {
  const parsedType = editorialContentTypeSchema.safeParse(typeParam);
  if (!parsedType.success) {
    return null;
  }
  const contentType = parsedType.data;
  const meta = getCmsContentTypeMeta(contentType);
  const isNew = idParam === 'nuevo';
  const canSave = isNew
    ? can(session, 'content.create')
    : can(session, 'content.update');
  const canUseAi = can(session, 'ai.generate');
  const promptPageType = editorialContentTypeToPromptPageType(contentType);

  const zoneOptions =
    contentType === 'service'
      ? await db.geoZone.findMany({
          where: { deletedAt: null },
          orderBy: { name: 'asc' },
          select: { id: true, name: true, slug: true },
        })
      : [];

  if (isNew) {
    if (!can(session, 'content.create')) {
      return null;
    }
    const base = {
      schemaType: SchemaType.Service,
      noindex: false,
      body: '',
      slug: '',
    };
    if (contentType === 'service') {
      return {
        contentType,
        typeLabel: meta.label,
        isNew: true,
        entityId: null,
        canSave,
        zoneOptions,
        heroImageUrl: null,
        heroImageAlt: null,
        canUseAi,
        promptPageType,
        initial: {
          ...base,
          schemaType: SchemaType.Service,
          name: '',
          summary: '',
          applicableNorms: '',
          isPillar: true,
          zoneIds: [] as string[],
          methodology: [],
          deliverables: [],
        },
      };
    }
    return null;
  }

  if (!can(session, 'content.read')) {
    return null;
  }

  try {
    if (contentType === 'service') {
      const row = await getServiceById(idParam);
      const hero = await resolveHero(row.heroImageId);
      return {
        contentType,
        typeLabel: meta.label,
        isNew: false,
        entityId: row.id,
        canSave,
        zoneOptions,
        heroImageUrl: hero.heroImageUrl,
        heroImageAlt: hero.heroImageAlt,
        canUseAi,
        promptPageType,
        initial: {
          name: row.name,
          summary: row.summary,
          body: row.body,
          methodology: row.methodology,
          applicableNorms: row.applicableNorms,
          deliverables: row.deliverables,
          heroImageId: row.heroImageId,
          order: row.order,
          isPillar: row.isPillar,
          slug: row.slug,
          metaTitle: row.metaTitle,
          metaDescription: row.metaDescription,
          canonicalUrl: row.canonicalUrl,
          schemaType: row.schemaType,
          noindex: row.noindex,
          ogImageId: row.ogImageId,
          h1: row.h1,
          zoneIds: row.zoneCoverage.map((z) => z.zoneId),
        },
      };
    }
  } catch (error) {
    if (error instanceof ContentNotFoundError) {
      return null;
    }
    throw error;
  }

  return null;
}
