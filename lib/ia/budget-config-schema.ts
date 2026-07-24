import { AiModel, PromptPageType } from '@prisma/client';
import { z } from 'zod';

const billingPeriodSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, 'billingPeriod debe ser YYYY-MM');

const promptPageTypeSchema = z.nativeEnum(PromptPageType);

const modelByPageTypeSchema = z
  .record(z.nativeEnum(AiModel))
  .superRefine((record, ctx) => {
    for (const key of Object.keys(record)) {
      const parsed = promptPageTypeSchema.safeParse(key);
      if (!parsed.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Clave de modelByPageType inválida: ${key}`,
        });
      }
    }
  })
  .optional();

export const updateBudgetConfigSchema = z.object({
  billingPeriod: billingPeriodSchema.nullable().optional(),
  monthlyBudgetEur: z.coerce.number().positive(),
  alertThresholdPct: z.coerce.number().int().min(1).max(100),
  modelByPageType: modelByPageTypeSchema,
  notifyEmails: z.array(z.email()).max(20).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateBudgetConfigInput = z.infer<typeof updateBudgetConfigSchema>;

export const costReportFiltersSchema = z.object({
  billingPeriod: billingPeriodSchema.optional(),
});

export type CostReportFilters = z.infer<typeof costReportFiltersSchema>;
