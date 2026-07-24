import { ContentConflictError } from '@/lib/content/errors';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export type SlugLookupDelegate = {
  findFirst: (args: {
    where: { slug: string; deletedAt: null; id?: { not: string } };
    select: { id: true };
  }) => Promise<{ id: string } | null>;
};

export async function ensureUniqueSlug(
  delegate: SlugLookupDelegate,
  slug: string,
  options?: { excludeId?: string },
): Promise<void> {
  if (!SLUG_PATTERN.test(slug) || slug.length === 0) {
    throw new ContentConflictError('Slug no válido');
  }

  const existing = await delegate.findFirst({
    where: {
      slug,
      deletedAt: null,
      ...(options?.excludeId ? { id: { not: options.excludeId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    throw new ContentConflictError('Slug ya en uso');
  }
}

export function resolveMediaFileUrl(fileUrl: string, baseUrl: string): string {
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }
  const base = baseUrl.replace(/\/$/, '');
  const path = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  return `${base}${path}`;
}
