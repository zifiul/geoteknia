import { WorkflowStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { leadMagnetFindMany, leadMagnetFindFirst } = vi.hoisted(() => ({
  leadMagnetFindMany: vi.fn(),
  leadMagnetFindFirst: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    leadMagnet: { findMany: leadMagnetFindMany, findFirst: leadMagnetFindFirst },
    mediaAsset: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn() },
  },
}));

import {
  getPublishedLeadMagnetBySlug,
  listPublishedLeadMagnets,
} from '@/lib/content/lead-magnets';

const publishedGatedWhere = {
  workflowStatus: WorkflowStatus.publicado,
  deletedAt: null,
  isGated: true,
};

describe('lecturas públicas GTK-61', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    leadMagnetFindMany.mockResolvedValue([]);
    leadMagnetFindFirst.mockResolvedValue(null);
  });

  it('listPublishedLeadMagnets filtra publicado y gated', async () => {
    await listPublishedLeadMagnets();
    expect(leadMagnetFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: publishedGatedWhere,
      }),
    );
  });

  it('getPublishedLeadMagnetBySlug aplica el mismo filtro', async () => {
    await getPublishedLeadMagnetBySlug('checklist');
    expect(leadMagnetFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'checklist', ...publishedGatedWhere },
      }),
    );
  });
});
