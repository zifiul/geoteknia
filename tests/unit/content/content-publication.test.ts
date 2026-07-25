/**
 * GTK-40 — publicación ISR, revalidación y cron.
 */
import { AuditAction, SchemaType, WorkflowStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const {
  recordAudit,
  transaction,
  serviceFindFirst,
  serviceUpdate,
  contentRevisionCreate,
  revalidatePath,
  revalidateTag,
} = vi.hoisted(() => ({
  recordAudit: vi.fn(),
  transaction: vi.fn(),
  serviceFindFirst: vi.fn(),
  serviceUpdate: vi.fn(),
  contentRevisionCreate: vi.fn(),
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock('@/lib/audit/log', () => ({ recordAudit }));
vi.mock('@/lib/db', () => ({
  db: {
    $transaction: transaction,
    service: { findFirst: serviceFindFirst },
    serviceZonePage: { findFirst: vi.fn() },
    blogPost: { findFirst: vi.fn() },
    faq: { findFirst: vi.fn() },
  },
}));
vi.mock('next/cache', () => ({
  revalidatePath,
  revalidateTag,
}));

import { ContentConflictError } from '@/lib/content/errors';
import { publishContent } from '@/lib/content/publish';
import { assertSchemaTypeCoherent } from '@/lib/content/schema-type-coherence';
import { sanitizeAuditMetadata } from '@/lib/audit/sanitize';
import { verifyBearerSecret } from '@/lib/cron/verify-secret';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const SERVICE_ID = '22222222-2222-4222-8222-222222222222';

function publisher() {
  return {
    userId: USER_ID,
    roleId: '33333333-3333-4333-8333-333333333333',
    roleName: 'gestor' as const,
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
  workflowStatus: WorkflowStatus.aprobado,
  currentVersion: 1,
  reviewedById: USER_ID,
  approvedById: USER_ID,
  approvedAt: new Date(),
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
  schemaType: SchemaType.Service,
  noindex: false,
  ogImageId: null,
  h1: null,
};

describe('assertSchemaTypeCoherent (GTK-40)', () => {
  it('rechaza schema incoherente', () => {
    expect(() =>
      assertSchemaTypeCoherent('blog_post', SchemaType.Service),
    ).toThrow();
  });
});

describe('publishContent (GTK-40)', () => {
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

  it('publica aprobado con published_at y revisión forzada', async () => {
    const result = await publishContent(publisher(), {
      contentType: 'service',
      contentId: SERVICE_ID,
    });

    expect(result.workflowStatus).toBe(WorkflowStatus.publicado);
    expect(serviceUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          workflowStatus: WorkflowStatus.publicado,
          publishedAt: expect.any(Date),
        }),
      }),
    );
    expect(contentRevisionCreate).toHaveBeenCalled();
    expect(recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: AuditAction.publish }),
      expect.anything(),
    );
    expect(revalidatePath).toHaveBeenCalledWith('/servicios/sondeos-mecanicos');
    expect(revalidateTag).toHaveBeenCalledWith('sitemap');
  });

  it('SEC-6: no aprobado → 409 sin revalidar', async () => {
    serviceFindFirst.mockResolvedValue({
      ...baseServiceRow,
      workflowStatus: WorkflowStatus.borrador_ia,
    });

    await expect(
      publishContent(publisher(), {
        contentType: 'service',
        contentId: SERVICE_ID,
      }),
    ).rejects.toBeInstanceOf(ContentConflictError);

    expect(revalidatePath).not.toHaveBeenCalled();
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});

describe('sanitize content_update unpublish (GTK-40 / SEC-5)', () => {
  it('persiste event y estados', () => {
    const result = sanitizeAuditMetadata(AuditAction.content_update, {
      entitySlug: 'x',
      contentType: 'service',
      previousStatus: 'publicado',
      workflowStatus: 'despublicado',
      event: 'unpublish',
    });
    expect(result).toMatchObject({
      event: 'unpublish',
      previousStatus: 'publicado',
      workflowStatus: 'despublicado',
    });
  });
});

describe('verifyBearerSecret (SEC-2, SEC-3)', () => {
  const secret = 'a'.repeat(32);

  it('rechaza sin Bearer', () => {
    expect(verifyBearerSecret(null, secret)).toBe(false);
  });

  it('acepta secreto válido', () => {
    expect(verifyBearerSecret(`Bearer ${secret}`, secret)).toBe(true);
  });
});
