-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('image', 'pdf', 'document');

-- CreateTable
CREATE TABLE "media_assets" (
    "id" UUID NOT NULL,
    "file_url" TEXT NOT NULL,
    "asset_type" "AssetType" NOT NULL,
    "mime_type" TEXT,
    "alt_text" TEXT,
    "title" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "file_size_kb" INTEGER,
    "include_in_image_sitemap" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "updated_by_id" UUID,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_media" (
    "id" UUID NOT NULL,
    "media_asset_id" UUID NOT NULL,
    "content_type" TEXT NOT NULL,
    "content_id" UUID NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "content_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_assets_asset_type_idx" ON "media_assets"("asset_type");

-- CreateIndex
CREATE INDEX "media_assets_include_in_image_sitemap_idx" ON "media_assets"("include_in_image_sitemap");

-- CreateIndex
CREATE INDEX "content_media_content_type_content_id_idx" ON "content_media"("content_type", "content_id");

-- AddForeignKey
ALTER TABLE "content_media" ADD CONSTRAINT "content_media_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
