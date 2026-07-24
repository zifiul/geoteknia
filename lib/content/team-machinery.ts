import 'server-only';

import { EquipmentType, WorkflowStatus, type Prisma } from '@prisma/client';
import { z } from 'zod';

import {
  recordContentDeleteAudit,
  recordContentUpdateAudit,
} from '@/lib/content/content-audit';
import { ContentNotFoundError } from '@/lib/content/errors';
import { assertActiveServiceIds } from '@/lib/content/references';
import { editorialCrudBlockSchema } from '@/lib/content/schemas/editorial';
import { teamMachinerySeoSchema } from '@/lib/content/schemas/seo';
import { ensureUniqueSlug } from '@/lib/content/slug';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { db } from '@/lib/db';

const teamBodySchema = z.object({
  fullName: z.string().min(1),
  jobTitle: z.string().min(1),
  qualification: z.string().nullable().optional(),
  collegeRegistrationNo: z.string().nullable().optional(),
  yearsExperience: z.number().int().nullable().optional(),
  specialization: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  publications: z.string().nullable().optional(),
  worksFor: z.string().nullable().optional(),
  alumniOf: z.string().nullable().optional(),
  photoId: z.uuid().nullable().optional(),
  userId: z.uuid().nullable().optional(),
});

export const createTeamMemberSchema = teamBodySchema
  .merge(teamMachinerySeoSchema)
  .merge(editorialCrudBlockSchema);

export const updateTeamMemberSchema = teamBodySchema
  .partial()
  .merge(teamMachinerySeoSchema.partial())
  .merge(editorialCrudBlockSchema.partial());

const ENTITY_TYPE = 'team_member';

export async function createTeamMember(
  user: PortalSessionPayload,
  raw: unknown,
): Promise<{ id: string }> {
  const input = createTeamMemberSchema.parse(raw);
  await ensureUniqueSlug(db.teamMember, input.slug);

  return db.teamMember.create({
    data: {
      fullName: input.fullName,
      jobTitle: input.jobTitle,
      qualification: input.qualification ?? null,
      collegeRegistrationNo: input.collegeRegistrationNo ?? null,
      yearsExperience: input.yearsExperience ?? null,
      specialization: input.specialization ?? null,
      bio: input.bio ?? null,
      publications: input.publications ?? null,
      worksFor: input.worksFor ?? null,
      alumniOf: input.alumniOf ?? null,
      photoId: input.photoId ?? null,
      userId: input.userId ?? null,
      slug: input.slug,
      workflowStatus: WorkflowStatus.borrador_ia,
      isAiAssisted: input.isAiAssisted ?? false,
      authorId: input.authorId ?? user.userId,
      createdById: user.userId,
      updatedById: user.userId,
    },
    select: { id: true },
  });
}

