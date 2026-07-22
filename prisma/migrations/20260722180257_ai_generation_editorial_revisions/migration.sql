-- CreateEnum
CREATE TYPE "PromptPageType" AS ENUM ('service', 'geo_zone', 'service_zone', 'case_study', 'blog', 'faq', 'meta');

-- CreateEnum
CREATE TYPE "AiGenerationStatus" AS ENUM ('success', 'error', 'partial', 'retrying');

-- CreateTable
CREATE TABLE "prompt_templates" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "page_type" "PromptPageType" NOT NULL,
    "template_body" TEXT NOT NULL,
    "input_schema" JSONB NOT NULL,
    "default_model" "AiModel" NOT NULL,
    "cacheable_prefix" TEXT,
    "version" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "updated_by_id" UUID,

    CONSTRAINT "prompt_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_generations" (
    "id" UUID NOT NULL,
    "prompt_template_id" UUID NOT NULL,
    "target_content_type" TEXT,
    "target_content_id" UUID,
    "requested_by_id" UUID NOT NULL,
    "model" "AiModel" NOT NULL,
    "input_params" JSONB NOT NULL,
    "rendered_prompt" TEXT,
    "output_text" TEXT,
    "output_structured" JSONB,
    "status" "AiGenerationStatus" NOT NULL,
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "latency_ms" INTEGER,
    "is_section_regeneration" BOOLEAN NOT NULL DEFAULT false,
    "parent_generation_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ai_generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_token_usage" (
    "id" UUID NOT NULL,
    "ai_generation_id" UUID NOT NULL,
    "model" "AiModel" NOT NULL,
    "input_tokens" INTEGER NOT NULL,
    "output_tokens" INTEGER NOT NULL,
    "cache_read_tokens" INTEGER,
    "cache_write_tokens" INTEGER,
    "cost_eur" DECIMAL(10,4) NOT NULL,
    "billing_period" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_token_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_budget_config" (
    "id" UUID NOT NULL,
    "billing_period" TEXT,
    "monthly_budget_eur" DECIMAL(10,2) NOT NULL,
    "alert_threshold_pct" INTEGER NOT NULL,
    "model_by_page_type" JSONB,
    "notify_emails" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "updated_by_id" UUID,

    CONSTRAINT "ai_budget_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_revisions" (
    "id" UUID NOT NULL,
    "content_type" TEXT NOT NULL,
    "content_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "body_snapshot" JSONB NOT NULL,
    "seo_snapshot" JSONB,
    "workflow_status_at" "WorkflowStatus" NOT NULL,
    "editor_id" UUID NOT NULL,
    "change_summary" TEXT,
    "ai_generation_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prompt_templates_page_type_idx" ON "prompt_templates"("page_type");

-- CreateIndex
CREATE INDEX "prompt_templates_is_active_idx" ON "prompt_templates"("is_active");

-- CreateIndex
CREATE INDEX "ai_generations_prompt_template_id_idx" ON "ai_generations"("prompt_template_id");

-- CreateIndex
CREATE INDEX "ai_generations_requested_by_id_idx" ON "ai_generations"("requested_by_id");

-- CreateIndex
CREATE INDEX "ai_generations_model_idx" ON "ai_generations"("model");

-- CreateIndex
CREATE INDEX "ai_generations_status_idx" ON "ai_generations"("status");

-- CreateIndex
CREATE INDEX "ai_generations_created_at_idx" ON "ai_generations"("created_at");

-- CreateIndex
CREATE INDEX "ai_generations_target_content_type_target_content_id_idx" ON "ai_generations"("target_content_type", "target_content_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_token_usage_ai_generation_id_key" ON "ai_token_usage"("ai_generation_id");

-- CreateIndex
CREATE INDEX "ai_token_usage_billing_period_idx" ON "ai_token_usage"("billing_period");

-- CreateIndex
CREATE INDEX "ai_token_usage_model_idx" ON "ai_token_usage"("model");

-- CreateIndex
CREATE INDEX "ai_token_usage_created_at_idx" ON "ai_token_usage"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "ai_budget_config_billing_period_key" ON "ai_budget_config"("billing_period");

-- CreateIndex
CREATE INDEX "content_revisions_content_type_content_id_version_number_idx" ON "content_revisions"("content_type", "content_id", "version_number");

-- CreateIndex
CREATE INDEX "content_revisions_editor_id_idx" ON "content_revisions"("editor_id");

-- AddForeignKey
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_prompt_template_id_fkey" FOREIGN KEY ("prompt_template_id") REFERENCES "prompt_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_parent_generation_id_fkey" FOREIGN KEY ("parent_generation_id") REFERENCES "ai_generations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_token_usage" ADD CONSTRAINT "ai_token_usage_ai_generation_id_fkey" FOREIGN KEY ("ai_generation_id") REFERENCES "ai_generations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_ai_generation_id_fkey" FOREIGN KEY ("ai_generation_id") REFERENCES "ai_generations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
