import 'server-only';

import { AuditAction, WorkflowStatus } from '@prisma/client';

import { recordAudit } from '@/lib/audit/log';
import { sanitizeAuditMetadata } from '@/lib/audit/sanitize';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { ContentConflictError } from '@/lib/content/errors';
import type { EditorialContentType } from '@/lib/content/schemas/workflow';
import { loadEditorialEntity } from '@/lib/content/workflow-registry';
import { db } from '@/lib/db';

type ScheduledFieldUpdater = (
  id: string,
  scheduledPublishAt: Date | null,
  userId: string,
) => Promise<void>;

const SCHEDULE_UPDATERS: Record<
  EditorialContentType,
  ScheduledFieldUpdater
> = {
  service: async (id, at, userId) => {
    await db.service.update({
      where: { id },
      data: { scheduledPublishAt: at, updatedById: userId },
    });
  },
  geo_zone: async (id, at, userId) => {
    await db.geoZone.update({
      where: { id },
      data: { scheduledPublishAt: at, updatedById: userId },
    });
  },
  service_zone_page: async (id, at, userId) => {
    await db.serviceZonePage.update({
      where: { id },
      data: { scheduledPublishAt: at, updatedById: userId },
    });
  },
  case_study: async (id, at, userId) => {
    await db.caseStudy.update({
      where: { id },
      data: { scheduledPublishAt: at, updatedById: userId },
    });
  },
  blog_post: async (id, at, userId) => {
    await db.blogPost.update({
      where: { id },
      data: { scheduledPublishAt: at, updatedById: userId },
    });
  },
  faq: async (id, at, userId) => {
    await db.faq.update({
      where: { id },
      data: { scheduledPublishAt: at, updatedById: userId },
    });
  },
  team_member: async (id, at, userId) => {
    await db.teamMember.update({
      where: { id },
      data: { scheduledPublishAt: at, updatedById: userId },
    });
  },
  machinery: async (id, at, userId) => {
    await db.machinery.update({
      where: { id },
      data: { scheduledPublishAt: at, updatedById: userId },
    });
  },
};

export type SchedulePublicationParams = {
  contentType: EditorialContentType;
  contentId: string;
  scheduledPublishAt: Date;
};

export type SchedulePublicationResult = {
  scheduledPublishAt: Date;
};

async function assertApprovedForSchedule(
  contentType: EditorialContentType,
  contentId: string,
) {
  const { entry, row } = await loadEditorialEntity(contentType, contentId);
  if (row.workflowStatus !== WorkflowStatus.aprobado) {
    throw new ContentConflictError(
      'Solo se puede programar publicación en contenido aprobado',
    );
  }
  return { entry, row };
}

export async function scheduleContentPublication(
  user: PortalSessionPayload,
  params: SchedulePublicationParams,
): Promise<SchedulePublicationResult> {
  const { entry, row } = await assertApprovedForSchedule(
    params.contentType,
    params.contentId,
  );
  const update = SCHEDULE_UPDATERS[params.contentType];
  await update(params.contentId, params.scheduledPublishAt, user.userId);

  await recordAudit({
    userId: user.userId,
    action: AuditAction.content_update,
    entityType: entry.entityType,
    entityId: params.contentId,
    metadata: sanitizeAuditMetadata(AuditAction.content_update, {
      contentType: params.contentType,
      entitySlug: row.slug,
      event: 'schedule_publish',
      scheduledPublishAt: params.scheduledPublishAt.toISOString(),
      workflowStatus: row.workflowStatus,
    }),
  });

  return { scheduledPublishAt: params.scheduledPublishAt };
}

export async function cancelScheduledPublication(
  user: PortalSessionPayload,
  params: { contentType: EditorialContentType; contentId: string },
): Promise<void> {
  const { entry, row } = await assertApprovedForSchedule(
    params.contentType,
    params.contentId,
  );
  const update = SCHEDULE_UPDATERS[params.contentType];
  await update(params.contentId, null, user.userId);

  await recordAudit({
    userId: user.userId,
    action: AuditAction.content_update,
    entityType: entry.entityType,
    entityId: params.contentId,
    metadata: sanitizeAuditMetadata(AuditAction.content_update, {
      contentType: params.contentType,
      entitySlug: row.slug,
      event: 'cancel_schedule_publish',
      workflowStatus: row.workflowStatus,
    }),
  });
}
