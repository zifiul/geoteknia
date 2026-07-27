import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/env', () => ({
  env: { MEDIA_STORAGE_BASE_URL: 'https://media.example.com' },
}));

const { contentMediaFindMany } = vi.hoisted(() => ({
  contentMediaFindMany: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    contentMedia: { findMany: contentMediaFindMany },
  },
}));

import { listContentMediaGallery } from '@/lib/content/media-assets';

describe('listContentMediaGallery GTK-53', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contentMediaFindMany.mockResolvedValue([]);
  });

  it('consulta por contentType y contentId ordenado', async () => {
    await listContentMediaGallery('case_study', 'uuid-1');
    expect(contentMediaFindMany).toHaveBeenCalledWith({
      where: { contentType: 'case_study', contentId: 'uuid-1' },
      orderBy: { order: 'asc' },
      select: expect.any(Object),
    });
  });

  it('filtra assets borrados y resuelve URL y alt', async () => {
    contentMediaFindMany.mockResolvedValue([
      {
        order: 0,
        mediaAsset: {
          fileUrl: '/a.jpg',
          altText: 'Sondeo 1',
          deletedAt: null,
        },
      },
      {
        order: 1,
        mediaAsset: {
          fileUrl: '/b.jpg',
          altText: null,
          deletedAt: new Date(),
        },
      },
      {
        order: 2,
        mediaAsset: {
          fileUrl: '/c.jpg',
          altText: '  ',
          deletedAt: null,
        },
      },
    ]);

    const items = await listContentMediaGallery('service', 'svc-id');
    expect(items).toEqual([
      {
        url: 'https://media.example.com/a.jpg',
        alt: 'Sondeo 1',
        order: 0,
      },
      {
        url: 'https://media.example.com/c.jpg',
        alt: 'Fotografía de campo',
        order: 2,
      },
    ]);
  });
});
