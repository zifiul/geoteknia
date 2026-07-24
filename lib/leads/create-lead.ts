import 'server-only';

import type { Contact, Lead, Prisma } from '@prisma/client';
import { LeadChannel, LeadType } from '@prisma/client';

import { sendLeadConfirmation } from '@/lib/email';
import { db } from '@/lib/db';
import { recordConversionEvent } from '@/lib/analytics/record-event';

import { deriveLeadSource } from './attribution';
import { LeadCaptureError } from './errors';
import {
  formatReferenceNumberCandidate,
  MAX_REFERENCE_GENERATION_ATTEMPTS,
} from './reference';
import type { BudgetLeadInput } from './schema';
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

async function upsertContactForLead(
  tx: Prisma.TransactionClient,
  input: BudgetLeadInput,
  provinceId: string,
): Promise<Contact> {
  const existing = await tx.contact.findFirst({
    where: {
      deletedAt: null,
      OR: [{ email: input.email }, { phone: input.telefono }],
    },
  });

  if (!existing) {
    return tx.contact.create({
      data: {
        fullName: input.nombre,
        email: input.email,
        phone: input.telefono,
        company: input.empresa ?? null,
        professionalRole: input.rol,
        provinceId,
      },
    });
  }

  return tx.contact.update({
    where: { id: existing.id },
    data: {
      fullName: existing.fullName ?? input.nombre,
      email: existing.email ?? input.email,
      phone: existing.phone ?? input.telefono,
      company: existing.company ?? input.empresa ?? null,
      professionalRole: existing.professionalRole ?? input.rol,
      provinceId: existing.provinceId ?? provinceId,
    },
  });
}

async function generateUniqueReferenceNumber(
  tx: Prisma.TransactionClient,
): Promise<string> {
  for (let attempt = 0; attempt < MAX_REFERENCE_GENERATION_ATTEMPTS; attempt += 1) {
    const candidate = formatReferenceNumberCandidate();
    const clash = await tx.lead.findUnique({
      where: { referenceNumber: candidate },
      select: { id: true },
    });
    if (!clash) {
      return candidate;
    }
  }
  throw new LeadCaptureError(
    'REFERENCE_GENERATION_FAILED',
    500,
    'No se pudo generar un número de referencia único',
  );
}

function buildProjectData(input: BudgetLeadInput): Prisma.InputJsonValue | undefined {
  const data: Record<string, unknown> = {};
  if (input.plantas !== undefined) data.plantas = input.plantas;
  if (input.superficie !== undefined) data.superficie = input.superficie;
  if (input.fase !== undefined) data.fase = input.fase;
  return Object.keys(data).length > 0 ? data : undefined;
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
    const contact = await upsertContactForLead(tx, input, province.id);
    const referenceNumber = await generateUniqueReferenceNumber(tx);
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

  // GTK-32: telemetría generate_lead post-commit (best-effort, no bloquea el alta).
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
    // best-effort: nunca altera el resultado del alta
  }

  return {
    referenceNumber: result.referenceNumber,
    leadId: result.leadId,
  };
}
