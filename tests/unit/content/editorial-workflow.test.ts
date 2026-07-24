/**
 * GTK-39 — grafo editorial, transiciones y SEC-1–SEC-6.
 */
import { AuditAction, WorkflowStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const {
  recordAudit,
  transaction,
  serviceFindFirst,
  serviceUpdate,
  contentRevisionCreate,
} = vi.hoisted(() => ({
  recordAudit: vi.fn(),
  transaction: vi.fn(),
  serviceFindFirst: vi.fn(),
  serviceUpdate: vi.fn(),
  contentRevisionCreate: vi.fn(),
}));

vi.mock('@/lib/audit/log', () => ({
  recordAudit,
}));

vi.mock('@/lib/db', () => ({
  db: {
    $transaction: transaction,
    service: { findFirst: serviceFindFirst },
  },
}));

import { ContentConflictError } from '@/lib/content/errors';
import {
  assertTransition,
  applyEditorialTransition,
  EDITORIAL_TRANSITIONS,
  permissionForTransition,
} from '@/lib/content/workflow';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const SERVICE_ID = '22222222-2222-4222-8222-222222222222';

function editorUser() {
  return {
    userId: USER_ID,
    roleId: '33333333-3333-4333-8333-333333333333',
    roleName: 'editor' as const,
  };
}

function makeTx() {
  return {
    service: {
      findFirst: serviceFindFirst,
      update: serviceUpdate,
    },
    contentRevision: { create: contentRevisionCreate },
  };
}

const baseServiceRow = {
  id: SERVICE_ID,
  slug: 'sondeos-mecanicos',
  workflowStatus: WorkflowStatus.borrador_ia,
  currentVersion: 1,
  reviewedById: null,
  approvedById: null,
  approvedAt: null,
  publishedAt: null,
  name: 'Sondeos',
  summary: null,
  body: 'Cuerpo',
  methodology: null,
  applicableNorms: null,
  deliverables: null,
  metaTitle: 'Meta',
  metaDescription: 'Desc',
  canonicalUrl: null,
  schemaType: 'Service',
  noindex: false,
  ogImageId: null,
  h1: null,
};

describe('assertTransition (GTK-39)', () => {
  it('acepta borrador_ia → en_revision', () => {
    expect(() =>
      assertTransition(
        WorkflowStatus.borrador_ia,
        WorkflowStatus.en_revision,
      ),
    ).not.toThrow();
  });

  it('rechaza borrador_ia → publicado con ContentConflictError (SEC-2)', () => {
    expect(() =>
      assertTransition(WorkflowStatus.borrador_ia, WorkflowStatus.publicado),
    ).toThrow(ContentConflictError);
  });

  it('grafo tiene despublicado sin salidas', () => {
    expect(EDITORIAL_TRANSITIONS[WorkflowStatus.despublicado]).toEqual([]);
  });
});

describe('permissionForTransition', () => {
  it('publicar exige content.publish', () => {
    expect(
      permissionForTransition(
        WorkflowStatus.aprobado,
        WorkflowStatus.publicado,
      ),
    ).toBe('content.publish');
  });

  it('aprobar usa content.update', () => {
    expect(
      permissionForTransition(
        WorkflowStatus.en_revision,
        WorkflowStatus.aprobado,
      ),
    ).toBe('content.update');
  });
});

describe('applyEditorialTransition (GTK-39)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recordAudit.mockResolvedValue({ id: 'audit-1' });
    transaction.mockImplementation(
      async (fn: (tx: ReturnType<typeof makeTx>) => Promise<void>) =>
        fn(makeTx()),
    );
    serviceFindFirst.mockResolvedValue({ ...baseServiceRow });
    serviceUpdate.mockResolvedValue({});
    contentRevisionCreate.mockResolvedValue({ id: 'rev-1' });
  });

  it('submit fija reviewed_by vía update y audit content_update', async () => {
    const result = await applyEditorialTransition(editorUser(), {
      contentType: 'service',
      contentId: SERVICE_ID,
      targetStatus: WorkflowStatus.en_revision,
    });

    expect(result.workflowStatus).toBe(WorkflowStatus.en_revision);
    expect(result.requiresTechnicalVerification).toBe(true);
    expect(serviceUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: SERVICE_ID },
        data: expect.objectContaining({
          workflowStatus: WorkflowStatus.en_revision,
          reviewedById: USER_ID,
        }),
      }),
    );
    expect(recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.content_update,
        metadata: expect.objectContaining({
          previousStatus: WorkflowStatus.borrador_ia,
          workflowStatus: WorkflowStatus.en_revision,
        }),
      }),
      expect.objectContaining({ tx: expect.anything() }),
    );
    expect(contentRevisionCreate).not.toHaveBeenCalled();
  });

  it('aprobar no crea content_revisions (SEC-5)', async () => {
    serviceFindFirst.mockResolvedValue({
      ...baseServiceRow,
      workflowStatus: WorkflowStatus.en_revision,
    });

    await applyEditorialTransition(editorUser(), {
      contentType: 'service',
      contentId: SERVICE_ID,
      targetStatus: WorkflowStatus.aprobado,
    });

    expect(recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: AuditAction.approve }),
      expect.anything(),
    );
    expect(contentRevisionCreate).not.toHaveBeenCalled();
  });

  it('regenerar con body crea revisión e incrementa versión', async () => {
    serviceFindFirst.mockResolvedValue({
      ...baseServiceRow,
      workflowStatus: WorkflowStatus.rechazado,
    });

    await applyEditorialTransition(editorUser(), {
      contentType: 'service',
      contentId: SERVICE_ID,
      targetStatus: WorkflowStatus.borrador_ia,
      bodyChanged: true,
      body: 'Nuevo cuerpo',
      aiGenerationId: '44444444-4444-4444-8444-444444444444',
    });

    expect(contentRevisionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          versionNumber: 2,
          aiGenerationId: '44444444-4444-4444-8444-444444444444',
        }),
      }),
    );
  });
});

describe('editorialContentTypeSchema (SEC-5)', () => {
  it('rechaza content_type desconocido', async () => {
    const { editorialContentTypeSchema } = await import(
      '@/lib/content/schemas/workflow'
    );
    const result = editorialContentTypeSchema.safeParse('not_a_type');
    expect(result.success).toBe(false);
  });
});
