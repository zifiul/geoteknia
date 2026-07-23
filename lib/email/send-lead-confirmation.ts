import 'server-only';

import { createElement } from 'react';
import { z } from 'zod';

import { sendEmail } from './client';
import {
  getLeadConfirmationResendId,
  hasLeadConfirmationBeenSent,
  registerLeadConfirmationSent,
} from './idempotency';
import {
  buildLeadConfirmationSubject,
  resolveTechnicianDisplayName,
} from './templates/lead-confirmation';
import { LeadConfirmationEmail } from './templates/lead-confirmation-email';

export class LeadConfirmationValidationError extends Error {
  constructor(cause: z.ZodError) {
    super('Entrada de confirmación de lead inválida');
    this.name = 'LeadConfirmationValidationError';
    this.cause = cause;
  }
}

const sendLeadConfirmationInputSchema = z.object({
  to: z.email(),
  referenceNumber: z.string().min(1).max(50),
  technicianName: z.string().max(200).nullable().optional(),
  serviceName: z.string().min(1).max(200),
  province: z.string().min(1).max(100),
});

export type SendLeadConfirmationInput = z.infer<
  typeof sendLeadConfirmationInputSchema
>;

export type SendLeadConfirmationResult =
  | { ok: true; id: string; skipped?: false }
  | { ok: true; skipped: true; id: string }
  | { ok: false; error: string };

/**
 * Envía la confirmación transaccional de lead (RF-Q3 / US-12).
 *
 * - Degradación elegante: no lanza ante fallo de Resend.
 * - Idempotente por referenceNumber (registro in-memory MVP).
 * - Logs: solo referenceNumber + id Resend, sin PII del cuerpo.
 */
export async function sendLeadConfirmation(
  input: SendLeadConfirmationInput,
): Promise<SendLeadConfirmationResult> {
  const parsed = sendLeadConfirmationInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new LeadConfirmationValidationError(parsed.error);
  }

  const { to, referenceNumber, technicianName, serviceName, province } =
    parsed.data;

  if (hasLeadConfirmationBeenSent(referenceNumber)) {
    const existingId = getLeadConfirmationResendId(referenceNumber)!;
    return { ok: true, skipped: true, id: existingId };
  }

  const technicianDisplayName = resolveTechnicianDisplayName(technicianName);
  const subject = buildLeadConfirmationSubject(referenceNumber);

  const result = await sendEmail({
    to,
    subject,
    react: createElement(LeadConfirmationEmail, {
      referenceNumber,
      technicianName: technicianDisplayName,
      serviceName,
      province,
    }),
  });

  if (!result.ok) {
    console.error('[email] lead confirmation failed', {
      referenceNumber,
      error: result.error,
    });
    return result;
  }

  registerLeadConfirmationSent(referenceNumber, result.id);

  console.info('[email] lead confirmation sent', {
    referenceNumber,
    resendId: result.id,
  });

  return result;
}
