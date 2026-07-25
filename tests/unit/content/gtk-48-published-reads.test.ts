import { WorkflowStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/env', () => ({
  env: { MEDIA_STORAGE_BASE_URL: 'https://media.example.com' },
}));

const { serviceFindMany, caseStudyFindMany, accreditationFindMany } = vi.hoisted(() => ({
  serviceFindMany: vi.fn(),
  caseStudyFindMany: vi.fn(),
  accreditationFindMany: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    service: { findMany: serviceFindMany },
    caseStudy: { findMany: caseStudyFindMany },
    accreditation: { findMany: accreditationFindMany },
  },
}));

import { listActiveAccreditations } from '@/lib/content/accreditations';
import { listRecentPublishedCaseStudies } from '@/lib/content/case-studies';
import { listPublishedServices } from '@/lib/content/services';

const publishedWhere = {
  workflowStatus: WorkflowStatus.publicado,
  deletedAt: null,
};

describe('lecturas públicas GTK-48', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceFindMany.mockResolvedValue([]);
    caseStudyFindMany.mockResolvedValue([]);
    accreditationFindMany.mockResolvedValue([]);
  });

  it('listPublishedServices filtra publicado', async () => {
    await listPublishedServices({ take: 6 });
    expect(serviceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: publishedWhere,
        take: 6,
      }),
    );
  });

  it('listRecentPublishedCaseStudies filtra publicado', async () => {
    await listRecentPublishedCaseStudies(2);
    expect(caseStudyFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: publishedWhere,
        take: 2,
      }),
    );
  });

  it('listActiveAccreditations filtra publicado', async () => {
    await listActiveAccreditations();
    expect(accreditationFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: publishedWhere,
      }),
    );
  });
});
