export const CMS_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const CMS_IMAGE_UPLOAD_CATEGORIES = [
  'maquinaria',
  'equipo',
  'blog',
  'servicios',
  'proyectos',
  'general',
] as const;

export type CmsImageUploadCategory = (typeof CMS_IMAGE_UPLOAD_CATEGORIES)[number];

export const CMS_IMAGE_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
] as const;

export type CmsImageAllowedMimeType = (typeof CMS_IMAGE_ALLOWED_MIME_TYPES)[number];

export const CMS_IMAGE_MIME_TO_EXT: Record<CmsImageAllowedMimeType, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};
