import 'server-only';

import type { Prisma } from '@prisma/client';
import { LeadChannel, LeadType } from '@prisma/client';

import { sendLeadConfirmation } from '@/lib/email';
import { db } from '@/lib/db';
import { recordConversionEvent } from '@/lib/analytics/record-event';

import { deriveLeadSource } from './attribution';
import { LeadCaptureError } from './errors';
import { generateUniqueReferenceNumber } from './reference';
import type { BudgetLeadInput } from './schema';
import { upsertContact } from './upsert-contact';
import {
  createProjectFromLead,
  findInitialProjectStateId,
} from '@/lib/projects/create-project-from-lead';

export type CreateBudgetLeadResult = {
  referenceNumber: string;
  leadId: string;
};

async function resolveCatalogIds(
  tx: Prisma.TransactionClient,
  input: BudgetLeadInput,
) {
  const [service, province, workTypology] = await Promise.all([
    tx.service.findFirst({ where: { slug: input.servicio } }),
    tx.province.findFirst({ where: { slug: input.provincia } }),
    input.tipoObra
      ? tx.workTypology.findFirst({ where: { slug: input.tipoObra } })
      : Promise.resolve(null),
  ]);

  if (!service) {
    throw new LeadCaptureError(
      'VALIDATION_ERROR',
      400,
      'Servicio no válido',
      [{ path: 'servicio', message: 'Slug de servicio desconocido' }],
    );
  }
  if (!province) {
    throw new LeadCaptureError(
      'VALIDATION_ERROR',
      400,
      'Provincia no válida',
      [{ path: 'provincia', message: 'Slug de provincia desconocido' }],
    );
  }
  if (input.tipoObra && !workTypology) {
    throw new LeadCaptureError(
      'VALIDATION_ERROR',
      400,
      'Tipo de obra no válido',
      [{ path: 'tipoObra', message: 'Slug de tipo de obra desconocido' }],
    );
  }

  return { service, province, workTypology };
}

function buildProjectData(input: BudgetLeadInput): Prisma.InputJsonValue | undefined {
  const data: Record<string, unknown> = {};
  if (input.plantas !== undefined) data.plantas = input.plantas;
  if (input.superficie !== undefined) data.superficie = input.superficie;
  if (input.fase !== undefined) data.fase = input.fase;
  return Object.keys(data).length > 0
    ? (data as Prisma.InputJsonValue)
    : undefined;
}

async function sendConfirmationBestEffort(
  input: BudgetLeadInput,
  referenceNumber: string,
  serviceName: string,
  provinceName: string,
): Promise<void> {
  try {
    const result = await sendLeadConfirmation({
      to: input.email,
      referenceNumber,
      serviceName,
      province: provinceName,
      technicianName: null,
    });
    if (!result.ok) {
      console.error(
        JSON.stringify({
          event: 'lead_confirmation_failed',
          referenceNumber,
          error: result.error,
        }),
      );
    }
  } catch (error) {
    console.error(
      JSON.stringify({
        event: 'lead_confirmation_error',
        referenceNumber,
        message: error instanceof Error ? error.message : 'unknown',
      }),
    );
  }
}

/**
 * Caso de uso: alta de lead de presupuesto + proyecto (GTK-28).
 */
export async function createBudgetLead(
  input: BudgetLeadInput,
): Promise<CreateBudgetLeadResult> {
  const result = await db.$transaction(async (tx) => {
    const { service, province, workTypology } = await resolveCatalogIds(
      tx,
      input,
    );
    const contact = await upsertContact(tx, {
      fullName: input.nombre,
      email: input.email,
      phone: input.telefono,
      company: input.empresa,
      professionalRole: input.rol,
      provinceId: province.id,
    });
    const referenceNumber = await generateUniqueReferenceNumber(tx, 'PRE');
    const initialStateId = await findInitialProjectStateId(tx);

    const lead = await tx.lead.create({
      data: {
        contactId: contact.id,
        referenceNumber,
        leadType: LeadType.presupuesto,
        channel: LeadChannel.formulario,
        source: deriveLeadSource({
          utmSource: input.utmSource,
          utmMedium: input.utmMedium,
          utmCampaign: input.utmCampaign,
          landingUrl: input.landingUrl,
        }),
        serviceId: service.id,
        provinceId: province.id,
        workTypologyId: workTypology?.id ?? null,
        projectData: buildProjectData(input),
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
      service,
      province,
      initialStateId,
    });

    return {
      referenceNumber,
      leadId: lead.id,
      serviceName: service.name,
      provinceName: province.name,
    };
  });

  await sendConfirmationBestEffort(
    input,
    result.referenceNumber,
    result.serviceName,
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
      serviceSlug: input.servicio,
      provinceSlug: input.provincia,
      leadType: 'presupuesto',
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
