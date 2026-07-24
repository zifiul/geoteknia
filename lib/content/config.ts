import 'server-only';

import { ContactDepartment, type Prisma } from '@prisma/client';
import { z } from 'zod';

import {
  recordContentDeleteAudit,
  recordContentUpdateAudit,
} from '@/lib/content/content-audit';
import { ContentNotFoundError } from '@/lib/content/errors';
import { assertActiveWorkTypologyId } from '@/lib/content/references';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { db } from '@/lib/db';

const calculatorRuleBodySchema = z.object({
  workTypologyId: z.uuid(),
  minFloors: z.number().int().nullable().optional(),
  maxFloors: z.number().int().nullable().optional(),
  minAreaM2: z.coerce.number().nullable().optional(),
  maxAreaM2: z.coerce.number().nullable().optional(),
  boreholesFormula: z.record(z.string(), z.unknown()),
  depthEstimate: z.string().nullable().optional(),
  recommendedTests: z.string().nullable().optional(),
  cteReference: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const createCalculatorRuleSchema = calculatorRuleBodySchema;
export const updateCalculatorRuleSchema = calculatorRuleBodySchema.partial();

const CALC_ENTITY = 'calculator_rule';

export async function createCalculatorRule(
  user: PortalSessionPayload,
  raw: unknown,
): Promise<{ id: string }> {
  const input = createCalculatorRuleSchema.parse(raw);
  await assertActiveWorkTypologyId(db, input.workTypologyId);
  return db.calculatorRule.create({
    data: {
      workTypologyId: input.workTypologyId,
      minFloors: input.minFloors ?? null,
      maxFloors: input.maxFloors ?? null,
      minAreaM2: input.minAreaM2 ?? null,
      maxAreaM2: input.maxAreaM2 ?? null,
      boreholesFormula: input.boreholesFormula,
      depthEstimate: input.depthEstimate ?? null,
      recommendedTests: input.recommendedTests ?? null,
      cteReference: input.cteReference ?? null,
      isActive: input.isActive ?? true,
      createdById: user.userId,
      updatedById: user.userId,
    },
    select: { id: true },
  });
}

export async function updateCalculatorRule(
  user: PortalSessionPayload,
  ruleId: string,
  raw: unknown,
): Promise<void> {
  const input = updateCalculatorRuleSchema.parse(raw);
  const existing = await db.calculatorRule.findFirst({
    where: { id: ruleId, deletedAt: null },
    select: { id: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  if (input.workTypologyId) {
    await assertActiveWorkTypologyId(db, input.workTypologyId);
  }

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.calculatorRule.update({
      where: { id: ruleId },
      data: {
        ...(input.workTypologyId !== undefined
          ? { workTypologyId: input.workTypologyId }
          : {}),
        ...(input.minFloors !== undefined ? { minFloors: input.minFloors } : {}),
        ...(input.maxFloors !== undefined ? { maxFloors: input.maxFloors } : {}),
        ...(input.minAreaM2 !== undefined ? { minAreaM2: input.minAreaM2 } : {}),
        ...(input.maxAreaM2 !== undefined ? { maxAreaM2: input.maxAreaM2 } : {}),
        ...(input.boreholesFormula !== undefined
          ? { boreholesFormula: input.boreholesFormula }
          : {}),
        ...(input.depthEstimate !== undefined
          ? { depthEstimate: input.depthEstimate }
          : {}),
        ...(input.recommendedTests !== undefined
          ? { recommendedTests: input.recommendedTests }
          : {}),
        ...(input.cteReference !== undefined
          ? { cteReference: input.cteReference }
          : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        updatedById: user.userId,
      },
    });
    await recordContentUpdateAudit(tx, user, {
      entityType: CALC_ENTITY,
      entityId: ruleId,
    });
  });
}

export async function softDeleteCalculatorRule(
  user: PortalSessionPayload,
  ruleId: string,
): Promise<void> {
  const existing = await db.calculatorRule.findFirst({
    where: { id: ruleId, deletedAt: null },
    select: { id: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  await db.$transaction(async (tx) => {
    await tx.calculatorRule.update({
      where: { id: ruleId },
      data: { deletedAt: new Date(), updatedById: user.userId },
    });
    await recordContentDeleteAudit(tx, user, {
      entityType: CALC_ENTITY,
      entityId: ruleId,
    });
  });
}

const organizationProfileSchema = z.object({
  legalName: z.string().min(1),
  displayName: z.string().min(1),
  napAddress: z.string().min(1),
  napPhone: z.string().min(1),
  napEmail: z.email(),
  gbpPlaceId: z.string().nullable().optional(),
  areaServed: z.unknown(),
  aggregateRating: z.coerce.number().nullable().optional(),
  socialProfiles: z.unknown().optional(),
});

export const updateOrganizationProfileSchema = organizationProfileSchema;

const ORG_ENTITY = 'organization_profile';

export async function updateOrganizationProfile(
  user: PortalSessionPayload,
  profileId: string,
  raw: unknown,
): Promise<void> {
  const input = updateOrganizationProfileSchema.parse(raw);
  const existing = await db.organizationProfile.findFirst({
    where: { id: profileId, deletedAt: null },
    select: { id: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.organizationProfile.update({
      where: { id: profileId },
      data: {
        legalName: input.legalName,
        displayName: input.displayName,
        napAddress: input.napAddress,
        napPhone: input.napPhone,
        napEmail: input.napEmail,
        gbpPlaceId: input.gbpPlaceId ?? null,
        areaServed: input.areaServed as Prisma.InputJsonValue,
        aggregateRating: input.aggregateRating ?? null,
        socialProfiles: (input.socialProfiles ?? undefined) as
          | Prisma.InputJsonValue
          | undefined,
        updatedById: user.userId,
      },
    });
    await recordContentUpdateAudit(tx, user, {
      entityType: ORG_ENTITY,
      entityId: profileId,
    });
  });
}

const contactChannelSchema = z.object({
  department: z.nativeEnum(ContactDepartment),
  phone: z.string().nullable().optional(),
  whatsappNumber: z.string().nullable().optional(),
  email: z.email().nullable().optional(),
  prefilledMessageTemplate: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const createContactChannelSchema = contactChannelSchema;
export const updateContactChannelSchema = contactChannelSchema.partial();

const CONTACT_ENTITY = 'contact_channel';

export async function createContactChannel(
  user: PortalSessionPayload,
  raw: unknown,
): Promise<{ id: string }> {
  const input = createContactChannelSchema.parse(raw);
  return db.contactChannel.create({
    data: {
      department: input.department,
      phone: input.phone ?? null,
      whatsappNumber: input.whatsappNumber ?? null,
      email: input.email ?? null,
      prefilledMessageTemplate: input.prefilledMessageTemplate ?? null,
      isActive: input.isActive ?? true,
      createdById: user.userId,
      updatedById: user.userId,
    },
    select: { id: true },
  });
}

export async function updateContactChannel(
  user: PortalSessionPayload,
  channelId: string,
  raw: unknown,
): Promise<void> {
  const input = updateContactChannelSchema.parse(raw);
  const existing = await db.contactChannel.findFirst({
    where: { id: channelId, deletedAt: null },
    select: { id: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.contactChannel.update({
      where: { id: channelId },
      data: {
        ...(input.department !== undefined ? { department: input.department } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.whatsappNumber !== undefined
          ? { whatsappNumber: input.whatsappNumber }
          : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
        ...(input.prefilledMessageTemplate !== undefined
          ? { prefilledMessageTemplate: input.prefilledMessageTemplate }
          : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        updatedById: user.userId,
      },
    });
    await recordContentUpdateAudit(tx, user, {
      entityType: CONTACT_ENTITY,
      entityId: channelId,
    });
  });
}

export async function softDeleteContactChannel(
  user: PortalSessionPayload,
  channelId: string,
): Promise<void> {
  const existing = await db.contactChannel.findFirst({
    where: { id: channelId, deletedAt: null },
    select: { id: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  await db.$transaction(async (tx) => {
    await tx.contactChannel.update({
      where: { id: channelId },
      data: { deletedAt: new Date(), updatedById: user.userId },
    });
    await recordContentDeleteAudit(tx, user, {
      entityType: CONTACT_ENTITY,
      entityId: channelId,
    });
  });
}
