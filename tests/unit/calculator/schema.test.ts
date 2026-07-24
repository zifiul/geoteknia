import { describe, expect, it } from 'vitest';

import {
  boreholesFormulaSchema,
  calculatorInputSchema,
} from '@/lib/calculator/schema';

describe('calculator schema (GTK-33)', () => {
  it('rechaza claves extra (.strict)', () => {
    const result = calculatorInputSchema.safeParse({
      tipoObra: 'edificacion-residencial',
      plantas: 3,
      superficie: 1000,
      provincia: 'madrid',
      extra: true,
    });
    expect(result.success).toBe(false);
  });

  it('coerce plantas y superficie', () => {
    const result = calculatorInputSchema.safeParse({
      tipoObra: 'edificacion-residencial',
      plantas: '4',
      superficie: '1200',
      provincia: 'madrid',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.plantas).toBe(4);
      expect(result.data.superficie).toBe(1200);
    }
  });

  it('boreholesFormulaSchema rechaza JSON corrupto', () => {
    expect(
      boreholesFormulaSchema.safeParse({ type: 'linear', base: -1, per1000m2: 1 })
        .success,
    ).toBe(false);
    expect(
      boreholesFormulaSchema.safeParse({ type: 'eval', code: '1+1' }).success,
    ).toBe(false);
  });
});
