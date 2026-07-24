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

export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);

export const phoneField = z
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

export const locationLeadSchema = z
  .object({
    cadastralRef: z.string().trim().max(50).optional(),
    mapLat: z.coerce.number().min(-90).max(90).optional(),
    mapLng: z.coerce.number().min(-180).max(180).optional(),
    nombre: z.string().trim().min(2).max(200).optional(),
    email: emailField.optional(),
    telefono: phoneField.optional(),
    provincia: z.string().trim().min(1).optional(),
    gdprConsent: z.literal(true),
    turnstileToken: z.string().min(1),
    utmSource: z.string().trim().max(200).optional(),
    utmMedium: z.string().trim().max(200).optional(),
    utmCampaign: z.string().trim().max(200).optional(),
    gaClientId: z.string().trim().max(200).optional(),
    landingUrl: z.string().trim().url().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const hasLocation =
      !!data.cadastralRef ||
      (data.mapLat !== undefined && data.mapLng !== undefined);
    if (!hasLocation) {
      ctx.addIssue({
        code: 'custom',
        path: ['cadastralRef'],
        message: 'Indica la referencia catastral o un punto en el mapa',
      });
    }
    if ((data.mapLat === undefined) !== (data.mapLng === undefined)) {
      ctx.addIssue({
        code: 'custom',
        path: ['mapLng'],
        message: 'Latitud y longitud deben enviarse juntas',
      });
    }
    if (!data.email && !data.telefono) {
      ctx.addIssue({
        code: 'custom',
        path: ['email'],
        message: 'Indica un email o un teléfono de contacto',
      });
    }
  });

export type BudgetLeadInput = z.infer<typeof budgetLeadSchema>;
export type ContactBaseInput = z.infer<typeof contactBaseSchema>;
export type LocationLeadInput = z.infer<typeof locationLeadSchema>;
