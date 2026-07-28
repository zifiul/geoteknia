/**
 * GTK-75 — listContentRevisions (SEC-4).
 */
import { WorkflowStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { revisionFindMany, userFindMany } = vi.hoisted(() => ({
  revisionFindMany: vi.fn(),
  userFindMany: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    contentRevision: { findMany: revisionFindMany },
    user: { findMany: userFindMany },
  },
}));

import { listContentRevisions } from '@/lib/content/revisions';

const SERVICE_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const SERVICE_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const EDITOR_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

describe('listContentRevisions (GTK-75)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userFindMany.mockResolvedValue([{ id: EDITOR_ID, fullName: 'Editor Test' }]);
  });

  it('devuelve revisiones ordenadas por versionNumber desc para type/id', async () => {
    revisionFindMany.mockResolvedValue([
      {
        versionNumber: 2,
        workflowStatusAt: WorkflowStatus.en_revision,
        editorId: EDITOR_ID,
        changeSummary: 'Regeneración IA',
        createdAt: new Date('2026-07-01T10:00:00Z'),
      },
      {
        versionNumber: 1,
        workflowStatusAt: WorkflowStatus.borrador_ia,
        editorId: EDITOR_ID,
        changeSummary: null,
        createdAt: new Date('2026-06-01T10:00:00Z'),
      },
    ]);

    const rows = await listContentRevisions('service', SERVICE_A);

    expect(revisionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { contentType: 'service', contentId: SERVICE_A },
        orderBy: { versionNumber: 'desc' },
      }),
    );
    expect(rows).toHaveLength(2);
    expect(rows[0]?.versionNumber).toBe(2);
    expect(rows[0]?.editorName).toBe('Editor Test');
  });

  it('SEC-4: consulta acotada por contentType y contentId (no mezcla entidades)', async () => {
    revisionFindMany.mockResolvedValue([]);

    await listContentRevisions('service', SERVICE_B);

    expect(revisionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { contentType: 'service', contentId: SERVICE_B },
      }),
    );
  });
});
