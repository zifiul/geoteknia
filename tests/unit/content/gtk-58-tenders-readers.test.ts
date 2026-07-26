import { WorkflowStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { contractorFindMany, organismFindMany } = vi.hoisted(() => ({
  contractorFindMany: vi.fn(),
  organismFindMany: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    contractorClassification: { findMany: contractorFindMany },
    publicOrganismExperience: { findMany: organismFindMany },
  },
}));

import {
  listContractorClassifications,
  listPublicOrganismExperience,
} from '@/lib/content/tenders';
import { tenderLeadSchema } from '@/lib/leads/schema';

describe('GTK-58 listContractorClassifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contractorFindMany.mockResolvedValue([]);
  });

  it('ordena por order, group y subgroup', async () => {
    await listContractorClassifications();
    expect(contractorFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null },
        orderBy: [{ order: 'asc' }, { groupCode: 'asc' }, { subgroupCode: 'asc' }],
      }),
    );
  });
});

describe('GTK-58 listPublicOrganismExperience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    organismFindMany.mockResolvedValue([]);
  });

  it('expone caso relacionado solo si está publicado', async () => {
    organismFindMany.mockResolvedValue([
      {
        id: 'e1',
        organismName: 'Org A',
        organismType: 'ministerio',
        description: 'Desc',
        wasUte: false,
        relatedCase: {
          title: 'Caso publicado',
          slug: 'caso-publicado',
          workflowStatus: WorkflowStatus.publicado,
          deletedAt: null,
        },
      },
      {
        id: 'e2',
        organismName: 'Org B',
        organismType: null,
        description: null,
        wasUte: null,
        relatedCase: {
          title: 'Borrador',
          slug: 'borrador',
          workflowStatus: WorkflowStatus.borrador_ia,
          deletedAt: null,
        },
      },
    ]);

    const rows = await listPublicOrganismExperience();
    expect(rows[0]?.relatedCase).toEqual({
      title: 'Caso publicado',
      slug: 'caso-publicado',
    });
    expect(rows[1]?.relatedCase).toBeNull();
  });
});

describe('GTK-58 validación formulario (tenderLeadSchema)', () => {
  const base = {
    nombre: 'Ana López',
    empresa: 'Constructora SA',
    email: 'licitacion@example.com',
    gdprConsent: true as const,
    turnstileToken: 'ts',
  };

  it('acepta expediente O plataforma', () => {
    expect(
      tenderLeadSchema.safeParse({ ...base, expedienteRef: 'EXP-1' }).success,
    ).toBe(true);
    expect(
      tenderLeadSchema.safeParse({
        ...base,
        plataformaUrl: 'https://contrataciondelestado.es/exp/1',
      }).success,
    ).toBe(true);
  });

  it('rechaza sin expediente ni plataforma', () => {
    expect(tenderLeadSchema.safeParse(base).success).toBe(false);
  });
});
