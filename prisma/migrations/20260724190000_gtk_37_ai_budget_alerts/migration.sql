-- GTK-37: alerta durable por periodo + auditoría de config IA
ALTER TYPE "AuditAction" ADD VALUE 'ai_config_update';

CREATE TABLE "ai_budget_alerts" (
    "billing_period" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_budget_alerts_pkey" PRIMARY KEY ("billing_period")
);
