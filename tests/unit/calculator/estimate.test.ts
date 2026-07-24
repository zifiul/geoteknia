/**
 * GTK-33 — motor puro estimate / selectRule.
 */
import { describe, expect, it } from 'vitest';

import {
  areaSpan,
  estimate,
  selectRule,
  type CalculatorRuleData,
} from '@/lib/calculator/estimate';

const BASE_RULE: Omit<CalculatorRuleData, 'id' | 'createdAt'> = {
  minFloors: 1,
  maxFloors: 8,
  minAreaM2: 500,
  maxAreaM2: 15_000,
  boreholesFormula: { type: 'linear', base: 2, perFloor: 0.5, per1000m2: 1 },
  depthEstimate: '15-25 m',
  recommendedTests: 'Sondeos',
  cteReference: 'CTE DB-SE-C',
};

function rule(
  overrides: Partial<CalculatorRuleData> & Pick<CalculatorRuleData, 'id'>,
): CalculatorRuleData {
  return {
    ...BASE_RULE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

describe('estimate (GTK-33)', () => {
  const edificacion = rule({ id: 'a' });

  it('fórmula linear seed edificación: plantas 6, superficie 3200 → 9 sondeos', () => {
    const result = estimate(
      {
        tipoObra: 'edificacion-residencial',
        plantas: 6,
        superficie: 3200,
        provincia: 'madrid',
      },
      [edificacion],
    );
    expect(result).toMatchObject({
      boreholes: 9,
      depthEstimate: '15-25 m',
    });
    expect(result).not.toHaveProperty('precio');
    expect(result).not.toHaveProperty('price');
  });

  it('Math.ceil y mínimo 1', () => {
    const tiny = rule({
      id: 'tiny',
      boreholesFormula: { type: 'linear', base: 0.1, per1000m2: 0 },
      minAreaM2: 1,
      maxAreaM2: 100,
    });
    const result = estimate(
      {
        tipoObra: 'x',
        plantas: 1,
        superficie: 50,
        provincia: 'madrid',
      },
      [tiny],
    );
    expect(result).toMatchObject({ boreholes: 1 });
  });

  it('obra civil: floors null acepta cualquier plantas en rango de área', () => {
    const civil = rule({
      id: 'civil',
      minFloors: null,
      maxFloors: null,
      minAreaM2: 1000,
      maxAreaM2: 50_000,
      boreholesFormula: { type: 'linear', base: 3, per1000m2: 1.5 },
    });
    const result = estimate(
      {
        tipoObra: 'obra-civil',
        plantas: 50,
        superficie: 5000,
        provincia: 'madrid',
      },
      [civil],
    );
    expect(result).toMatchObject({ boreholes: 11 });
  });

  it('{ noRule: true } fuera de rango de superficie', () => {
    const result = estimate(
      {
        tipoObra: 'edificacion-residencial',
        plantas: 4,
        superficie: 100,
        provincia: 'madrid',
      },
      [edificacion],
    );
    expect(result).toEqual({ noRule: true });
  });

  it('desempate por rango de área más estrecho', () => {
    const wide = rule({
      id: 'wide',
      minAreaM2: 500,
      maxAreaM2: 20_000,
      boreholesFormula: { type: 'linear', base: 1, per1000m2: 0 },
    });
    const narrow = rule({
      id: 'narrow',
      createdAt: new Date('2026-02-01T00:00:00.000Z'),
      minAreaM2: 1000,
      maxAreaM2: 5000,
      boreholesFormula: { type: 'linear', base: 9, per1000m2: 0 },
    });
    const picked = selectRule([wide, narrow], 4, 3000);
    expect(picked?.id).toBe('narrow');
    expect(areaSpan(narrow)).toBeLessThan(areaSpan(wide));
  });

  it('lanza CalculatorFormulaError si fórmula corrupta', () => {
    const bad = rule({
      id: 'bad',
      boreholesFormula: { type: 'linear', base: 'oops' },
    });
    expect(() =>
      estimate(
        {
          tipoObra: 'x',
          plantas: 2,
          superficie: 1000,
          provincia: 'madrid',
        },
        [bad],
      ),
    ).toThrow();
  });
});
