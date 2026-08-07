import 'server-only';

import { PromptPageType } from '@prisma/client';

import { getCmsContentTypeMeta } from '@/lib/admin/cms-content-types';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { can } from '@/lib/auth/rbac';
import { editorialContentTypeSchema } from '@/lib/content/schemas/workflow';
import type { EditorialContentType } from '@/lib/content/schemas/workflow';
import { editorialContentTypeToPromptPageType } from '@/lib/cms/ia/prompt-page-type-map';

import { env } from '@/lib/env';

import { defaultInitialFor } from './editor-defaults';
import type { CmsEditorReferenceOptions } from './editor-reference-options';
import { loadEditorReferenceOptions } from './editor-reference-options';
import { loadEditorEntity } from './load-editor-entity';

export type GeoZoneOption = { id: string; name: string; slug: string };

export type CmsEditorRevisionItem = {
  versionNumber: number;
  workflowStatusAt: import('@prisma/client').WorkflowStatus;
  editorName: string;
  changeSummary: string | null;
  createdAt: string;
};

export type CmsEditorPageData = {
  contentType: EditorialContentType;
  typeLabel: string;
  isNew: boolean;
  entityId: string | null;
  canSave: boolean;
  initial: Record<string, unknown>;
  zoneOptions: GeoZoneOption[];
  referenceOptions: CmsEditorReferenceOptions;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  mediaStorageBaseUrl: string;
  siteUrl: string;
  canUseAi: boolean;
  promptPageType: PromptPageType | null;
  editorial: {
    workflowStatus: import('@prisma/client').WorkflowStatus;
    scheduledPublishAt: string | null;
    publicPath: string | null;
    canUpdate: boolean;
    canPublish: boolean;
    revisions: CmsEditorRevisionItem[];
  } | null;
};

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

  const referenceOptions = await loadEditorReferenceOptions(contentType);
  const zoneOptions = referenceOptions.geoZones;

  if (isNew) {
    if (!can(session, 'content.create')) {
      return null;
    }
    return {
      contentType,
      typeLabel: meta.label,
      isNew: true,
      entityId: null,
      canSave,
      zoneOptions,
      referenceOptions,
      heroImageUrl: null,
      heroImageAlt: null,
      mediaStorageBaseUrl: env.MEDIA_STORAGE_BASE_URL,
      siteUrl: env.NEXT_PUBLIC_SITE_URL,
      canUseAi,
      promptPageType,
      editorial: null,
      initial: defaultInitialFor(contentType),
    };
  }

  if (!can(session, 'content.read')) {
    return null;
  }

  const loaded = await loadEditorEntity(contentType, idParam, session);
  if (!loaded) {
    return null;
  }

  return {
    contentType,
    typeLabel: meta.label,
    isNew: false,
    entityId: loaded.entityId,
    canSave,
    zoneOptions,
    referenceOptions,
    heroImageUrl: loaded.heroImageUrl,
    heroImageAlt: loaded.heroImageAlt,
    mediaStorageBaseUrl: env.MEDIA_STORAGE_BASE_URL,
    siteUrl: env.NEXT_PUBLIC_SITE_URL,
    canUseAi,
    promptPageType,
    editorial: loaded.editorial,
    initial: loaded.initial,
  };
}
