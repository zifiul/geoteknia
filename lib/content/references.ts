import 'server-only';

import type { Prisma } from '@prisma/client';

import { ContentValidationError } from '@/lib/content/errors';

export async function assertActiveServiceIds(
  tx: Prisma.TransactionClient,
  serviceIds: string[],
): Promise<void> {
  if (serviceIds.length === 0) {
    return;
  }
  const unique = [...new Set(serviceIds)];
  const count = await tx.service.count({
    where: { id: { in: unique }, deletedAt: null },
  });
  if (count !== unique.length) {
    throw new ContentValidationError('Servicio referenciado no válido');
  }
}

export async function assertActiveGeoZoneIds(
  tx: Prisma.TransactionClient,
  zoneIds: string[],
): Promise<void> {
  if (zoneIds.length === 0) {
    return;
  }
  const unique = [...new Set(zoneIds)];
  const count = await tx.geoZone.count({
    where: { id: { in: unique }, deletedAt: null },
  });
  if (count !== unique.length) {
    throw new ContentValidationError('Geo-zona referenciada no válida');
  }
}

export async function assertActiveTeamMemberIds(
  tx: Prisma.TransactionClient,
  teamMemberIds: string[],
): Promise<void> {
  if (teamMemberIds.length === 0) {
    return;
  }
  const unique = [...new Set(teamMemberIds)];
  const count = await tx.teamMember.count({
    where: { id: { in: unique }, deletedAt: null },
  });
  if (count !== unique.length) {
    throw new ContentValidationError('Miembro de equipo no válido');
  }
}

export async function assertActiveMachineryIds(
  tx: Prisma.TransactionClient,
  machineryIds: string[],
): Promise<void> {
  if (machineryIds.length === 0) {
    return;
  }
  const unique = [...new Set(machineryIds)];
  const count = await tx.machinery.count({
    where: { id: { in: unique }, deletedAt: null },
  });
  if (count !== unique.length) {
    throw new ContentValidationError('Maquinaria referenciada no válida');
  }
}

export async function assertActiveMediaAssetIds(
  tx: Prisma.TransactionClient,
  mediaIds: string[],
): Promise<void> {
  if (mediaIds.length === 0) {
    return;
  }
  const unique = [...new Set(mediaIds)];
  const count = await tx.mediaAsset.count({
    where: { id: { in: unique }, deletedAt: null },
  });
  if (count !== unique.length) {
    throw new ContentValidationError('Media asset no válido');
  }
}

export async function assertActiveBlogCategoryId(
  tx: Prisma.TransactionClient,
  categoryId: string,
): Promise<void> {
  const row = await tx.blogCategory.findFirst({
    where: { id: categoryId, deletedAt: null },
    select: { id: true },
  });
  if (!row) {
    throw new ContentValidationError('Categoría de blog no válida');
  }
}

export async function assertActiveFaqGroupId(
  tx: Prisma.TransactionClient,
  faqGroupId: string,
): Promise<void> {
  const row = await tx.faqGroup.findFirst({
    where: { id: faqGroupId, deletedAt: null },
    select: { id: true },
  });
  if (!row) {
    throw new ContentValidationError('Grupo FAQ no válido');
  }
}

export async function assertActiveProvinceId(
  tx: Prisma.TransactionClient,
  provinceId: string,
): Promise<void> {
  const row = await tx.province.findFirst({
    where: { id: provinceId, deletedAt: null },
    select: { id: true },
  });
  if (!row) {
    throw new ContentValidationError('Provincia no válida');
  }
}

export async function assertActiveWorkTypologyId(
  tx: Prisma.TransactionClient,
  workTypologyId: string,
): Promise<void> {
  const row = await tx.workTypology.findFirst({
    where: { id: workTypologyId, deletedAt: null },
    select: { id: true },
  });
  if (!row) {
    throw new ContentValidationError('Tipología de obra no válida');
  }
}
