-- CreateEnum
CREATE TYPE "ContactDepartment" AS ENUM ('presupuestos', 'direccion_tecnica', 'licitaciones');

-- CreateTable
CREATE TABLE "organization_profile" (
    "id" UUID NOT NULL,
    "legal_name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "nap_address" TEXT NOT NULL,
    "nap_phone" TEXT NOT NULL,
    "nap_email" TEXT NOT NULL,
    "gbp_place_id" TEXT,
    "area_served" JSONB NOT NULL,
    "aggregate_rating" DECIMAL(3,2),
    "social_profiles" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "updated_by_id" UUID,

    CONSTRAINT "organization_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_channels" (
    "id" UUID NOT NULL,
    "department" "ContactDepartment" NOT NULL,
    "phone" TEXT,
    "whatsapp_number" TEXT,
    "email" TEXT,
    "prefilled_message_template" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "updated_by_id" UUID,

    CONSTRAINT "contact_channels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_channels_department_idx" ON "contact_channels"("department");
