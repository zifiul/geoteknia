'use server';

import { WorkflowStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requirePermission } from '@/lib/auth/rbac';
import {
  runContentAction,
  type ContentActionResult,
} from '@/lib/content/content-action-result';
import {
  publishContent as publishContentEffect,
  unpublishContent as unpublishContentEffect,
} from '@/lib/content/publish';
import {
  cancelScheduledPublication as cancelScheduledPublicationEffect,
  scheduleContentPublication as scheduleContentPublicationEffect,
} from '@/lib/content/schedule';
import {
  editorialContentTypeSchema,
  regenerateBodySchema,
  schedulePublishAtSchema,
  workflowNoteSchema,
} from '@/lib/content/schemas/workflow';
import {
  applyEditorialTransition,
  type EditorialTransitionResult,
} from '@/lib/content/workflow';

const contentIdSchema = z.uuid();

type TransitionData = EditorialTransitionResult;

async function runTransition(
  permission: 'content.update' | 'content.publish',
  fn: (user: Awaited<ReturnType<typeof requirePermission>>) => Promise<TransitionData>,
): Promise<ContentActionResult<TransitionData>> {
  return runContentAction(async () => {
    const user = await requirePermission(permission);
    return fn(user);
  });
}

export async function submitForReview(
  contentType: unknown,
  contentId: unknown,
  note?: unknown,
): Promise<ContentActionResult<TransitionData>> {
  return runTransition('content.update', async (user) => {
    const type = editorialContentTypeSchema.parse(contentType);
    const id = contentIdSchema.parse(contentId);
    const parsedNote =
      note !== undefined ? workflowNoteSchema.parse(note) : undefined;
    const result = await applyEditorialTransition(user, {
      contentType: type,
      contentId: id,
      targetStatus: WorkflowStatus.en_revision,
      note: parsedNote,
    });
    revalidatePath('/admin/contenido');
    return result;
  });
}

export async function approveContent(
  contentType: unknown,
  contentId: unknown,
  note?: unknown,
): Promise<ContentActionResult<TransitionData>> {
  return runTransition('content.update', async (user) => {
    const type = editorialContentTypeSchema.parse(contentType);
    const id = contentIdSchema.parse(contentId);
    const parsedNote =
      note !== undefined ? workflowNoteSchema.parse(note) : undefined;
    const result = await applyEditorialTransition(user, {
      contentType: type,
      contentId: id,
      targetStatus: WorkflowStatus.aprobado,
      note: parsedNote,
    });
    revalidatePath('/admin/contenido');
    return result;
  });
}

export async function rejectContent(
  contentType: unknown,
  contentId: unknown,
  note?: unknown,
): Promise<ContentActionResult<TransitionData>> {
  return runTransition('content.update', async (user) => {
    const type = editorialContentTypeSchema.parse(contentType);
    const id = contentIdSchema.parse(contentId);
    const parsedNote =
      note !== undefined ? workflowNoteSchema.parse(note) : undefined;
    const result = await applyEditorialTransition(user, {
      contentType: type,
      contentId: id,
      targetStatus: WorkflowStatus.rechazado,
      note: parsedNote,
    });
    revalidatePath('/admin/contenido');
    return result;
  });
}

export async function transitionToPublish(
  contentType: unknown,
  contentId: unknown,
  note?: unknown,
): Promise<ContentActionResult<TransitionData>> {
  return runTransition('content.publish', async (user) => {
    const type = editorialContentTypeSchema.parse(contentType);
    const id = contentIdSchema.parse(contentId);
    const parsedNote =
      note !== undefined ? workflowNoteSchema.parse(note) : undefined;
    const result = await publishContentEffect(user, {
      contentType: type,
      contentId: id,
      note: parsedNote,
    });
    revalidatePath('/admin/contenido');
    return result;
  });
}

export async function unpublishContent(
  contentType: unknown,
  contentId: unknown,
  note?: unknown,
): Promise<ContentActionResult<TransitionData>> {
  return runTransition('content.publish', async (user) => {
    const type = editorialContentTypeSchema.parse(contentType);
    const id = contentIdSchema.parse(contentId);
    const parsedNote =
      note !== undefined ? workflowNoteSchema.parse(note) : undefined;
    const result = await unpublishContentEffect(user, {
      contentType: type,
      contentId: id,
      note: parsedNote,
    });
    revalidatePath('/admin/contenido');
    return result;
  });
}

export async function regenerateToDraft(
  contentType: unknown,
  contentId: unknown,
  rawPatch?: unknown,
): Promise<ContentActionResult<TransitionData>> {
  return runTransition('content.update', async (user) => {
    const type = editorialContentTypeSchema.parse(contentType);
    const id = contentIdSchema.parse(contentId);
    const patch =
      rawPatch !== undefined ? regenerateBodySchema.parse(rawPatch) : {};
    const bodyChanged = Boolean(patch.body || patch.answer);
    const result = await applyEditorialTransition(user, {
      contentType: type,
      contentId: id,
      targetStatus: WorkflowStatus.borrador_ia,
      bodyChanged,
      body: patch.body,
      answer: patch.answer,
      aiGenerationId: patch.aiGenerationId,
      changeSummary: patch.changeSummary,
    });
    revalidatePath('/admin/contenido');
    return result;
  });
}

export async function scheduleContentPublication(
  contentType: unknown,
  contentId: unknown,
  scheduledPublishAt: unknown,
): Promise<
  ContentActionResult<{ scheduledPublishAt: string }>
> {
  return runContentAction(async () => {
    const user = await requirePermission('content.publish');
    const type = editorialContentTypeSchema.parse(contentType);
    const id = contentIdSchema.parse(contentId);
    const parsedAt = schedulePublishAtSchema.parse(scheduledPublishAt);
    const result = await scheduleContentPublicationEffect(user, {
      contentType: type,
      contentId: id,
      scheduledPublishAt: new Date(parsedAt),
    });
    revalidatePath('/admin/contenido');
    return {
      scheduledPublishAt: result.scheduledPublishAt.toISOString(),
    };
  });
}

export async function cancelScheduledPublication(
  contentType: unknown,
  contentId: unknown,
): Promise<ContentActionResult<void>> {
  return runContentAction(async () => {
    const user = await requirePermission('content.publish');
    const type = editorialContentTypeSchema.parse(contentType);
    const id = contentIdSchema.parse(contentId);
    await cancelScheduledPublicationEffect(user, {
      contentType: type,
      contentId: id,
    });
    revalidatePath('/admin/contenido');
  });
}
