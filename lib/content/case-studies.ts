import 'server-only';

import { WorkflowStatus, type Prisma } from '@prisma/client';
import { z } from 'zod';

import {
  recordContentDeleteAudit,
  recordContentUpdateAudit,
} from '@/lib/content/content-audit';
import { ContentNotFoundError } from '@/lib/content/errors';
import {
  assertActiveProvinceId,
  assertActiveServiceIds,
  assertActiveTeamMemberIds,
  assertActiveWorkTypologyId,
} from '@/lib/content/references';
import { editorialCrudBlockSchema } from '@/lib/content/schemas/editorial';
import { seoBlockSchema } from '@/lib/content/schemas/seo';
import { ensureUniqueSlug } from '@/lib/content/slug';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { db } from '@/lib/db';

const caseStudyBodySchema = z.object({
  title: z.string().min(1),
  serviceId: z.uuid(),
  provinceId: z.uuid(),
  workTypologyId: z.uuid(),
  clientName: z.string().nullable().optional(),
  clientIsPublic: z.boolean().optional(),
  problem: z.string().min(1),
  solution: z.string().min(1),
  boreholesCount: z.number().int().nullable().optional(),
  metersDrilled: z.coerce.number().nullable().optional(),
  testsSummary: z.string().nullable().optional(),
  result: z.string().nullable().optional(),
  projectYear: z.number().int().nullable().optional(),
  latitude: z.coerce.number().nullable().optional(),
  longitude: z.coerce.number().nullable().optional(),
  sourceProjectId: z.uuid().nullable().optional(),
  teamMemberIds: z.array(z.uuid()).optional(),
});

export const createCaseStudySchema = caseStudyBodySchema
  .merge(seoBlockSchema)
  .merge(editorialCrudBlockSchema);

export const updateCaseStudySchema = caseStudyBodySchema
  .partial()
  .merge(seoBlockSchema.partial())
  .merge(editorialCrudBlockSchema.partial());

const ENTITY_TYPE = 'case_study';

async function syncCaseStudyTeam(
  tx: Prisma.TransactionClient,
  caseStudyId: string,
  teamMemberIds: string[],
): Promise<void> {
  await assertActiveTeamMemberIds(tx, teamMemberIds);
  await tx.caseStudyTeamMember.deleteMany({ where: { caseStudyId } });
  if (teamMemberIds.length > 0) {
    await tx.caseStudyTeamMember.createMany({
      data: teamMemberIds.map((teamMemberId) => ({
        caseStudyId,
        teamMemberId,
      })),
    });
  }
}

export async function createCaseStudy(
  user: PortalSessionPayload,
  raw: unknown,
): Promise<{ id: string }> {
  const input = createCaseStudySchema.parse(raw);
  await assertActiveServiceIds(db, [input.serviceId]);
  await assertActiveProvinceId(db, input.provinceId);
  await assertActiveWorkTypologyId(db, input.workTypologyId);
  await ensureUniqueSlug(db.caseStudy, input.slug);

  return db.$transaction(async (tx) => {
    const row = await tx.caseStudy.create({
      data: {
        title: input.title,
        serviceId: input.serviceId,
        provinceId: input.provinceId,
        workTypologyId: input.workTypologyId,
        clientName: input.clientName ?? null,
        clientIsPublic: input.clientIsPublic ?? false,
        problem: input.problem,
        solution: input.solution,
        boreholesCount: input.boreholesCount ?? null,
        metersDrilled: input.metersDrilled ?? null,
        testsSummary: input.testsSummary ?? null,
        result: input.result ?? null,
        projectYear: input.projectYear ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        sourceProjectId: input.sourceProjectId ?? null,
        slug: input.slug,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        canonicalUrl: input.canonicalUrl ?? null,
        schemaType: input.schemaType,
        noindex: input.noindex ?? false,
        ogImageId: input.ogImageId ?? null,
        h1: input.h1 ?? null,
        workflowStatus: WorkflowStatus.borrador_ia,
        isAiAssisted: input.isAiAssisted ?? false,
        authorId: input.authorId ?? user.userId,
        createdById: user.userId,
        updatedById: user.userId,
      },
      select: { id: true },
    });
    if (input.teamMemberIds) {
      await syncCaseStudyTeam(tx, row.id, input.teamMemberIds);
    }
    return row;
  });
}

