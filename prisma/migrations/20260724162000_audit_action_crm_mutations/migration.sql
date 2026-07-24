-- GTK-35: acciones de auditoría para mutaciones CRM
ALTER TYPE "AuditAction" ADD VALUE 'state_change';
ALTER TYPE "AuditAction" ADD VALUE 'assign';
