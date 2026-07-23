-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('presupuesto', 'licitacion', 'recurso', 'ubicacion');

-- CreateEnum
CREATE TYPE "LeadChannel" AS ENUM ('formulario', 'whatsapp', 'tel', 'ubicacion', 'lead_magnet');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('organico', 'sem', 'directo', 'referral');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('pendiente', 'cumplido', 'retrasado');

-- CreateEnum
CREATE TYPE "ProjectDocType" AS ENUM ('presupuesto', 'informe', 'contrato', 'otro');

-- CreateTable
CREATE TABLE "contacts" (
    "id" UUID NOT NULL,
    "full_name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "professional_role" TEXT,
    "province_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "updated_by_id" UUID,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "contact_id" UUID,
    "reference_number" TEXT NOT NULL,
    "lead_type" "LeadType" NOT NULL,
    "channel" "LeadChannel" NOT NULL,
    "source" "LeadSource" NOT NULL,
    "service_id" UUID,
    "province_id" UUID,
    "work_typology_id" UUID,
    "project_data" JSONB,
    "cadastral_ref" TEXT,
    "map_lat" DECIMAL(9,6),
    "map_lng" DECIMAL(9,6),
    "expediente_ref" TEXT,
    "estimated_value" DECIMAL(12,2),
    "lead_magnet_id" UUID,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "ga_client_id" TEXT,
    "gdpr_consent" BOOLEAN NOT NULL,
    "landing_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "updated_by_id" UUID,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_states" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "is_initial" BOOLEAN NOT NULL,
    "is_won" BOOLEAN NOT NULL,
    "is_lost" BOOLEAN NOT NULL,
    "is_terminal" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "updated_by_id" UUID,

    CONSTRAINT "project_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "contact_id" UUID,
    "title" TEXT NOT NULL,
    "state_id" UUID NOT NULL,
    "assigned_technician_id" UUID,
    "service_id" UUID,
    "province_id" UUID,
    "work_typology_id" UUID,
    "estimated_value" DECIMAL(12,2),
    "first_response_at" TIMESTAMP(3),
    "is_qualified" BOOLEAN NOT NULL DEFAULT false,
    "expediente_ref" TEXT,
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "updated_by_id" UUID,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_state_history" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "from_state_id" UUID,
    "to_state_id" UUID NOT NULL,
    "changed_by_id" UUID NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_state_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_milestones" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "due_date" DATE,
    "completed_at" TIMESTAMP(3),
    "status" "MilestoneStatus",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "updated_by_id" UUID,

    CONSTRAINT "project_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_notes" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "updated_by_id" UUID,

    CONSTRAINT "project_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_documents" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "media_asset_id" UUID,
    "file_url" TEXT,
    "doc_type" "ProjectDocType" NOT NULL,
    "uploaded_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "updated_by_id" UUID,

    CONSTRAINT "project_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contacts_email_idx" ON "contacts"("email");

-- CreateIndex
CREATE INDEX "contacts_phone_idx" ON "contacts"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "leads_reference_number_key" ON "leads"("reference_number");

-- CreateIndex
CREATE INDEX "leads_lead_type_idx" ON "leads"("lead_type");

-- CreateIndex
CREATE INDEX "leads_channel_idx" ON "leads"("channel");

-- CreateIndex
CREATE INDEX "leads_source_idx" ON "leads"("source");

-- CreateIndex
CREATE INDEX "leads_service_id_idx" ON "leads"("service_id");

-- CreateIndex
CREATE INDEX "leads_province_id_idx" ON "leads"("province_id");

-- CreateIndex
CREATE INDEX "leads_created_at_idx" ON "leads"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "project_states_slug_key" ON "project_states"("slug");

-- CreateIndex
CREATE INDEX "project_states_order_idx" ON "project_states"("order");

-- CreateIndex
CREATE UNIQUE INDEX "projects_lead_id_key" ON "projects"("lead_id");

-- CreateIndex
CREATE INDEX "projects_state_id_idx" ON "projects"("state_id");

-- CreateIndex
CREATE INDEX "projects_assigned_technician_id_idx" ON "projects"("assigned_technician_id");

-- CreateIndex
CREATE INDEX "projects_service_id_idx" ON "projects"("service_id");

-- CreateIndex
CREATE INDEX "projects_province_id_idx" ON "projects"("province_id");

-- CreateIndex
CREATE INDEX "projects_created_at_idx" ON "projects"("created_at");

-- CreateIndex
CREATE INDEX "projects_is_qualified_idx" ON "projects"("is_qualified");

-- CreateIndex
CREATE INDEX "project_state_history_project_id_idx" ON "project_state_history"("project_id");

-- CreateIndex
CREATE INDEX "project_state_history_to_state_id_idx" ON "project_state_history"("to_state_id");

-- CreateIndex
CREATE INDEX "project_state_history_created_at_idx" ON "project_state_history"("created_at");

-- CreateIndex
CREATE INDEX "project_milestones_project_id_idx" ON "project_milestones"("project_id");

-- CreateIndex
CREATE INDEX "project_milestones_due_date_idx" ON "project_milestones"("due_date");

-- CreateIndex
CREATE INDEX "project_notes_project_id_idx" ON "project_notes"("project_id");

-- CreateIndex
CREATE INDEX "project_notes_created_at_idx" ON "project_notes"("created_at");

-- CreateIndex
CREATE INDEX "project_documents_project_id_idx" ON "project_documents"("project_id");

-- CreateIndex
CREATE INDEX "project_documents_doc_type_idx" ON "project_documents"("doc_type");

-- AddForeignKey
ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_source_project_id_fkey" FOREIGN KEY ("source_project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_work_typology_id_fkey" FOREIGN KEY ("work_typology_id") REFERENCES "work_typologies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_lead_magnet_id_fkey" FOREIGN KEY ("lead_magnet_id") REFERENCES "lead_magnets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "project_states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_assigned_technician_id_fkey" FOREIGN KEY ("assigned_technician_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_work_typology_id_fkey" FOREIGN KEY ("work_typology_id") REFERENCES "work_typologies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_state_history" ADD CONSTRAINT "project_state_history_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_state_history" ADD CONSTRAINT "project_state_history_from_state_id_fkey" FOREIGN KEY ("from_state_id") REFERENCES "project_states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_state_history" ADD CONSTRAINT "project_state_history_to_state_id_fkey" FOREIGN KEY ("to_state_id") REFERENCES "project_states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_notes" ADD CONSTRAINT "project_notes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
