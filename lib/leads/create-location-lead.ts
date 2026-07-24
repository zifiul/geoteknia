import 'server-only';

import type { Province, Prisma } from '@prisma/client';
import { LeadChannel, LeadType, Prisma as PrismaRuntime } from '@prisma/client';

import { recordConversionEvent } from '@/lib/analytics/record-event';
import { sendLeadConfirmation } from '@/lib/email';
import { db } from '@/lib/db';

import { deriveLeadSource } from './attribution';
import { LeadCaptureError } from './errors';
import { generateUniqueReferenceNumber } from './reference';
import type { LocationLeadInput } from './schema';
import { upsertContact } from './upsert-contact';
import {
  createProjectFromLead,
  findInitialProjectStateId,
} from '@/lib/projects/create-project-from-lead';

export type CreateLocationLeadResult = {
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

async function sendConfirmationBestEffort(
  input: LocationLeadInput,
  referenceNumber: string,
  provinceName: string,
): Promise<void> {
  if (!input.email) {
    return;
  }
  try {
    const result = await sendLeadConfirmation({
      to: input.email,
      referenceNumber,
      serviceName: 'Solicitud de ubicación',
      province: provinceName,
      technicianName: null,
    });
    if (!result.ok) {
      console.error(
        JSON.stringify({
          event: 'location_lead_confirmation_failed',
          referenceNumber,
          error: result.error,
        }),
      );
    }
  } catch (error) {
    console.error(
      JSON.stringify({
        event: 'location_lead_confirmation_error',
        referenceNumber,
        message: error instanceof Error ? error.message : 'unknown',
      }),
    );
  }
}

/**
 * Caso de uso: microconversión ubicación (GTK-29).
 */
export async function createLocationLead(
  input: LocationLeadInput,
): Promise<CreateLocationLeadResult> {
  const result = await db.$transaction(async (tx) => {
    const province = await resolveProvinceOptional(tx, input.provincia);
    const contact = await upsertContact(tx, {
      fullName: input.nombre,
      email: input.email,
      phone: input.telefono,
      provinceId: province?.id,
    });
    const referenceNumber = await generateUniqueReferenceNumber(tx, 'UBI');
    const initialStateId = await findInitialProjectStateId(tx);

    const lead = await tx.lead.create({
      data: {
        contactId: contact.id,
        referenceNumber,
        leadType: LeadType.ubicacion,
        channel: LeadChannel.ubicacion,
        source: deriveLeadSource({
          utmSource: input.utmSource,
          utmMedium: input.utmMedium,
          utmCampaign: input.utmCampaign,
          landingUrl: input.landingUrl,
        }),
        serviceId: null,
        provinceId: province?.id ?? null,
        cadastralRef: input.cadastralRef ?? null,
        mapLat:
          input.mapLat !== undefined
            ? new PrismaRuntime.Decimal(input.mapLat)
            : null,
        mapLng:
          input.mapLng !== undefined
            ? new PrismaRuntime.Decimal(input.mapLng)
            : null,
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
      titlePrefix: 'Ubicación',
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
      eventName: 'send_location',
      leadId: result.leadId,
      provinceSlug: result.provinceSlug ?? undefined,
      leadType: 'ubicacion',
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
