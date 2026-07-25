import 'server-only';

import { LeadChannel, LeadType } from '@prisma/client';

import { recordConversionEvent } from '@/lib/analytics/record-event';
import { db } from '@/lib/db';
import { sendLeadConfirmation } from '@/lib/email';
import {
  createProjectFromLead,
  findInitialProjectStateId,
} from '@/lib/projects/create-project-from-lead';

import { deriveLeadSource } from './attribution';
import { generateUniqueReferenceNumber } from './reference';
import type { ResourceLeadInput } from './schema';
import { upsertContact } from './upsert-contact';

export type LeadMagnetTarget = {
  id: string;
  title: string;
  slug: string;
  thankYouUrl: string;
  fileId: string;
  serviceId: string | null;
};

export type CreateResourceLeadResult = {
  referenceNumber: string;
  downloadUrl: string;
  thankYouUrl: string;
  leadId: string;
};

async function sendConfirmationBestEffort(
  input: ResourceLeadInput,
  leadMagnet: LeadMagnetTarget,
  referenceNumber: string,
): Promise<void> {
  try {
    const result = await sendLeadConfirmation({
      to: input.email,
      referenceNumber,
      serviceName: leadMagnet.title,
      province: 'Por determinar',
      technicianName: null,
    });
    if (!result.ok) {
      console.error(
        JSON.stringify({
          event: 'resource_lead_confirmation_failed',
          referenceNumber,
          error: result.error,
        }),
      );
    }
  } catch (error) {
    console.error(
      JSON.stringify({
        event: 'resource_lead_confirmation_error',
        referenceNumber,
        message: error instanceof Error ? error.message : 'unknown',
      }),
    );
  }
}

/**
 * Genera la URL de descarga segura/protegida (token de un solo uso / no listado en el MVP).
 * Evita exponer la file_url interna de media_assets.
 */
function generateDownloadUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/api/recursos/download?token=${token}`;
}

/**
 * Caso de uso: descarga de lead magnet gated (GTK-30).
 */
export async function createResourceLead(
  input: ResourceLeadInput,
  leadMagnet: LeadMagnetTarget,
): Promise<CreateResourceLeadResult> {
  const result = await db.$transaction(async (tx) => {
    const contact = await upsertContact(tx, {
      fullName: input.nombre,
      email: input.email,
      phone: input.telefono,
      company: input.empresa,
      professionalRole: input.rol,
    });

    const referenceNumber = await generateUniqueReferenceNumber(tx, 'REC');
    const initialStateId = await findInitialProjectStateId(tx);

    const lead = await tx.lead.create({
      data: {
        contactId: contact.id,
        referenceNumber,
        leadType: LeadType.recurso,
        channel: LeadChannel.lead_magnet,
        leadMagnetId: leadMagnet.id,
        source: deriveLeadSource({
          utmSource: input.utmSource,
          utmMedium: input.utmMedium,
          utmCampaign: input.utmCampaign,
          landingUrl: input.landingUrl,
        }),
        serviceId: leadMagnet.serviceId,
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
      province: null,
      initialStateId,
      titlePrefix: `Recurso: ${leadMagnet.title}`,
    });

    return {
      referenceNumber,
      leadId: lead.id,
    };
  });

  await sendConfirmationBestEffort(input, leadMagnet, result.referenceNumber);

  const source = deriveLeadSource({
    utmSource: input.utmSource,
    utmMedium: input.utmMedium,
    utmCampaign: input.utmCampaign,
    landingUrl: input.landingUrl,
  });

  try {
    await recordConversionEvent({
      eventName: 'resource_download',
      leadId: result.leadId,
      leadType: 'recurso',
      source,
    });
  } catch {
    // best-effort
  }

  // MVP: Token derivado del leadId para descarga un solo uso
  const downloadToken = Buffer.from(`${result.leadId}:${leadMagnet.id}`).toString('base64url');

  return {
    referenceNumber: result.referenceNumber,
    downloadUrl: generateDownloadUrl(downloadToken),
    thankYouUrl: leadMagnet.thankYouUrl,
    leadId: result.leadId,
  };
}
