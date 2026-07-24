import 'server-only';

import { CredentialType, WorkflowStatus, type Prisma } from '@prisma/client';
import { z } from 'zod';

import {
  recordContentDeleteAudit,
  recordContentUpdateAudit,
} from '@/lib/content/content-audit';
import { ContentNotFoundError } from '@/lib/content/errors';
import { editorialCrudBlockSchema } from '@/lib/content/schemas/editorial';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { db } from '@/lib/db';

const accreditationBodySchema = z.object({
  name: z.string().min(1),
  credentialType: z.nativeEnum(CredentialType),
  issuer: z.string().nullable().optional(),
  registrationNumber: z.string().nullable().optional(),
  logoId: z.uuid().nullable().optional(),
  verificationUrl: z.url().nullable().optional(),
  documentId: z.uuid().nullable().optional(),
  validUntil: z.coerce.date().nullable().optional(),
});

export const createAccreditationSchema = accreditationBodySchema.merge(
  editorialCrudBlockSchema,
);

export const updateAccreditationSchema = accreditationBodySchema
  .partial()
  .merge(editorialCrudBlockSchema.partial());

const ENTITY_TYPE = 'accreditation';

export async function createAccreditation(
  user: PortalSessionPayload,
  raw: unknown,
): Promise<{ id: string }> {
  const input = createAccreditationSchema.parse(raw);
  return db.accreditation.create({
    data: {
      name: input.name,
      credentialType: input.credentialType,
      issuer: input.issuer ?? null,
      registrationNumber: input.registrationNumber ?? null,
      logoId: input.logoId ?? null,
      verificationUrl: input.verificationUrl ?? null,
      documentId: input.documentId ?? null,
      validUntil: input.validUntil ?? null,
      workflowStatus: WorkflowStatus.borrador_ia,
      isAiAssisted: input.isAiAssisted ?? false,
      authorId: input.authorId ?? user.userId,
      createdById: user.userId,
      updatedById: user.userId,
    },
    select: { id: true },
  });
}

export async function updateAccreditation(
  user: PortalSessionPayload,
  accreditationId: string,
  raw: unknown,
): Promise<void> {
  const input = updateAccreditationSchema.parse(raw);
  const existing = await db.accreditation.findFirst({
    where: { id: accreditationId, deletedAt: null },
    select: { id: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.accreditation.update({
      where: { id: accreditationId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.credentialType !== undefined
          ? { credentialType: input.credentialType }
          : {}),
        ...(input.issuer !== undefined ? { issuer: input.issuer } : {}),
        ...(input.registrationNumber !== undefined
          ? { registrationNumber: input.registrationNumber }
          : {}),
        ...(input.logoId !== undefined ? { logoId: input.logoId } : {}),
        ...(input.verificationUrl !== undefined
          ? { verificationUrl: input.verificationUrl }
          : {}),
        ...(input.documentId !== undefined ? { documentId: input.documentId } : {}),
        ...(input.validUntil !== undefined ? { validUntil: input.validUntil } : {}),
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
      entityId: accreditationId,
    });
  });
}

export async function softDeleteAccreditation(
  user: PortalSessionPayload,
  accreditationId: string,
): Promise<void> {
  const existing = await db.accreditation.findFirst({
    where: { id: accreditationId, deletedAt: null },
    select: { id: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  await db.$transaction(async (tx) => {
    await tx.accreditation.update({
      where: { id: accreditationId },
      data: { deletedAt: new Date(), updatedById: user.userId },
    });
    await recordContentDeleteAudit(tx, user, {
      entityType: ENTITY_TYPE,
      entityId: accreditationId,
    });
  });
}
