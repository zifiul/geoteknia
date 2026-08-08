import { z, type ZodIssue } from 'zod';

import { budgetLeadSchema, professionalRoleSchema } from '@/lib/leads/schema';
export const BUDGET_FORM_NAME = 'presupuesto';
export const BUDGET_API_PATH = '/api/leads/presupuesto';

export const BUDGET_WIZARD_STEP_LABELS = [
  'Servicio y zona',
  'Tu proyecto',
  'Contacto',
] as const;

export const budgetStep1Schema = budgetLeadSchema.pick({
  servicio: true,
  provincia: true,
});

export const budgetStep3Schema = budgetLeadSchema.pick({
  nombre: true,
  email: true,
  telefono: true,
  rol: true,
  gdprConsent: true,
});

export const budgetStep2Schema = z
  .object({
    tipoObra: z
      .string()
      .trim()
      .min(1, 'Seleccione una tipología de obra válida')
      .optional(),
    plantas: z
      .number()
      .positive('El número de plantas debe ser mayor que 0')
      .optional(),
    superficie: z
      .number()
      .positive('La superficie debe ser mayor que 0')
      .optional(),
    fase: z
      .string()
      .trim()
      .optional(),
  })
  .strict();

export type BudgetFormPrefill = {
  servicio?: string;
  provincia?: string;
  tipoObra?: string;
  plantas?: string;
  superficie?: string;
};

export type BudgetWizardCatalogSlugs = {
  serviceSlugs: ReadonlySet<string>;
  provinceSlugs: ReadonlySet<string>;
};

export function resolveCatalogSlug(
  slug: string | undefined,
  options: { slug: string }[],
): string {
  const value = slug?.trim() ?? '';
  return options.some((option) => option.slug === value) ? value : '';
}

export function createBudgetWizardInitialDraft(
  prefill: BudgetFormPrefill,
  catalogs: {
    services: { slug: string }[];
    provinces: { slug: string }[];
    workTypologies: { slug: string }[];
  },
): BudgetFormDraft {
  return {
    servicio: resolveCatalogSlug(prefill.servicio, catalogs.services),
    provincia: resolveCatalogSlug(prefill.provincia, catalogs.provinces),
    tipoObra: resolveCatalogSlug(prefill.tipoObra, catalogs.workTypologies),
    plantas: prefill.plantas ?? '',
    superficie: prefill.superficie ?? '',
    fase: '',
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    rol: '',
    gdprConsent: false,
  };
}

function step1CatalogIssues(
  draft: BudgetFormDraft,
  catalogs: BudgetWizardCatalogSlugs,
): ZodIssue[] {
  const issues: ZodIssue[] = [];
  if (!catalogs.serviceSlugs.has(draft.servicio)) {
    issues.push({
      code: 'custom',
      path: ['servicio'],
      message: 'Seleccione un servicio geotécnico',
    });
  }
  if (!catalogs.provinceSlugs.has(draft.provincia)) {
    issues.push({
      code: 'custom',
      path: ['provincia'],
      message: 'Seleccione una provincia',
    });
  }
  return issues;
}

export type BudgetFormDraft = {
  servicio: string;
  provincia: string;
  tipoObra: string;
  plantas: string;
  superficie: string;
  fase: string;
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  rol: string;
  gdprConsent: boolean;
};

export const PROFESSIONAL_ROLE_OPTIONS: {
  value: z.infer<typeof professionalRoleSchema>;
  label: string;
}[] = [
  { value: 'propiedad', label: 'Propiedad' },
  { value: 'promotor', label: 'Promotor' },
  { value: 'constructor', label: 'Constructor' },
  { value: 'arquitecto', label: 'Arquitecto' },
  { value: 'ingenieria', label: 'Ingeniería' },
  { value: 'otro', label: 'Otro' },
];

export function buildBudgetPayload(
  draft: BudgetFormDraft,
  turnstileToken: string,
  attribution?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    landingUrl?: string;
  },
): Record<string, unknown> {
  const plantas =
    draft.plantas.trim() === '' ? undefined : Number.parseInt(draft.plantas, 10);
  const superficie =
    draft.superficie.trim() === '' ? undefined : Number.parseFloat(draft.superficie);

  return {
    servicio: draft.servicio,
    provincia: draft.provincia,
    ...(draft.tipoObra.trim() ? { tipoObra: draft.tipoObra } : {}),
    ...(plantas !== undefined && !Number.isNaN(plantas) ? { plantas } : {}),
    ...(superficie !== undefined && !Number.isNaN(superficie) ? { superficie } : {}),
    ...(draft.fase.trim() ? { fase: draft.fase } : {}),
    nombre: draft.nombre,
    ...(draft.empresa.trim() ? { empresa: draft.empresa } : {}),
    email: draft.email,
    telefono: draft.telefono,
    rol: draft.rol,
    gdprConsent: draft.gdprConsent ? true : undefined,
    turnstileToken,
    ...(attribution?.utmSource ? { utmSource: attribution.utmSource } : {}),
    ...(attribution?.utmMedium ? { utmMedium: attribution.utmMedium } : {}),
    ...(attribution?.utmCampaign ? { utmCampaign: attribution.utmCampaign } : {}),
    ...(attribution?.landingUrl ? { landingUrl: attribution.landingUrl } : {}),
  };
}

export function validateBudgetWizardStep(
  step: 1 | 2 | 3,
  draft: BudgetFormDraft,
  catalogs?: BudgetWizardCatalogSlugs,
) {
  if (step === 1) {
    const parsed = budgetStep1Schema.safeParse({
      servicio: draft.servicio,
      provincia: draft.provincia,
    });
    if (!parsed.success) return parsed;
    if (!catalogs) return parsed;

    const catalogIssues = step1CatalogIssues(draft, catalogs);
    if (catalogIssues.length === 0) return parsed;

    return {
      success: false as const,
      error: new z.ZodError(catalogIssues),
    };
  }

  if (step === 2) {
    const payload = buildBudgetPayload(draft, 'pending');
    const step2Data: Record<string, unknown> = {};
    if (payload.tipoObra) step2Data.tipoObra = payload.tipoObra;
    if (payload.plantas !== undefined) step2Data.plantas = payload.plantas;
    if (payload.superficie !== undefined) step2Data.superficie = payload.superficie;
    if (payload.fase) step2Data.fase = payload.fase;
    return budgetStep2Schema.safeParse(step2Data);
  }

  return budgetStep3Schema.safeParse({
    nombre: draft.nombre,
    email: draft.email,
    telefono: draft.telefono,
    rol: draft.rol,
    gdprConsent: draft.gdprConsent ? true : undefined,
  });
}

export function validateFullBudgetLead(
  draft: BudgetFormDraft,
  turnstileToken: string,
  attribution?: Parameters<typeof buildBudgetPayload>[2],
) {
  const payload = buildBudgetPayload(draft, turnstileToken, attribution);
  return budgetLeadSchema.safeParse(payload);
}
