import { AssetType } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import { createMediaAssetSchema } from '@/lib/content/schemas/media';

describe('createMediaAssetSchema', () => {
  it('exige alt_text en imágenes', () => {
    const result = createMediaAssetSchema.safeParse({
      fileUrl: '/foo.jpg',
      assetType: AssetType.image,
    });
    expect(result.success).toBe(false);
  });

  it('acepta imagen con alt_text', () => {
    const result = createMediaAssetSchema.safeParse({
      fileUrl: '/foo.jpg',
      assetType: AssetType.image,
      altText: 'Equipo en obra',
    });
    expect(result.success).toBe(true);
  });
});
