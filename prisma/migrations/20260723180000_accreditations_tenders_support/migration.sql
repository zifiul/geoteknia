-- CreateEnum
CREATE TYPE "CredentialType" AS ENUM ('enac', 'iso', 'registro_ministerio', 'clasificacion_contratista', 'seguro_rc', 'asociacion');

-- CreateEnum
CREATE TYPE "OrganismType" AS ENUM ('ministerio', 'confederacion', 'puerto', 'ayuntamiento', 'otro');

-- CreateTable
CREATE TABLE "accreditations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "credential_type" "CredentialType" NOT NULL,
    "issuer" TEXT,
    "registration_number" TEXT,
    "logo_id" UUID,
    "verification_url" TEXT,
    "document_id" UUID,
    "valid_until" DATE,
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

    CONSTRAINT "accreditations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractor_classifications" (
    "id" UUID NOT NULL,
    "group_code" TEXT NOT NULL,
    "subgroup_code" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "updated_by_id" UUID,

    CONSTRAINT "contractor_classifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_organism_experience" (
    "id" UUID NOT NULL,
    "organism_name" TEXT NOT NULL,
    "organism_type" "OrganismType",
    "description" TEXT,
    "related_case_id" UUID,
    "was_ute" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "updated_by_id" UUID,

    CONSTRAINT "public_organism_experience_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "accreditations_credential_type_idx" ON "accreditations"("credential_type");

-- CreateIndex
CREATE INDEX "contractor_classifications_group_code_subgroup_code_idx" ON "contractor_classifications"("group_code", "subgroup_code");

-- CreateIndex
CREATE INDEX "public_organism_experience_organism_type_idx" ON "public_organism_experience"("organism_type");

-- AddForeignKey
ALTER TABLE "public_organism_experience" ADD CONSTRAINT "public_organism_experience_related_case_id_fkey" FOREIGN KEY ("related_case_id") REFERENCES "case_studies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
