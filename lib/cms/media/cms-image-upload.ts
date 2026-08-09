import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { put } from '@vercel/blob';

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

function isBlobStorageConfigured(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN),
  );
}

function validateCmsImageFile(file: File): void {
  if (!file || file.size === 0) {
    throw new ContentValidationError('No se recibió ningún archivo');
  }
  if (file.size > CMS_IMAGE_MAX_BYTES) {
    throw new ContentValidationError('La imagen supera el tamaño máximo (5 MB)');
  }
}

async function uploadCmsImageToLocalFilesystem(
  file: File,
  category: CmsImageUploadCategory,
  filename: string,
): Promise<{ fileUrl: string }> {
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

async function uploadCmsImageToBlob(
  file: File,
  category: CmsImageUploadCategory,
  filename: string,
): Promise<{ fileUrl: string }> {
  const pathname = `images/${category}/${filename}`;

  await put(pathname, file, {
    access: 'public',
    contentType: file.type,
    addRandomSuffix: false,
  });

  return { fileUrl: `/${pathname}` };
}

export async function uploadCmsImageFile(
  file: File,
  category: CmsImageUploadCategory,
): Promise<{ fileUrl: string }> {
  validateCmsImageFile(file);

  const filename = buildCmsImageFilename(file.name, file.type);

  if (isBlobStorageConfigured()) {
    try {
      return await uploadCmsImageToBlob(file, category, filename);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[cms-image-upload] Fallo en Vercel Blob; usando disco local.',
          error instanceof Error ? error.message : error,
        );
        return uploadCmsImageToLocalFilesystem(file, category, filename);
      }
      throw error;
    }
  }

  return uploadCmsImageToLocalFilesystem(file, category, filename);
}
