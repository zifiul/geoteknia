-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('sonda_rotacion', 'sonda_percusion', 'mixta', 'ensayo_in_situ', 'laboratorio', 'vehiculo_especial');

-- CreateTable
CREATE TABLE "case_studies" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "service_id" UUID NOT NULL,
    "province_id" UUID NOT NULL,
    "work_typology_id" UUID NOT NULL,
    "client_name" TEXT,
    "client_is_public" BOOLEAN NOT NULL DEFAULT false,
    "problem" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "boreholes_count" INTEGER,
    "meters_drilled" DECIMAL(10,2),
    "tests_summary" TEXT,
    "result" TEXT,
    "project_year" INTEGER,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "source_project_id" UUID,
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

    CONSTRAINT "case_studies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "qualification" TEXT,
    "college_registration_no" TEXT,
    "years_experience" INTEGER,
    "specialization" TEXT,
    "bio" TEXT,
    "publications" TEXT,
    "works_for" TEXT,
    "alumni_of" TEXT,
    "photo_id" UUID,
    "user_id" UUID,
    "slug" TEXT NOT NULL,
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

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machinery" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "equipment_type" "EquipmentType" NOT NULL,
    "model" TEXT,
    "max_depth_m" DECIMAL(6,2),
    "diameters" TEXT,
    "in_situ_tests" JSONB,
    "has_enac_lab" BOOLEAN,
    "photo_id" UUID,
    "slug" TEXT NOT NULL,
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

    CONSTRAINT "machinery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_study_team_members" (
    "case_study_id" UUID NOT NULL,
    "team_member_id" UUID NOT NULL,
    "role" TEXT,

    CONSTRAINT "case_study_team_members_pkey" PRIMARY KEY ("case_study_id","team_member_id")
);

-- CreateTable
CREATE TABLE "machinery_services" (
    "machinery_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,

    CONSTRAINT "machinery_services_pkey" PRIMARY KEY ("machinery_id","service_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "case_studies_slug_key" ON "case_studies"("slug");

-- CreateIndex
CREATE INDEX "case_studies_service_id_idx" ON "case_studies"("service_id");

-- CreateIndex
CREATE INDEX "case_studies_province_id_idx" ON "case_studies"("province_id");

-- CreateIndex
CREATE INDEX "case_studies_work_typology_id_idx" ON "case_studies"("work_typology_id");

-- CreateIndex
CREATE INDEX "case_studies_project_year_idx" ON "case_studies"("project_year");

-- CreateIndex
CREATE INDEX "case_studies_workflow_status_idx" ON "case_studies"("workflow_status");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_user_id_key" ON "team_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_slug_key" ON "team_members"("slug");

-- CreateIndex
CREATE INDEX "team_members_college_registration_no_idx" ON "team_members"("college_registration_no");

-- CreateIndex
CREATE UNIQUE INDEX "machinery_slug_key" ON "machinery"("slug");

-- CreateIndex
CREATE INDEX "machinery_equipment_type_idx" ON "machinery"("equipment_type");

-- AddForeignKey
ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_work_typology_id_fkey" FOREIGN KEY ("work_typology_id") REFERENCES "work_typologies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_study_team_members" ADD CONSTRAINT "case_study_team_members_case_study_id_fkey" FOREIGN KEY ("case_study_id") REFERENCES "case_studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_study_team_members" ADD CONSTRAINT "case_study_team_members_team_member_id_fkey" FOREIGN KEY ("team_member_id") REFERENCES "team_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machinery_services" ADD CONSTRAINT "machinery_services_machinery_id_fkey" FOREIGN KEY ("machinery_id") REFERENCES "machinery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machinery_services" ADD CONSTRAINT "machinery_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
