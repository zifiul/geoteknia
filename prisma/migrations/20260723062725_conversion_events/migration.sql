-- CreateEnum
CREATE TYPE "ConversionEventName" AS ENUM ('generate_lead', 'click_tel', 'click_whatsapp', 'click_email', 'send_location', 'calculator_use', 'resource_download', 'scroll_depth');

-- CreateTable
CREATE TABLE "conversion_events" (
    "id" UUID NOT NULL,
    "event_name" "ConversionEventName" NOT NULL,
    "lead_id" UUID,
    "service_slug" TEXT,
    "province_slug" TEXT,
    "lead_type" "LeadType",
    "source" "LeadSource",
    "page_url" TEXT,
    "session_id" TEXT,
    "ga_client_id" TEXT,
    "form_step" INTEGER,
    "value" DECIMAL(12,2),
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversion_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conversion_events_event_name_idx" ON "conversion_events"("event_name");

-- CreateIndex
CREATE INDEX "conversion_events_occurred_at_idx" ON "conversion_events"("occurred_at");

-- CreateIndex
CREATE INDEX "conversion_events_lead_id_idx" ON "conversion_events"("lead_id");

-- CreateIndex
CREATE INDEX "conversion_events_service_slug_province_slug_idx" ON "conversion_events"("service_slug", "province_slug");

-- AddForeignKey
ALTER TABLE "conversion_events" ADD CONSTRAINT "conversion_events_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
