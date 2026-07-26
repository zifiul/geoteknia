import { CredentialType, WorkflowStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/env', () => ({
  env: { MEDIA_STORAGE_BASE_URL: 'https://media.example.com' },
}));

const { accreditationFindMany, mediaAssetFindMany } = vi.hoisted(() => ({
  accreditationFindMany: vi.fn(),
  mediaAssetFindMany: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    accreditation: { findMany: accreditationFindMany },
    mediaAsset: { findMany: mediaAssetFindMany },
  },
}));

import {
  listActiveAccreditations,
  listPublishedAccreditationsDetailed,
} from '@/lib/content/accreditations';

const publishedWhere = {
  workflowStatus: WorkflowStatus.publicado,
  deletedAt: null,
};

describe('GTK-59 listPublishedAccreditationsDetailed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    accreditationFindMany.mockResolvedValue([]);
    mediaAssetFindMany.mockResolvedValue([]);
  });

  it('filtra publicado y excluye vencidas', async () => {
    await listPublishedAccreditationsDetailed();
    expect(accreditationFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          ...publishedWhere,
          OR: [{ validUntil: null }, { validUntil: { gt: expect.any(Date) } }],
        }),
        orderBy: [{ credentialType: 'asc' }, { name: 'asc' }],
      }),
    );
  });

  it('resuelve logo desde media_assets', async () => {
    accreditationFindMany.mockResolvedValue([
      {
        id: 'a1',
        name: 'ENAC Lab',
        credentialType: CredentialType.enac,
        issuer: 'ENAC',
        registrationNumber: '1234/LAB',
        verificationUrl: 'https://enac.es/verify',
        validUntil: null,
        logoId: 'logo-1',
      },
    ]);
    mediaAssetFindMany.mockResolvedValue([
      {
        id: 'logo-1',
        fileUrl: '/acc/enac.png',
        altText: 'Logo ENAC',
      },
    ]);

    const rows = await listPublishedAccreditationsDetailed();
    expect(mediaAssetFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['logo-1'] }, deletedAt: null },
      }),
    );
    expect(rows[0]).toMatchObject({
      logoUrl: 'https://media.example.com/acc/enac.png',
      logoAlt: 'Logo ENAC',
      registrationNumber: '1234/LAB',
    });
  });

  it('tolera campos opcionales ausentes', async () => {
    accreditationFindMany.mockResolvedValue([
      {
        id: 'a2',
        name: 'ISO 9001',
        credentialType: CredentialType.iso,
        issuer: null,
        registrationNumber: null,
        verificationUrl: null,
        validUntil: null,
        logoId: null,
      },
    ]);

    const rows = await listPublishedAccreditationsDetailed();
    expect(rows[0]).toMatchObject({
      logoUrl: null,
      logoAlt: null,
      issuer: null,
      verificationUrl: null,
    });
    expect(mediaAssetFindMany).not.toHaveBeenCalled();
  });
});

describe('GTK-59 regresión listActiveAccreditations (GTK-48 Home)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    accreditationFindMany.mockResolvedValue([{ id: 'x', name: 'Sello' }]);
  });

  it('sigue devolviendo solo id y name', async () => {
    const rows = await listActiveAccreditations();
    expect(accreditationFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: { id: true, name: true },
      }),
    );
    expect(rows).toEqual([{ id: 'x', name: 'Sello' }]);
  });
});
