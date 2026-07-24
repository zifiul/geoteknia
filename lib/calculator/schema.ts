import { z } from 'zod';

export const linearFormulaSchema = z.object({
  type: z.literal('linear'),
  base: z.number().nonnegative(),
  perFloor: z.number().nonnegative().optional(),
  per1000m2: z.number().nonnegative(),
});

export const boreholesFormulaSchema = z.discriminatedUnion('type', [
  linearFormulaSchema,
]);

export const calculatorInputSchema = z
  .object({
    tipoObra: z.string().trim().min(1),
    plantas: z.coerce.number().int().positive().max(200),
    superficie: z.coerce.number().positive().max(1_000_000),
    provincia: z.string().trim().min(1),
  })
  .strict();

export const calculatorPrefillSchema = z.object({
  servicio: z.null(),
  provincia: z.string(),
  tipoObra: z.string(),
  plantas: z.number().int().positive(),
  superficie: z.number().positive(),
});

export const calculatorEstimateDataSchema = z.object({
  boreholes: z.number().int().positive(),
  depthEstimate: z.string().nullable(),
  recommendedTests: z.string().nullable(),
  cteReference: z.string().nullable(),
  prefill: calculatorPrefillSchema,
});

export type CalculatorInput = z.infer<typeof calculatorInputSchema>;
export type CalculatorPrefill = z.infer<typeof calculatorPrefillSchema>;
export type CalculatorEstimateData = z.infer<typeof calculatorEstimateDataSchema>;
export type BoreholesFormula = z.infer<typeof boreholesFormulaSchema>;