export async function updateTeamMember(
  user: PortalSessionPayload,
  teamMemberId: string,
  raw: unknown,
): Promise<void> {
  const input = updateTeamMemberSchema.parse(raw);
  const existing = await db.teamMember.findFirst({
    where: { id: teamMemberId, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  if (input.slug) {
    await ensureUniqueSlug(db.teamMember, input.slug, { excludeId: teamMemberId });
  }

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.teamMember.update({
      where: { id: teamMemberId },
      data: {
        ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
        ...(input.jobTitle !== undefined ? { jobTitle: input.jobTitle } : {}),
        ...(input.qualification !== undefined
          ? { qualification: input.qualification }
          : {}),
        ...(input.collegeRegistrationNo !== undefined
          ? { collegeRegistrationNo: input.collegeRegistrationNo }
          : {}),
        ...(input.yearsExperience !== undefined
          ? { yearsExperience: input.yearsExperience }
          : {}),
        ...(input.specialization !== undefined
          ? { specialization: input.specialization }
          : {}),
        ...(input.bio !== undefined ? { bio: input.bio } : {}),
        ...(input.publications !== undefined
          ? { publications: input.publications }
          : {}),
        ...(input.worksFor !== undefined ? { worksFor: input.worksFor } : {}),
        ...(input.alumniOf !== undefined ? { alumniOf: input.alumniOf } : {}),
        ...(input.photoId !== undefined ? { photoId: input.photoId } : {}),
        ...(input.userId !== undefined ? { userId: input.userId } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
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
    await recordContentUpdateAudit(tx, user, {
      entityType: ENTITY_TYPE,
      entityId: teamMemberId,
      entitySlug: input.slug ?? existing.slug,
    });
  });
}

export async function softDeleteTeamMember(
  user: PortalSessionPayload,
  teamMemberId: string,
): Promise<void> {
  const existing = await db.teamMember.findFirst({
    where: { id: teamMemberId, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  await db.$transaction(async (tx) => {
    await tx.teamMember.update({
      where: { id: teamMemberId },
      data: { deletedAt: new Date(), updatedById: user.userId },
    });
    await recordContentDeleteAudit(tx, user, {
      entityType: ENTITY_TYPE,
      entityId: teamMemberId,
      entitySlug: existing.slug,
    });
  });
}

const machineryBodySchema = z.object({
  name: z.string().min(1),
  equipmentType: z.nativeEnum(EquipmentType),
  model: z.string().nullable().optional(),
  maxDepthM: z.coerce.number().nullable().optional(),
  diameters: z.string().nullable().optional(),
  inSituTests: z.unknown().optional(),
  hasEnacLab: z.boolean().nullable().optional(),
  photoId: z.uuid().nullable().optional(),
  serviceIds: z.array(z.uuid()).optional(),
});

export const createMachinerySchema = machineryBodySchema
  .merge(teamMachinerySeoSchema)
  .merge(editorialCrudBlockSchema);

export const updateMachinerySchema = machineryBodySchema
  .partial()
  .merge(teamMachinerySeoSchema.partial())
  .merge(editorialCrudBlockSchema.partial());

const MACHINERY_ENTITY = 'machinery';

async function syncMachineryServices(
  tx: Prisma.TransactionClient,
  machineryId: string,
  serviceIds: string[],
): Promise<void> {
  await assertActiveServiceIds(tx, serviceIds);
  await tx.machineryService.deleteMany({ where: { machineryId } });
  if (serviceIds.length > 0) {
    await tx.machineryService.createMany({
      data: serviceIds.map((serviceId) => ({ machineryId, serviceId })),
    });
  }
}

export async function createMachinery(
  user: PortalSessionPayload,
  raw: unknown,
): Promise<{ id: string }> {
  const input = createMachinerySchema.parse(raw);
  await ensureUniqueSlug(db.machinery, input.slug);

  return db.$transaction(async (tx) => {
    const row = await tx.machinery.create({
      data: {
        name: input.name,
        equipmentType: input.equipmentType,
        model: input.model ?? null,
        maxDepthM: input.maxDepthM ?? null,
        diameters: input.diameters ?? null,
        inSituTests: input.inSituTests ?? undefined,
        hasEnacLab: input.hasEnacLab ?? null,
        photoId: input.photoId ?? null,
        slug: input.slug,
        workflowStatus: WorkflowStatus.borrador_ia,
        isAiAssisted: input.isAiAssisted ?? false,
        authorId: input.authorId ?? user.userId,
        createdById: user.userId,
        updatedById: user.userId,
      },
      select: { id: true },
    });
    if (input.serviceIds) {
      await syncMachineryServices(tx, row.id, input.serviceIds);
    }
    return row;
  });
}

export async function updateMachinery(
  user: PortalSessionPayload,
  machineryId: string,
  raw: unknown,
): Promise<void> {
  const input = updateMachinerySchema.parse(raw);
  const existing = await db.machinery.findFirst({
    where: { id: machineryId, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  if (input.slug) {
    await ensureUniqueSlug(db.machinery, input.slug, { excludeId: machineryId });
  }

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.machinery.update({
      where: { id: machineryId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.equipmentType !== undefined
          ? { equipmentType: input.equipmentType }
          : {}),
        ...(input.model !== undefined ? { model: input.model } : {}),
        ...(input.maxDepthM !== undefined ? { maxDepthM: input.maxDepthM } : {}),
        ...(input.diameters !== undefined ? { diameters: input.diameters } : {}),
        ...(input.inSituTests !== undefined
          ? { inSituTests: input.inSituTests ?? undefined }
          : {}),
        ...(input.hasEnacLab !== undefined ? { hasEnacLab: input.hasEnacLab } : {}),
        ...(input.photoId !== undefined ? { photoId: input.photoId } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
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
    if (input.serviceIds) {
      await syncMachineryServices(tx, machineryId, input.serviceIds);
    }
    await recordContentUpdateAudit(tx, user, {
      entityType: MACHINERY_ENTITY,
      entityId: machineryId,
      entitySlug: input.slug ?? existing.slug,
    });
  });
}

export async function softDeleteMachinery(
  user: PortalSessionPayload,
  machineryId: string,
): Promise<void> {
  const existing = await db.machinery.findFirst({
    where: { id: machineryId, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  await db.$transaction(async (tx) => {
    await tx.machinery.update({
      where: { id: machineryId },
      data: { deletedAt: new Date(), updatedById: user.userId },
    });
    await recordContentDeleteAudit(tx, user, {
      entityType: MACHINERY_ENTITY,
      entityId: machineryId,
      entitySlug: existing.slug,
    });
  });
}
