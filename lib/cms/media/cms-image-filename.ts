import { randomUUID } from 'node:crypto';

import { ContentValidationError } from '@/lib/content/errors';
import { slugify } from '@/lib/content/slug';

import {
  CMS_IMAGE_ALLOWED_MIME_TYPES,
  CMS_IMAGE_MIME_TO_EXT,
  type CmsImageAllowedMimeType,
} from './cms-image-upload-constants';

export function buildCmsImageFilename(originalName: string, mimeType: string): string {
  if (
    !CMS_IMAGE_ALLOWED_MIME_TYPES.includes(mimeType as CmsImageAllowedMimeType)
  ) {
    throw new ContentValidationError('Tipo de imagen no permitido');
  }
  const ext = CMS_IMAGE_MIME_TO_EXT[mimeType as CmsImageAllowedMimeType];
  const baseName = slugify(originalName.replace(/\.[^.]+$/, '')) || 'imagen';
  return `${baseName}-${randomUUID().slice(0, 8)}${ext}`;
}
