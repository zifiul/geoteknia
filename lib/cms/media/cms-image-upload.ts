import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import 'server-only';

import { ContentValidationError } from '@/lib/content/errors';

import { buildCmsImageFilename } from './cms-image-filename';
import {
  CMS_IMAGE_MAX_BYTES,
  CMS_IMAGE_UPLOAD_CATEGORIES,
  type CmsImageUploadCategory,
} from './cms-image-upload-constants';

export function assertCmsImageUploadCategory(
  category: string,
): asserts category is CmsImageUploadCategory {
  if (!CMS_IMAGE_UPLOAD_CATEGORIES.includes(category as CmsImageUploadCategory)) {
    throw new ContentValidationError('Categoría de imagen no válida');
  }
}

export async function uploadCmsImageFile(
  file: File,
  category: CmsImageUploadCategory,
): Promise<{ fileUrl: string }> {
  if (!file || file.size === 0) {
    throw new ContentValidationError('No se recibió ningún archivo');
  }
  if (file.size > CMS_IMAGE_MAX_BYTES) {
    throw new ContentValidationError('La imagen supera el tamaño máximo (5 MB)');
  }

  const filename = buildCmsImageFilename(file.name, file.type);
  const publicDir = path.join(process.cwd(), 'public', 'images', category);
  const destPath = path.join(publicDir, filename);
  const resolvedDest = path.resolve(destPath);
  const resolvedDir = path.resolve(publicDir);

  if (!resolvedDest.startsWith(`${resolvedDir}${path.sep}`)) {
    throw new ContentValidationError('Ruta de destino no válida');
  }

  await mkdir(resolvedDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(resolvedDest, buffer);

  return { fileUrl: `/images/${category}/${filename}` };
}
