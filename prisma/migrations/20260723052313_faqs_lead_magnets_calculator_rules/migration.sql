-- CreateEnum
CREATE TYPE "FaqScope" AS ENUM ('general', 'service');

-- CreateTable
CREATE TABLE "faq_groups" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "scope" "FaqScope" NOT NULL,
    "service_id" UUID,
    "slug" TEXT NOT NULL,
    "schema_type" "SchemaType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "updated_by_id" UUID,

    CONSTRAINT "faq_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" UUID NOT NULL,
    "faq_group_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "internal_link_url" TEXT,
    "order" INTEGER,
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

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_magnets" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "file_id" UUID NOT NULL,
    "service_id" UUID,
    "thank_you_url" TEXT NOT NULL,
    "is_gated" BOOLEAN NOT NULL DEFAULT true,
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

    CONSTRAINT "lead_magnets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculator_rules" (
    "id" UUID NOT NULL,
    "work_typology_id" UUID NOT NULL,
    "min_floors" INTEGER,
    "max_floors" INTEGER,
    "min_area_m2" DECIMAL(10,2),
    "max_area_m2" DECIMAL(10,2),
    "boreholes_formula" JSONB NOT NULL,
    "depth_estimate" TEXT,
    "recommended_tests" TEXT,
    "cte_reference" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "updated_by_id" UUID,

    CONSTRAINT "calculator_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "faq_groups_slug_key" ON "faq_groups"("slug");

-- CreateIndex
CREATE INDEX "faq_groups_service_id_idx" ON "faq_groups"("service_id");

-- CreateIndex
CREATE INDEX "faqs_faq_group_id_idx" ON "faqs"("faq_group_id");

-- CreateIndex
CREATE INDEX "faqs_workflow_status_idx" ON "faqs"("workflow_status");

-- CreateIndex
CREATE UNIQUE INDEX "lead_magnets_slug_key" ON "lead_magnets"("slug");

-- CreateIndex
CREATE INDEX "lead_magnets_service_id_idx" ON "lead_magnets"("service_id");

-- CreateIndex
CREATE INDEX "calculator_rules_work_typology_id_idx" ON "calculator_rules"("work_typology_id");

-- CreateIndex
CREATE INDEX "calculator_rules_is_active_idx" ON "calculator_rules"("is_active");

-- CreateIndex
CREATE INDEX "calculator_rules_work_typology_id_is_active_idx" ON "calculator_rules"("work_typology_id", "is_active");

-- AddForeignKey
ALTER TABLE "faq_groups" ADD CONSTRAINT "faq_groups_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_faq_group_id_fkey" FOREIGN KEY ("faq_group_id") REFERENCES "faq_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_magnets" ADD CONSTRAINT "lead_magnets_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculator_rules" ADD CONSTRAINT "calculator_rules_work_typology_id_fkey" FOREIGN KEY ("work_typology_id") REFERENCES "work_typologies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
