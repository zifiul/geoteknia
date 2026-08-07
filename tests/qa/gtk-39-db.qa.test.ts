/**
 * QA GTK-39 — transición editorial + audit_logs (db-state-verify).
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  AuditAction,
  PrismaClient,
  SchemaType,
  WorkflowStatus,
} from '@prisma/client';

import { loadTestEnv } from '../helpers/test-env';

const db = new PrismaClient();

describe('QA GTK-39 — flujo editorial en servicio', () => {
  let serviceId: string | null = null;
  let userId: string | null = null;

  beforeAll(async () => {
    loadTestEnv();

    const user = await db.user.create({
      data: {
        email: `gtk39-qa-${Date.now()}@example.com`,
        fullName: 'GTK39 QA',
        passwordHash: 'hash',
        role: { connect: { name: 'editor' } },
      },
    });
    userId = user.id;

    const service = await db.service.create({
      data: {
        name: 'QA GTK-39',
        body: 'Cuerpo inicial',
        slug: `gtk39-qa-${Date.now()}`,
        schemaType: SchemaType.Service,
        workflowStatus: WorkflowStatus.borrador_ia,
        createdById: user.id,
        updatedById: user.id,
        authorId: user.id,
      },
    });
    serviceId = service.id;
  });

  afterAll(async () => {
    if (serviceId) {
      await db.contentRevision.deleteMany({ where: { contentId: serviceId } });
      await db.auditLog.deleteMany({ where: { entityId: serviceId } });
      await db.service.delete({ where: { id: serviceId } }).catch(() => undefined);
    }
    if (userId) {
      await db.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
    await db.$disconnect();
  });

  it('submit → approve sin content_revisions; audit approve', async () => {
    if (!serviceId || !userId) {
      return;
    }

    const { applyEditorialTransition } = await import('@/lib/content/workflow');

    const editor = {
      userId,
      roleId: '00000000-0000-4000-8000-000000000001',
      roleName: 'editor' as const,
    };

    await applyEditorialTransition(editor, {
      contentType: 'service',
      contentId: serviceId,
      targetStatus: WorkflowStatus.en_revision,
    });

    const revisionsAfterSubmit = await db.contentRevision.count({
      where: { contentId: serviceId },
    });
    expect(revisionsAfterSubmit).toBe(0);

    await applyEditorialTransition(editor, {
      contentType: 'service',
      contentId: serviceId,
      targetStatus: WorkflowStatus.aprobado,
    });

    const updated = await db.service.findUniqueOrThrow({
      where: { id: serviceId },
    });
    expect(updated.workflowStatus).toBe(WorkflowStatus.aprobado);
    expect(updated.approvedById).toBe(userId);
    expect(updated.publishedAt).toBeNull();

    const approveLog = await db.auditLog.findFirst({
      where: {
        entityId: serviceId,
        action: AuditAction.approve,
      },
    });
    expect(approveLog).not.toBeNull();
  });
});
