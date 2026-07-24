import 'server-only';

import type { Province, Prisma } from '@prisma/client';
import {
  LeadChannel,
  LeadType,
  Prisma as PrismaRuntime,
} from '@prisma/client';

import { recordConversionEvent } from '@/lib/analytics/record-event';
import { sendLeadConfirmation } from '@/lib/email';
import { db } from '@/lib/db';

import { deriveLeadSource } from './attribution';
import { LeadCaptureError } from './errors';
import { generateUniqueReferenceNumber } from './reference';
import type { TenderLeadInput } from './schema';
import { upsertContact } from './upsert-contact';
import {
  createProjectFromLead,
  findInitialProjectStateId,
} from '@/lib/projects/create-project-from-lead';

export type CreateTenderLeadResult = {
  referenceNumber: string;
  leadId: string;
};

async function resolveProvinceOptional(
  tx: Prisma.TransactionClient,
  slug?: string,
): Promise<Province | null> {
  if (!slug) {
    return null;
  }
  const province = await tx.province.findFirst({ where: { slug } });
  if (!province) {
    throw new LeadCaptureError(
      'VALIDATION_ERROR',
      400,
      'Provincia no válida',
      [{ path: 'provincia', message: 'Slug de provincia desconocido' }],
    );
  }
  return province;
}

function buildTenderProjectData(
  input: TenderLeadInput,
): Prisma.InputJsonValue | undefined {
  const data: Record<string, unknown> = {};
  if (input.organismo !== undefined) data.organismo = input.organismo;
  if (input.plataformaUrl !== undefined) {
    data.plataformaUrl = input.plataformaUrl;
  }
  if (input.esUte !== undefined) data.esUte = input.esUte;
  return Object.keys(data).length > 0 ? data : undefined;
}

async function sendConfirmationBestEffort(
  input: TenderLeadInput,
  referenceNumber: string,
  provinceName: string,
): Promise<void> {
  try {
    const result = await sendLeadConfirmation({
      to: input.email,
      referenceNumber,
      serviceName: 'Solicitud de licitación',
      province: provinceName,
      technicianName: null,
    });
    if (!result.ok) {
      console.error(
        JSON.stringify({
          event: 'tender_lead_confirmation_failed',
          referenceNumber,
          error: result.error,
        }),
      );
    }
  } catch (error) {
    console.error(
      JSON.stringify({
        event: 'tender_lead_confirmation_error',
        referenceNumber,
        message: error instanceof Error ? error.message : 'unknown',
      }),
    );
  }
}

/**
 * Caso de uso: lead de licitación (GTK-31).
 */
export async function createTenderLead(
  input: TenderLeadInput,
): Promise<CreateTenderLeadResult> {
  const result = await db.$transaction(async (tx) => {
    const province = await resolveProvinceOptional(tx, input.provincia);
    const contact = await upsertContact(tx, {
      fullName: input.nombre,
      email: input.email,
      phone: input.telefono,
      company: input.empresa,
      provinceId: province?.id,
    });
    const referenceNumber = await generateUniqueReferenceNumber(tx, 'LIC');
    const initialStateId = await findInitialProjectStateId(tx);

    const estimatedDecimal =
      input.importeEstimado !== undefined
        ? new PrismaRuntime.Decimal(input.importeEstimado)
        : null;

    const lead = await tx.lead.create({
      data: {
        contactId: contact.id,
        referenceNumber,
        leadType: LeadType.licitacion,
        channel: LeadChannel.formulario,
        source: deriveLeadSource({
          utmSource: input.utmSource,
          utmMedium: input.utmMedium,
          utmCampaign: input.utmCampaign,
          landingUrl: input.landingUrl,
        }),
        serviceId: null,
        provinceId: province?.id ?? null,
        expedienteRef: input.expedienteRef ?? null,
        estimatedValue: estimatedDecimal,
        projectData: buildTenderProjectData(input),
        utmSource: input.utmSource ?? null,
        utmMedium: input.utmMedium ?? null,
        utmCampaign: input.utmCampaign ?? null,
        gaClientId: input.gaClientId ?? null,
        landingUrl: input.landingUrl ?? null,
        gdprConsent: true,
      },
    });

    await createProjectFromLead(tx, {
      leadId: lead.id,
      referenceNumber,
      service: null,
      province,
      initialStateId,
      titlePrefix: 'Licitación',
      expedienteRef: input.expedienteRef ?? null,
      estimatedValue: input.importeEstimado ?? null,
    });

    return {
      referenceNumber,
      leadId: lead.id,
      provinceName: province?.name ?? 'Por determinar',
      provinceSlug: province?.slug ?? null,
    };
  });

  await sendConfirmationBestEffort(
    input,
    result.referenceNumber,
    result.provinceName,
  );

  const source = deriveLeadSource({
    utmSource: input.utmSource,
    utmMedium: input.utmMedium,
    utmCampaign: input.utmCampaign,
    landingUrl: input.landingUrl,
  });
  try {
    await recordConversionEvent({
      eventName: 'generate_lead',
      leadId: result.leadId,
      provinceSlug: result.provinceSlug ?? undefined,
      leadType: 'licitacion',
      value: input.importeEstimado,
      source,
    });
  } catch {
    // best-effort
  }

  return {
    referenceNumber: result.referenceNumber,
    leadId: result.leadId,
  };
}
