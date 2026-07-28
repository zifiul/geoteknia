/**
 * Seed mínimo de filas audit_logs para E2E GTK-80.
 * Imprime JSON con ids en stdout (última línea).
 */
import { AuditAction } from '@prisma/client';

import { db } from '@/lib/db';

const PROJECT_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

async function main() {
  const projectEvent = await db.auditLog.create({
    data: {
      action: AuditAction.state_change,
      entityType: 'projects',
      entityId: PROJECT_ID,
      ipAddress: '203.0.113.50',
      userAgent: 'gtk80-e2e',
      metadata: { event: 'e2e_seed' },
    },
  });

  const contentEvent = await db.auditLog.create({
    data: {
      action: AuditAction.content_update,
      entityType: 'service',
      entityId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      ipAddress: '203.0.113.51',
      metadata: { contentType: 'service' },
    },
  });

  const loginFailed = await db.auditLog.create({
    data: {
      action: AuditAction.login_failed,
      ipAddress: '203.0.113.52',
      metadata: { method: 'credentials', attemptReason: 'e2e' },
    },
  });

  console.log(
    JSON.stringify({
      projectEventId: projectEvent.id,
      contentEventId: contentEvent.id,
      loginFailedId: loginFailed.id,
      projectId: PROJECT_ID,
    }),
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
