import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const findManyMock = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    calculatorRule: {
      findMany: (...args: unknown[]) => findManyMock(...args),
    },
  },
}));

import { loadActiveRulesForTypology } from '@/lib/calculator/rules-repository';

describe('rules-repository (GTK-33)', () => {
  beforeEach(() => {
    findManyMock.mockReset();
  });

  it('filtra activas y normaliza Decimal→number', async () => {
    findManyMock.mockResolvedValue([
      {
        id: 'r1',
        createdAt: new Date(),
        minFloors: 1,
        maxFloors: 3,
        minAreaM2: new Prisma.Decimal('1000.50'),
        maxAreaM2: new Prisma.Decimal('3000.00'),
        boreholesFormula: { type: 'linear', base: 2, per1000m2: 1 },
        depthEstimate: '12 m',
        recommendedTests: 'Lab',
        cteReference: 'CTE',
      },
    ]);

    const rules = await loadActiveRulesForTypology('typ-1');
    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          workTypologyId: 'typ-1',
          isActive: true,
          deletedAt: null,
        },
      }),
    );
    expect(rules[0]?.minAreaM2).toBe(1000.5);
    expect(rules[0]?.maxAreaM2).toBe(3000);
  });
});
