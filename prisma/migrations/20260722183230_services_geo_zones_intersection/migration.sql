-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "body" TEXT NOT NULL,
    "methodology" JSONB,
    "applicable_norms" TEXT,
    "deliverables" JSONB,
    "hero_image_id" UUID,
    "order" INTEGER,
    "is_pillar" BOOLEAN NOT NULL DEFAULT true,
    "slug" TEXT NOT NULL,
    "meta_title" VARCHAR(60),
    "meta_description" VARCHAR(155),
    "canonical_url" TEXT,
    "schema_type" "SchemaType" NOT NULL,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "og_image_id" UUID,
    "h1" TEXT,
    "workflow_status" "WorkflowStatus" NOT NULL DEFAULT 'borrador_ia',
    "is_ai_assisted" BOOLEAN NOT NULL DEFAULT false,
    "author_id" UUID,
    "reviewed_by_id" UUID,
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "scheduled_publish_at" TIMESTAMP(3),
    "current_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "updated_by_id" UUID,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geo_zones" (
    "id" UUID NOT NULL,
    "province_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "local_geology" TEXT NOT NULL,
    "operational_base" TEXT,
    "body" TEXT NOT NULL,
    "word_count" INTEGER,
    "hero_image_id" UUID,
    "slug" TEXT NOT NULL,
    "meta_title" VARCHAR(60),
    "meta_description" VARCHAR(155),
    "canonical_url" TEXT,
    "schema_type" "SchemaType" NOT NULL,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "og_image_id" UUID,
    "h1" TEXT,
    "workflow_status" "WorkflowStatus" NOT NULL DEFAULT 'borrador_ia',
    "is_ai_assisted" BOOLEAN NOT NULL DEFAULT false,
    "author_id" UUID,
    "reviewed_by_id" UUID,
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "scheduled_publish_at" TIMESTAMP(3),
    "current_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "updated_by_id" UUID,

    CONSTRAINT "geo_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_zone_pages" (
    "id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "zone_id" UUID NOT NULL,
    "target_keyword" TEXT,
    "body" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "meta_title" VARCHAR(60),
    "meta_description" VARCHAR(155),
    "canonical_url" TEXT,
    "schema_type" "SchemaType" NOT NULL,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "og_image_id" UUID,
    "h1" TEXT,
    "workflow_status" "WorkflowStatus" NOT NULL DEFAULT 'borrador_ia',
    "is_ai_assisted" BOOLEAN NOT NULL DEFAULT false,
    "author_id" UUID,
    "reviewed_by_id" UUID,
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "scheduled_publish_at" TIMESTAMP(3),
    "current_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "updated_by_id" UUID,

    CONSTRAINT "service_zone_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_zone_coverage" (
    "service_id" UUID NOT NULL,
    "zone_id" UUID NOT NULL,

    CONSTRAINT "service_zone_coverage_pkey" PRIMARY KEY ("service_id","zone_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE INDEX "services_workflow_status_idx" ON "services"("workflow_status");

-- CreateIndex
CREATE INDEX "services_deleted_at_idx" ON "services"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "geo_zones_slug_key" ON "geo_zones"("slug");

-- CreateIndex
CREATE INDEX "geo_zones_province_id_idx" ON "geo_zones"("province_id");

-- CreateIndex
CREATE INDEX "geo_zones_workflow_status_idx" ON "geo_zones"("workflow_status");

-- CreateIndex
CREATE UNIQUE INDEX "service_zone_pages_slug_key" ON "service_zone_pages"("slug");

-- CreateIndex
CREATE INDEX "service_zone_pages_workflow_status_idx" ON "service_zone_pages"("workflow_status");

-- CreateIndex
CREATE UNIQUE INDEX "service_zone_pages_service_id_zone_id_key" ON "service_zone_pages"("service_id", "zone_id");

-- AddForeignKey
ALTER TABLE "geo_zones" ADD CONSTRAINT "geo_zones_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_zone_pages" ADD CONSTRAINT "service_zone_pages_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_zone_pages" ADD CONSTRAINT "service_zone_pages_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "geo_zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_zone_coverage" ADD CONSTRAINT "service_zone_coverage_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_zone_coverage" ADD CONSTRAINT "service_zone_coverage_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "geo_zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
