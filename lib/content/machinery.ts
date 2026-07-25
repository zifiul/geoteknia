import 'server-only';

import { env } from '@/lib/env';
import { db } from '@/lib/db';
import { PUBLISHED_EDITORIAL_WHERE } from '@/lib/content/published-filter';
import { resolveMediaFileUrl } from '@/lib/content/slug';

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

  return rows.map((row) => {
    const photo = row.photoId ? assetById.get(row.photoId) : undefined;
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      model: row.model,
      photoUrl: photo ? resolveMediaFileUrl(photo.fileUrl, base) : null,
      photoAlt: photo?.altText ?? null,
    };
  });
}