export async function updateCaseStudy(
  user: PortalSessionPayload,
  caseStudyId: string,
  raw: unknown,
): Promise<void> {
  const input = updateCaseStudySchema.parse(raw);
  const existing = await db.caseStudy.findFirst({
    where: { id: caseStudyId, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  if (input.serviceId) {
    await assertActiveServiceIds(db, [input.serviceId]);
  }
  if (input.provinceId) {
    await assertActiveProvinceId(db, input.provinceId);
  }
  if (input.workTypologyId) {
    await assertActiveWorkTypologyId(db, input.workTypologyId);
  }
  if (input.slug) {
    await ensureUniqueSlug(db.caseStudy, input.slug, { excludeId: caseStudyId });
  }

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.caseStudy.update({
      where: { id: caseStudyId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.serviceId !== undefined ? { serviceId: input.serviceId } : {}),
        ...(input.provinceId !== undefined ? { provinceId: input.provinceId } : {}),
        ...(input.workTypologyId !== undefined
          ? { workTypologyId: input.workTypologyId }
          : {}),
        ...(input.clientName !== undefined ? { clientName: input.clientName } : {}),
        ...(input.clientIsPublic !== undefined
          ? { clientIsPublic: input.clientIsPublic }
          : {}),
        ...(input.problem !== undefined ? { problem: input.problem } : {}),
        ...(input.solution !== undefined ? { solution: input.solution } : {}),
        ...(input.boreholesCount !== undefined
          ? { boreholesCount: input.boreholesCount }
          : {}),
        ...(input.metersDrilled !== undefined
          ? { metersDrilled: input.metersDrilled }
          : {}),
        ...(input.testsSummary !== undefined
          ? { testsSummary: input.testsSummary }
          : {}),
        ...(input.result !== undefined ? { result: input.result } : {}),
        ...(input.projectYear !== undefined ? { projectYear: input.projectYear } : {}),
        ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
        ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
        ...(input.sourceProjectId !== undefined
          ? { sourceProjectId: input.sourceProjectId }
          : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.metaTitle !== undefined ? { metaTitle: input.metaTitle } : {}),
        ...(input.metaDescription !== undefined
          ? { metaDescription: input.metaDescription }
          : {}),
        ...(input.canonicalUrl !== undefined
          ? { canonicalUrl: input.canonicalUrl }
          : {}),
        ...(input.schemaType !== undefined ? { schemaType: input.schemaType } : {}),
        ...(input.noindex !== undefined ? { noindex: input.noindex } : {}),
        ...(input.ogImageId !== undefined ? { ogImageId: input.ogImageId } : {}),
        ...(input.h1 !== undefined ? { h1: input.h1 } : {}),
        ...(input.workflowStatus !== undefined
          ? { workflowStatus: input.workflowStatus }
          : {}),
        ...(input.isAiAssisted !== undefined
          ? { isAiAssisted: input.isAiAssisted }
          : {}),
        ...(input.authorId !== undefined ? { authorId: input.authorId } : {}),
        updatedById: user.userId,
      },
    });
    if (input.teamMemberIds) {
      await syncCaseStudyTeam(tx, caseStudyId, input.teamMemberIds);
    }
    await recordContentUpdateAudit(tx, user, {
      entityType: ENTITY_TYPE,
      entityId: caseStudyId,
      entitySlug: input.slug ?? existing.slug,
    });
  });
}

export async function softDeleteCaseStudy(
  user: PortalSessionPayload,
  caseStudyId: string,
): Promise<void> {
  const existing = await db.caseStudy.findFirst({
    where: { id: caseStudyId, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  await db.$transaction(async (tx) => {
    await tx.caseStudy.update({
      where: { id: caseStudyId },
      data: { deletedAt: new Date(), updatedById: user.userId },
    });
    await recordContentDeleteAudit(tx, user, {
      entityType: ENTITY_TYPE,
      entityId: caseStudyId,
      entitySlug: existing.slug,
    });
  });
}
