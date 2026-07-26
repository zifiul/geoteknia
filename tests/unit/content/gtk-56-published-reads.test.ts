import { WorkflowStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/env', () => ({
  env: { MEDIA_STORAGE_BASE_URL: 'https://media.example.com' },
}));

const {
  teamMemberFindMany,
  teamMemberFindFirst,
  caseStudyFindMany,
  mediaAssetFindMany,
  mediaAssetFindFirst,
} = vi.hoisted(() => ({
  teamMemberFindMany: vi.fn(),
  teamMemberFindFirst: vi.fn(),
  caseStudyFindMany: vi.fn(),
  mediaAssetFindMany: vi.fn(),
  mediaAssetFindFirst: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    teamMember: { findMany: teamMemberFindMany, findFirst: teamMemberFindFirst },
    caseStudy: { findMany: caseStudyFindMany },
    mediaAsset: { findMany: mediaAssetFindMany, findFirst: mediaAssetFindFirst },
  },
}));

import { listPublishedCaseStudiesByTeamMember } from '@/lib/content/case-studies';
import {
  getPublishedTeamMemberBySlug,
  listPublishedTeamMembers,
} from '@/lib/content/team-machinery';

const publishedWhere = {
  workflowStatus: WorkflowStatus.publicado,
  deletedAt: null,
};

describe('lecturas públicas GTK-56', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    teamMemberFindMany.mockResolvedValue([]);
    teamMemberFindFirst.mockResolvedValue(null);
    caseStudyFindMany.mockResolvedValue([]);
    mediaAssetFindMany.mockResolvedValue([]);
    mediaAssetFindFirst.mockResolvedValue(null);
  });

  it('listPublishedTeamMembers filtra por PUBLISHED_EDITORIAL_WHERE', async () => {
    await listPublishedTeamMembers();
    expect(teamMemberFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: publishedWhere,
      }),
    );
  });

  it('getPublishedTeamMemberBySlug devuelve null si no hay fila publicada', async () => {
    teamMemberFindFirst.mockResolvedValue(null);
    await expect(getPublishedTeamMemberBySlug('oculto')).resolves.toBeNull();
    expect(teamMemberFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'oculto', ...publishedWhere },
      }),
    );
  });

  it('getPublishedTeamMemberBySlug resuelve foto y campos de perfil', async () => {
    teamMemberFindFirst.mockResolvedValue({
      id: 'tm-1',
      fullName: 'Ana López',
      jobTitle: 'Ingeniera geotécnica',
      slug: 'ana-lopez',
      qualification: 'Ing. Caminos',
      collegeRegistrationNo: 'COIG-123',
      yearsExperience: 12,
      specialization: 'Cimentaciones',
      bio: 'Bio',
      publications: null,
      worksFor: 'Geoteknia',
      alumniOf: 'UPM',
      photoId: 'photo-1',
    });
    mediaAssetFindFirst.mockResolvedValue({
      fileUrl: '/media/ana.jpg',
      altText: 'Retrato de Ana',
    });

    const result = await getPublishedTeamMemberBySlug('ana-lopez');
    expect(result).toMatchObject({
      id: 'tm-1',
      fullName: 'Ana López',
      collegeRegistrationNo: 'COIG-123',
      photoUrl: 'https://media.example.com/media/ana.jpg',
      photoAlt: 'Retrato de Ana',
    });
  });

  it('listPublishedCaseStudiesByTeamMember solo casos publicados del técnico', async () => {
    await listPublishedCaseStudiesByTeamMember('tm-99', 6);
    expect(caseStudyFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          ...publishedWhere,
          teamMembers: { some: { teamMemberId: 'tm-99' } },
        },
        take: 6,
      }),
    );
  });
});
