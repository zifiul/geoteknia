import {
  ConversionEventName,
  LeadSource,
  LeadType,
} from '@prisma/client';
import { z } from 'zod';

/** Valores alineados con enum Prisma `ConversionEventName` (GTK-14 / GTK-32). */
export const CONVERSION_EVENT_NAME_VALUES = [
  'generate_lead',
  'click_tel',
  'click_whatsapp',
  'click_email',
  'send_location',
  'calculator_use',
  'resource_download',
  'scroll_depth',
] as const satisfies readonly ConversionEventName[];

export const LEAD_TYPE_VALUES = [
  'presupuesto',
  'licitacion',
  'recurso',
  'ubicacion',
] as const satisfies readonly LeadType[];

export const LEAD_SOURCE_VALUES = [
  'organico',
  'sem',
  'directo',
  'referral',
] as const satisfies readonly LeadSource[];

export const conversionEventNameSchema = z.enum(CONVERSION_EVENT_NAME_VALUES);
export const leadTypeSchema = z.enum(LEAD_TYPE_VALUES);
export const leadSourceSchema = z.enum(LEAD_SOURCE_VALUES);

/**
 * Contrato de un evento de conversión (entrada HTTP o helper interno).
 * `.strict()` rechaza claves desconocidas (SEC-1 / anti-PII).
 * `pageUrl` se sanea a origin+pathname en persistencia (no en este schema).
 */
export const conversionEventSchema = z
  .object({
    eventName: conversionEventNameSchema,
    leadId: z.uuid().optional(),
    serviceSlug: z.string().trim().max(200).optional(),
    provinceSlug: z.string().trim().max(200).optional(),
    leadType: leadTypeSchema.optional(),
    source: leadSourceSchema.optional(),
    pageUrl: z.string().url().max(2048).optional(),
    sessionId: z.string().trim().max(200).optional(),
    gaClientId: z.string().trim().max(200).optional(),
    formStep: z.coerce.number().int().min(0).max(50).optional(),
    value: z.coerce.number().min(0).max(1e10).optional(),
  })
  .strict();

export const conversionEventBatchSchema = z
  .object({
    events: z.array(conversionEventSchema).min(1).max(50),
  })
  .strict();

/** Un evento suelto o un lote `{ events: [...] }` (1–50). */
export const ingestSchema = z.union([
  conversionEventSchema,
  conversionEventBatchSchema,
]);

export type ConversionEventInput = z.infer<typeof conversionEventSchema>;
export type ConversionEventBatchInput = z.infer<typeof conversionEventBatchSchema>;
export type IngestInput = z.infer<typeof ingestSchema>;

/** Normaliza ingest a array de eventos (tras safeParse OK). */
export function normalizeIngestEvents(input: IngestInput): ConversionEventInput[] {
  if ('events' in input) {
    return input.events;
  }
  return [input];
}
