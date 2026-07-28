/**
 * GTK-75 — programación de publicación (SEC-1–SEC-3).
 */
import { WorkflowStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { recordAudit, serviceFindFirst, serviceUpdate, loadEditorialEntity } =
  vi.hoisted(() => ({
    recordAudit: vi.fn(),
    serviceFindFirst: vi.fn(),
    serviceUpdate: vi.fn(),
    loadEditorialEntity: vi.fn(),
  }));

vi.mock('@/lib/audit/log', () => ({ recordAudit }));
vi.mock('@/lib/audit/sanitize', () => ({
  sanitizeAuditMetadata: (_action: unknown, m: Record<string, unknown>) => m,
}));
vi.mock('@/lib/content/workflow-registry', () => ({
  loadEditorialEntity,
}));

vi.mock('@/lib/db', () => ({
  db: {
    service: { update: serviceUpdate },
  },
}));

import { ContentConflictError } from '@/lib/content/errors';
import {
  cancelScheduledPublication,
  scheduleContentPublication,
} from '@/lib/content/schedule';
import { schedulePublishAtSchema } from '@/lib/content/schemas/workflow';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const SERVICE_ID = '22222222-2222-4222-8222-222222222222';

function publisher() {
  return {
    userId: USER_ID,
    roleId: '33333333-3333-4333-8333-333333333333',
    roleName: 'gestor' as const,
  };
}

const approvedRow = {
  slug: 'sondeos',
  workflowStatus: WorkflowStatus.aprobado,
};

describe('scheduleContentPublication (GTK-75)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadEditorialEntity.mockResolvedValue({
      entry: { entityType: 'service' },
      row: approvedRow,
    });
    serviceUpdate.mockResolvedValue({});
  });

  it('SEC-2: rechaza si no está aprobado', async () => {
    loadEditorialEntity.mockResolvedValue({
      entry: { entityType: 'service' },
      row: { ...approvedRow, workflowStatus: WorkflowStatus.en_revision },
    });

    await expect(
      scheduleContentPublication(publisher(), {
        contentType: 'service',
        contentId: SERVICE_ID,
        scheduledPublishAt: new Date(Date.now() + 86_400_000),
      }),
    ).rejects.toThrow(ContentConflictError);
  });

  it('programa fecha futura y audita event schedule_publish', async () => {
    const at = new Date(Date.now() + 86_400_000);
    const result = await scheduleContentPublication(publisher(), {
      contentType: 'service',
      contentId: SERVICE_ID,
      scheduledPublishAt: at,
    });

    expect(result.scheduledPublishAt).toEqual(at);
    expect(serviceUpdate).toHaveBeenCalled();
    expect(recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ event: 'schedule_publish' }),
      }),
    );
  });

  it('SEC-3: schema Zod rechaza fecha pasada', () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    expect(() => schedulePublishAtSchema.parse(past)).toThrow();
  });
});

describe('cancelScheduledPublication (GTK-75)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadEditorialEntity.mockResolvedValue({
      entry: { entityType: 'service' },
      row: approvedRow,
    });
    serviceUpdate.mockResolvedValue({});
  });

  it('limpia scheduledPublishAt y audita cancel', async () => {
    await cancelScheduledPublication(publisher(), {
      contentType: 'service',
      contentId: SERVICE_ID,
    });

    expect(serviceUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ scheduledPublishAt: null }),
      }),
    );
    expect(recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ event: 'cancel_schedule_publish' }),
      }),
    );
  });
});
