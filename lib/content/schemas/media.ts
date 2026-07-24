import { AssetType } from '@prisma/client';
import { z } from 'zod';

const mediaAssetBaseSchema = z.object({
  fileUrl: z.string().min(1),
  assetType: z.nativeEnum(AssetType),
  mimeType: z.string().nullable().optional(),
  altText: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  fileSizeKb: z.number().int().positive().nullable().optional(),
  includeInImageSitemap: z.boolean().optional(),
});

export const createMediaAssetSchema = mediaAssetBaseSchema.superRefine(
  (data, ctx) => {
    if (data.assetType === AssetType.image && !data.altText?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'alt_text es obligatorio para imágenes',
        path: ['altText'],
      });
    }
  },
);

export const updateMediaAssetSchema = mediaAssetBaseSchema.partial().superRefine(
  (data, ctx) => {
    if (
      data.assetType === AssetType.image &&
      data.altText !== undefined &&
      !data.altText?.trim()
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'alt_text es obligatorio para imágenes',
        path: ['altText'],
      });
    }
  },
);
