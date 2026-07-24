import 'server-only';

import { WorkflowStatus, type Prisma } from '@prisma/client';
import { z } from 'zod';

import {
  recordContentDeleteAudit,
  recordContentUpdateAudit,
} from '@/lib/content/content-audit';
import { ContentNotFoundError } from '@/lib/content/errors';
import {
  assertActiveGeoZoneIds,
} from '@/lib/content/references';
import { editorialCrudBlockSchema } from '@/lib/content/schemas/editorial';
import { seoBlockSchema } from '@/lib/content/schemas/seo';
import { ensureUniqueSlug } from '@/lib/content/slug';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { db } from '@/lib/db';

const serviceBodySchema = z.object({
  name: z.string().min(1),
  summary: z.string().nullable().optional(),
  body: z.string().min(1),
  methodology: z.unknown().optional(),
  applicableNorms: z.string().nullable().optional(),
  deliverables: z.unknown().optional(),
  heroImageId: z.uuid().nullable().optional(),
  order: z.number().int().nullable().optional(),
  isPillar: z.boolean().optional(),
  zoneIds: z.array(z.uuid()).optional(),
});

export const createServiceSchema = serviceBodySchema
  .merge(seoBlockSchema)
  .merge(editorialCrudBlockSchema);

export const updateServiceSchema = serviceBodySchema
  .partial()
  .merge(seoBlockSchema.partial())
  .merge(editorialCrudBlockSchema.partial());

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

const ENTITY_TYPE = 'service';

async function syncServiceZoneCoverage(
  tx: Prisma.TransactionClient,
  serviceId: string,
  zoneIds: string[],
): Promise<void> {
  await assertActiveGeoZoneIds(tx, zoneIds);
  await tx.serviceZoneCoverage.deleteMany({ where: { serviceId } });
  if (zoneIds.length > 0) {
    await tx.serviceZoneCoverage.createMany({
      data: zoneIds.map((zoneId) => ({ serviceId, zoneId })),
    });
  }
}

export async function createService(
  user: PortalSessionPayload,
  raw: unknown,
): Promise<{ id: string }> {
  const input = createServiceSchema.parse(raw);
  await ensureUniqueSlug(db.service, input.slug);

  return db.$transaction(async (tx) => {
    const service = await tx.service.create({
      data: {
        name: input.name,
        summary: input.summary ?? null,
        body: input.body,
        methodology: input.methodology ?? undefined,
        applicableNorms: input.applicableNorms ?? null,
        deliverables: input.deliverables ?? undefined,
        heroImageId: input.heroImageId ?? null,
        order: input.order ?? null,
        isPillar: input.isPillar ?? true,
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

    if (input.zoneIds) {
      await syncServiceZoneCoverage(tx, service.id, input.zoneIds);
    }

    return service;
  });
}

export async function updateService(
  user: PortalSessionPayload,
  serviceId: string,
  raw: unknown,
): Promise<void> {
  const input = updateServiceSchema.parse(raw);
  const existing = await db.service.findFirst({
    where: { id: serviceId, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }

  if (input.slug) {
    await ensureUniqueSlug(db.service, input.slug, { excludeId: serviceId });
  }

  await db.$transaction(async (tx) => {
    await tx.service.update({
      where: { id: serviceId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.summary !== undefined ? { summary: input.summary } : {}),
        ...(input.body !== undefined ? { body: input.body } : {}),
        ...(input.methodology !== undefined
          ? { methodology: input.methodology ?? undefined }
          : {}),
        ...(input.applicableNorms !== undefined
          ? { applicableNorms: input.applicableNorms }
          : {}),
        ...(input.deliverables !== undefined
          ? { deliverables: input.deliverables ?? undefined }
          : {}),
        ...(input.heroImageId !== undefined
          ? { heroImageId: input.heroImageId }
          : {}),
        ...(input.order !== undefined ? { order: input.order } : {}),
        ...(input.isPillar !== undefined ? { isPillar: input.isPillar } : {}),
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

    if (input.zoneIds) {
      await syncServiceZoneCoverage(tx, serviceId, input.zoneIds);
    }

    await recordContentUpdateAudit(tx, user, {
      entityType: ENTITY_TYPE,
      entityId: serviceId,
      entitySlug: input.slug ?? existing.slug,
    });
  });
}

export async function softDeleteService(
  user: PortalSessionPayload,
  serviceId: string,
): Promise<void> {
  const existing = await db.service.findFirst({
    where: { id: serviceId, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }

  await db.$transaction(async (tx) => {
    await tx.service.update({
      where: { id: serviceId },
      data: { deletedAt: new Date(), updatedById: user.userId },
    });
    await recordContentDeleteAudit(tx, user, {
      entityType: ENTITY_TYPE,
      entityId: serviceId,
      entitySlug: existing.slug,
    });
  });
}

export async function getServiceById(serviceId: string) {
  const row = await db.service.findFirst({
    where: { id: serviceId, deletedAt: null },
    include: {
      zoneCoverage: { select: { zoneId: true } },
    },
  });
  if (!row) {
    throw new ContentNotFoundError();
  }
  return row;
}

export async function listServices(params?: { skip?: number; take?: number }) {
  const take = params?.take ?? 50;
  const skip = params?.skip ?? 0;
  return db.service.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    take,
    skip,
    select: {
      id: true,
      name: true,
      slug: true,
      workflowStatus: true,
      updatedAt: true,
    },
  });
}
