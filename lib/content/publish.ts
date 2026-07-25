import 'server-only';

import { RoleName, SchemaType, WorkflowStatus } from '@prisma/client';

import type { PortalSessionPayload } from '@/lib/auth/session';
import { ContentConflictError, ContentValidationError } from '@/lib/content/errors';
import { revalidatePublishedContent } from '@/lib/content/revalidate';
import { assertSchemaTypeCoherent } from '@/lib/content/schema-type-coherence';
import type { EditorialContentType } from '@/lib/content/schemas/workflow';
import { EDITORIAL_CONTENT_TYPES } from '@/lib/content/schemas/workflow';
import {
  applyEditorialTransition,
  type EditorialTransitionResult,
} from '@/lib/content/workflow';
import { loadEditorialEntity } from '@/lib/content/workflow-registry';
import { db } from '@/lib/db';

export type PublishContentParams = {
  contentType: EditorialContentType;
  contentId: string;
  note?: string;
};

function cronActorFromRow(row: {
  approvedById: string | null;
  authorId?: string | null;
}): PortalSessionPayload {
  const userId = row.approvedById ?? row.authorId;
  if (!userId) {
    throw new ContentValidationError(
      'Publicación programada sin aprobador ni autor para atribución',
    );
  }
  return {
    userId,
    roleId: '00000000-0000-4000-8000-000000000001',
    roleName: RoleName.admin,
  };
}

export async function publishContent(
  user: PortalSessionPayload,
  params: PublishContentParams,
): Promise<EditorialTransitionResult> {
  const { entry, row } = await loadEditorialEntity(
    params.contentType,
    params.contentId,
  );

  assertSchemaTypeCoherent(params.contentType, row.schemaType as SchemaType | null);

  const result = await applyEditorialTransition(user, {
    contentType: params.contentType,
    contentId: params.contentId,
    targetStatus: WorkflowStatus.publicado,
    note: params.note,
    forceRevision: true,
  });

  await revalidatePublishedContent(params.contentType, params.contentId, {
    slug: row.slug,
  });

  return result;
}

export async function unpublishContent(
  user: PortalSessionPayload,
  params: PublishContentParams,
): Promise<EditorialTransitionResult> {
  const { row } = await loadEditorialEntity(
    params.contentType,
    params.contentId,
  );

  const result = await applyEditorialTransition(user, {
    contentType: params.contentType,
    contentId: params.contentId,
    targetStatus: WorkflowStatus.despublicado,
    note: params.note,
    forceRevision: true,
    unpublishEvent: true,
  });

  await revalidatePublishedContent(params.contentType, params.contentId, {
    slug: row.slug,
  });

  return result;
}

export type ScheduledPublishCandidate = {
  contentType: EditorialContentType;
  contentId: string;
};

const SCHEDULED_MODELS: {
  contentType: EditorialContentType;
  findMany: (now: Date) => Promise<{ id: string }[]>;
}[] = [
  {
    contentType: 'service',
    findMany: (now) =>
      db.service.findMany({
        where: {
          workflowStatus: WorkflowStatus.aprobado,
          scheduledPublishAt: { lte: now },
          deletedAt: null,
        },
        select: { id: true },
      }),
  },
  {
    contentType: 'geo_zone',
    findMany: (now) =>
      db.geoZone.findMany({
        where: {
          workflowStatus: WorkflowStatus.aprobado,
          scheduledPublishAt: { lte: now },
          deletedAt: null,
        },
        select: { id: true },
      }),
  },
  {
    contentType: 'service_zone_page',
    findMany: (now) =>
      db.serviceZonePage.findMany({
        where: {
          workflowStatus: WorkflowStatus.aprobado,
          scheduledPublishAt: { lte: now },
          deletedAt: null,
        },
        select: { id: true },
      }),
  },
  {
    contentType: 'case_study',
    findMany: (now) =>
      db.caseStudy.findMany({
        where: {
          workflowStatus: WorkflowStatus.aprobado,
          scheduledPublishAt: { lte: now },
          deletedAt: null,
        },
        select: { id: true },
      }),
  },
  {
    contentType: 'blog_post',
    findMany: (now) =>
      db.blogPost.findMany({
        where: {
          workflowStatus: WorkflowStatus.aprobado,
          scheduledPublishAt: { lte: now },
          deletedAt: null,
        },
        select: { id: true },
      }),
  },
  {
    contentType: 'faq',
    findMany: (now) =>
      db.faq.findMany({
        where: {
          workflowStatus: WorkflowStatus.aprobado,
          scheduledPublishAt: { lte: now },
          deletedAt: null,
        },
        select: { id: true },
      }),
  },
  {
    contentType: 'team_member',
    findMany: (now) =>
      db.teamMember.findMany({
        where: {
          workflowStatus: WorkflowStatus.aprobado,
          scheduledPublishAt: { lte: now },
          deletedAt: null,
        },
        select: { id: true },
      }),
  },
  {
    contentType: 'machinery',
    findMany: (now) =>
      db.machinery.findMany({
        where: {
          workflowStatus: WorkflowStatus.aprobado,
          scheduledPublishAt: { lte: now },
          deletedAt: null,
        },
        select: { id: true },
      }),
  },
];

export async function listScheduledPublishCandidates(
  now: Date = new Date(),
): Promise<ScheduledPublishCandidate[]> {
  const out: ScheduledPublishCandidate[] = [];
  for (const model of SCHEDULED_MODELS) {
    const rows = await model.findMany(now);
    for (const row of rows) {
      out.push({ contentType: model.contentType, contentId: row.id });
    }
  }
  return out;
}

export async function runScheduledPublishBatch(now: Date = new Date()): Promise<{
  published: number;
  skipped: number;
  failed: number;
}> {
  const candidates = await listScheduledPublishCandidates(now);
  let published = 0;
  let skipped = 0;
  let failed = 0;

  for (const candidate of candidates) {
    try {
      const { row } = await loadEditorialEntity(
        candidate.contentType,
        candidate.contentId,
      );
      if (row.workflowStatus !== WorkflowStatus.aprobado) {
        skipped += 1;
        continue;
      }
      const actor = cronActorFromRow(row);
      await publishContent(actor, {
        contentType: candidate.contentType,
        contentId: candidate.contentId,
      });
      published += 1;
    } catch (error) {
      if (error instanceof ContentConflictError) {
        skipped += 1;
        continue;
      }
      failed += 1;
      console.error(
        JSON.stringify({
          event: 'scheduled_publish_failed',
          ...candidate,
          message: error instanceof Error ? error.message : 'unknown',
        }),
      );
    }
  }

  return { published, skipped, failed };
}

export { EDITORIAL_CONTENT_TYPES };
