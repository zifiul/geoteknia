import 'server-only';

import { EquipmentType } from '@prisma/client';

import { env } from '@/lib/env';
import { db } from '@/lib/db';
import { PUBLISHED_EDITORIAL_WHERE } from '@/lib/content/published-filter';
import {
  parseStoredMachineryInSituTests,
  type MachineryInSituTestCode,
} from '@/lib/content/schemas/machinery-in-situ-tests';
import { resolveMediaFileUrl, resolveNextImageMediaSrc } from '@/lib/content/slug';

export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  sonda_rotacion: 'Sonda de rotación',
  sonda_percusion: 'Sonda de percusión',
  mixta: 'Sonda mixta',
  ensayo_in_situ: 'Equipo de ensayo in situ',
  laboratorio: 'Laboratorio / ensayos',
  vehiculo_especial: 'Vehículo especial',
};

export type PublishedMachineryLinkedService = {
  id: string;
  name: string;
  slug: string;
};

export type PublishedMachineryDetail = {
  id: string;
  name: string;
  slug: string;
  equipmentType: EquipmentType;
  model: string | null;
  maxDepthM: string | null;
  diameters: string | null;
  inSituTests: MachineryInSituTestCode[] | null;
  hasEnacLab: boolean | null;
  photoUrl: string | null;
  photoAlt: string | null;
  services: PublishedMachineryLinkedService[];
};

export type PublishedMachineryListItem = {
  id: string;
  name: string;
  slug: string;
  model: string | null;
  photoUrl: string | null;
  photoAlt: string | null;
};

export async function listMachineryByService(
  serviceId: string,
): Promise<PublishedMachineryListItem[]> {
  const links = await db.machineryService.findMany({
    where: { serviceId },
    select: { machineryId: true },
  });
  const machineryIds = links.map((link) => link.machineryId);
  if (machineryIds.length === 0) {
    return [];
  }

  const rows = await db.machinery.findMany({
    where: {
      id: { in: machineryIds },
      ...PUBLISHED_EDITORIAL_WHERE,
    },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      model: true,
      photoId: true,
    },
  });

  const photoIds = rows
    .map((row) => row.photoId)
    .filter((id): id is string => id !== null);
  const assets =
    photoIds.length > 0
      ? await db.mediaAsset.findMany({
          where: { id: { in: photoIds }, deletedAt: null },
          select: { id: true, fileUrl: true, altText: true },
        })
      : [];
  const assetById = new Map(assets.map((asset) => [asset.id, asset]));
  const base = env.MEDIA_STORAGE_BASE_URL;
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;

  return rows.map((row) => {
    const photo = row.photoId ? assetById.get(row.photoId) : undefined;
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      model: row.model,
      photoUrl: photo
        ? resolveNextImageMediaSrc(photo.fileUrl, base, siteUrl)
        : null,
      photoAlt: photo?.altText ?? null,
    };
  });
}

export async function listPublishedMachinery(): Promise<PublishedMachineryDetail[]> {
  const rows = await db.machinery.findMany({
    where: PUBLISHED_EDITORIAL_WHERE,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      equipmentType: true,
      model: true,
      maxDepthM: true,
      diameters: true,
      inSituTests: true,
      hasEnacLab: true,
      photoId: true,
      services: {
        where: {
          service: PUBLISHED_EDITORIAL_WHERE,
        },
        select: {
          service: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  const photoIds = rows
    .map((row) => row.photoId)
    .filter((id): id is string => id !== null);
  const assets =
    photoIds.length > 0
      ? await db.mediaAsset.findMany({
          where: { id: { in: photoIds }, deletedAt: null },
          select: { id: true, fileUrl: true, altText: true },
        })
      : [];
  const assetById = new Map(assets.map((asset) => [asset.id, asset]));
  const base = env.MEDIA_STORAGE_BASE_URL;
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;

  return rows.map((row) => {
    const photo = row.photoId ? assetById.get(row.photoId) : undefined;
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      equipmentType: row.equipmentType,
      model: row.model,
      maxDepthM: row.maxDepthM != null ? row.maxDepthM.toString() : null,
      diameters: row.diameters,
      inSituTests: parseStoredMachineryInSituTests(row.inSituTests),
      hasEnacLab: row.hasEnacLab,
      photoUrl: photo
        ? resolveNextImageMediaSrc(photo.fileUrl, base, siteUrl)
        : null,
      photoAlt: photo?.altText ?? null,
      services: row.services
        .map((link) => link.service)
        .sort((a, b) => a.name.localeCompare(b.name, 'es')),
    };
  });
}
