import 'server-only';

import type { Prisma } from '@prisma/client';
import { Prisma as PrismaRuntime } from '@prisma/client';

import { db } from '@/lib/db';

import type { ConversionEventInput } from './schema';
import { sanitizePageUrl } from './sanitize';

type DbClient = Prisma.TransactionClient | typeof db;

export type RecordConversionEventOptions = {
  tx?: Prisma.TransactionClient;
};

function client(options?: RecordConversionEventOptions): DbClient {
  return options?.tx ?? db;
}

async function resolveLeadId(
  prisma: DbClient,
  leadId: string | undefined,
): Promise<string | null> {
  if (!leadId) {
    return null;
  }
  const existing = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { id: true },
  });
  return existing?.id ?? null;
}

function toCreateData(
  input: ConversionEventInput,
  leadId: string | null,
): Prisma.ConversionEventCreateManyInput {
  const pageUrl =
    input.pageUrl !== undefined ? sanitizePageUrl(input.pageUrl) : null;

  return {
    eventName: input.eventName,
    leadId,
    serviceSlug: input.serviceSlug ?? null,
    provinceSlug: input.provinceSlug ?? null,
    leadType: input.leadType ?? null,
    source: input.source ?? null,
    pageUrl,
    sessionId: input.sessionId ?? null,
    gaClientId: input.gaClientId ?? null,
    formStep: input.formStep ?? null,
    value:
      input.value !== undefined
        ? new PrismaRuntime.Decimal(input.value)
        : null,
  };
}

/**
 * Persistencia append-only de un evento de conversión.
 * Siempre best-effort: errores → `null` (no lanza).
 */
export async function recordConversionEvent(
  input: ConversionEventInput,
  options?: RecordConversionEventOptions,
): Promise<{ id: string } | null> {
  try {
    const prisma = client(options);
    const leadId = await resolveLeadId(prisma, input.leadId);
    const row = await prisma.conversionEvent.create({
      data: toCreateData(input, leadId),
      select: { id: true },
    });
    return { id: row.id };
  } catch {
    return null;
  }
}

/**
 * Lote append-only. Best-effort: degradación de leadId por evento;
 * fallo total → 0.
 */
export async function recordConversionEvents(
  inputs: ConversionEventInput[],
  options?: RecordConversionEventOptions,
): Promise<number> {
  if (inputs.length === 0) {
    return 0;
  }

  try {
    const prisma = client(options);
    const data: Prisma.ConversionEventCreateManyInput[] = [];

    for (const input of inputs) {
      const leadId = await resolveLeadId(prisma, input.leadId);
      data.push(toCreateData(input, leadId));
    }

    const result = await prisma.conversionEvent.createMany({ data });
    return result.count;
  } catch {
    return 0;
  }
}
