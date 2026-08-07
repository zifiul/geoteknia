/**
 * QA GTK-40 — publicación + published_at + audit publish (db-state-verify).
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import {
  AuditAction,
  PrismaClient,
  SchemaType,
  WorkflowStatus,
} from '@prisma/client';

import { loadTestEnv } from '../helpers/test-env';

const db = new PrismaClient();

describe('QA GTK-40 — publicar servicio aprobado', () => {
  let serviceId: string | null = null;
  let userId: string | null = null;
  let baselineRevisions = 0;
  let baselineAudit = 0;

  beforeAll(async () => {
    loadTestEnv();

    const user = await db.user.create({
      data: {
        email: `gtk40-qa-${Date.now()}@example.com`,
        fullName: 'GTK40 QA',
        passwordHash: 'hash',
        role: { connect: { name: 'gestor' } },
      },
    });
    userId = user.id;

    const service = await db.service.create({
      data: {
        name: 'QA GTK-40',
        body: 'Cuerpo',
        slug: `gtk40-qa-${Date.now()}`,
        schemaType: SchemaType.Service,
        workflowStatus: WorkflowStatus.aprobado,
        approvedById: user.id,
        approvedAt: new Date(),
        createdById: user.id,
        updatedById: user.id,
        authorId: user.id,
      },
    });
    serviceId = service.id;

    baselineRevisions = await db.contentRevision.count({
      where: { contentId: serviceId },
    });
    baselineAudit = await db.auditLog.count({
      where: { entityId: serviceId },
    });
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

  it('publishContent fija published_at, revisión y audit publish', async () => {
    if (!serviceId || !userId) {
      return;
    }

    const { publishContent } = await import('@/lib/content/publish');

    await publishContent(
      {
        userId,
        roleId: '00000000-0000-4000-8000-000000000001',
        roleName: 'gestor',
      },
      { contentType: 'service', contentId: serviceId },
    );

    const updated = await db.service.findUniqueOrThrow({
      where: { id: serviceId },
    });
    expect(updated.workflowStatus).toBe(WorkflowStatus.publicado);
    expect(updated.publishedAt).not.toBeNull();

    const revisions = await db.contentRevision.count({
      where: { contentId: serviceId },
    });
    expect(revisions).toBe(baselineRevisions + 1);

    const publishLog = await db.auditLog.findFirst({
      where: { entityId: serviceId, action: AuditAction.publish },
    });
    expect(publishLog).not.toBeNull();

    const auditAfter = await db.auditLog.count({
      where: { entityId: serviceId },
    });
    expect(auditAfter).toBeGreaterThanOrEqual(baselineAudit + 1);
  });
});
