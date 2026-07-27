-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'access_denied';

-- DropIndex
DROP INDEX "idx_ai_token_usage_created_brin";

-- DropIndex
DROP INDEX "idx_audit_logs_created_brin";

-- DropIndex
DROP INDEX "idx_conversion_events_occurred_brin";

-- DropIndex
DROP INDEX "idx_leads_project_data_gin";

-- DropIndex
DROP INDEX "idx_project_state_history_created_brin";
