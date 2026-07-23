-- GTK-19: índices avanzados (parciales, BRIN, GIN) no expresables en Prisma DSL.
-- Producción con datos: considerar CREATE INDEX CONCURRENTLY fuera de transacción Prisma.

-- Parciales de publicación ISR (RF-22)
CREATE INDEX "idx_services_published" ON "services"("slug")
  WHERE "workflow_status" = 'publicado' AND "deleted_at" IS NULL;

CREATE INDEX "idx_geo_zones_published" ON "geo_zones"("slug")
  WHERE "workflow_status" = 'publicado' AND "deleted_at" IS NULL;

CREATE INDEX "idx_service_zone_pages_published" ON "service_zone_pages"("slug")
  WHERE "workflow_status" = 'publicado' AND "deleted_at" IS NULL;

CREATE INDEX "idx_case_studies_published" ON "case_studies"("slug")
  WHERE "workflow_status" = 'publicado' AND "deleted_at" IS NULL;

-- Parciales soft delete CRM (RGPD)
CREATE INDEX "idx_leads_active" ON "leads"("created_at")
  WHERE "deleted_at" IS NULL;

CREATE INDEX "idx_projects_active" ON "projects"("created_at")
  WHERE "deleted_at" IS NULL;

CREATE INDEX "idx_contacts_active" ON "contacts"("created_at")
  WHERE "deleted_at" IS NULL;

-- BRIN temporal en tablas append-only de alto crecimiento
CREATE INDEX "idx_conversion_events_occurred_brin" ON "conversion_events"
  USING BRIN ("occurred_at");

CREATE INDEX "idx_audit_logs_created_brin" ON "audit_logs"
  USING BRIN ("created_at");

CREATE INDEX "idx_ai_token_usage_created_brin" ON "ai_token_usage"
  USING BRIN ("created_at");

CREATE INDEX "idx_project_state_history_created_brin" ON "project_state_history"
  USING BRIN ("created_at");

-- GIN sobre jsonb para reporting por claves en project_data
CREATE INDEX "idx_leads_project_data_gin" ON "leads"
  USING GIN ("project_data" jsonb_path_ops);
