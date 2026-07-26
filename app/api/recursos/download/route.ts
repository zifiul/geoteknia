import { NextRequest, NextResponse } from 'next/server';

import { resolveMediaFileUrl } from '@/lib/content/slug';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { apiError } from '@/lib/http/api-envelope';
import { parseResourceDownloadToken } from '@/lib/leads/resource-download-token';

export async function GET(request: NextRequest) {
  const rawToken = request.nextUrl.searchParams.get('token');
  if (!rawToken?.trim()) {
    return apiError(400, {
      code: 'VALIDATION_ERROR',
      message: 'Token de descarga requerido',
    });
  }

  const parsed = parseResourceDownloadToken(rawToken.trim());
  if (!parsed) {
    return apiError(400, {
      code: 'INVALID_TOKEN',
      message: 'Token de descarga no válido',
    });
  }

  const lead = await db.lead.findUnique({
    where: { id: parsed.leadId },
    select: { leadMagnetId: true },
  });
  if (!lead?.leadMagnetId || lead.leadMagnetId !== parsed.leadMagnetId) {
    return apiError(404, {
      code: 'NOT_FOUND',
      message: 'La descarga no está disponible',
    });
  }

  const magnet = await db.leadMagnet.findFirst({
    where: { id: parsed.leadMagnetId, deletedAt: null },
    select: { fileId: true },
  });
  if (!magnet) {
    return apiError(404, {
      code: 'NOT_FOUND',
      message: 'La descarga no está disponible',
    });
  }

  const asset = await db.mediaAsset.findFirst({
    where: { id: magnet.fileId, deletedAt: null },
    select: { fileUrl: true },
  });
  if (!asset) {
    return apiError(404, {
      code: 'NOT_FOUND',
      message: 'El fichero no está disponible',
    });
  }

  const publicUrl = resolveMediaFileUrl(asset.fileUrl, env.MEDIA_STORAGE_BASE_URL);
  return NextResponse.redirect(publicUrl, 302);
}
