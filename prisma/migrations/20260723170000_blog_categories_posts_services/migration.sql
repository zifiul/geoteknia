-- CreateTable
CREATE TABLE "blog_categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "meta_title" VARCHAR(60),
    "meta_description" VARCHAR(155),
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "updated_by_id" UUID,

    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "category_id" UUID NOT NULL,
    "team_author_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "toc" JSONB,
    "reading_minutes" INTEGER,
    "excerpt" TEXT,
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

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_post_services" (
    "blog_post_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,

    CONSTRAINT "blog_post_services_pkey" PRIMARY KEY ("blog_post_id","service_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_slug_key" ON "blog_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_category_id_idx" ON "blog_posts"("category_id");

-- CreateIndex
CREATE INDEX "blog_posts_team_author_id_idx" ON "blog_posts"("team_author_id");

-- CreateIndex
CREATE INDEX "blog_posts_published_at_idx" ON "blog_posts"("published_at");

-- CreateIndex
CREATE INDEX "blog_posts_workflow_status_idx" ON "blog_posts"("workflow_status");

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "blog_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_team_author_id_fkey" FOREIGN KEY ("team_author_id") REFERENCES "team_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_services" ADD CONSTRAINT "blog_post_services_blog_post_id_fkey" FOREIGN KEY ("blog_post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_services" ADD CONSTRAINT "blog_post_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
