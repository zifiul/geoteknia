import { z } from 'zod';

/** Roles del formulario de presupuesto (GTK-28). */
export const professionalRoleSchema = z.enum([
  'propiedad',
  'promotor',
  'constructor',
  'arquitecto',
  'ingenieria',
  'otro',
]);

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);

const phoneField = z
  .string()
  .trim()
  .transform((v) => v.replace(/\s+/g, ''))
  .pipe(z.string().min(9).max(20));

export const contactBaseSchema = z.object({
  nombre: z.string().trim().min(2).max(200),
  empresa: z.string().trim().max(200).optional(),
  email: emailField,
  telefono: phoneField,
  rol: professionalRoleSchema,
});

export const budgetLeadSchema = z
  .object({
    servicio: z.string().trim().min(1),
    provincia: z.string().trim().min(1),
    tipoObra: z.string().trim().min(1).optional(),
    plantas: z.number().int().positive().optional(),
    superficie: z.number().positive().optional(),
    fase: z.string().trim().max(200).optional(),
    nombre: z.string().trim().min(2).max(200),
    empresa: z.string().trim().max(200).optional(),
    email: emailField,
    telefono: phoneField,
    rol: professionalRoleSchema,
    gdprConsent: z.literal(true),
    turnstileToken: z.string().min(1),
    utmSource: z.string().trim().max(200).optional(),
    utmMedium: z.string().trim().max(200).optional(),
    utmCampaign: z.string().trim().max(200).optional(),
    gaClientId: z.string().trim().max(200).optional(),
    landingUrl: z.string().trim().url().optional(),
  })
  .strict();

export type BudgetLeadInput = z.infer<typeof budgetLeadSchema>;
export type ContactBaseInput = z.infer<typeof contactBaseSchema>;
