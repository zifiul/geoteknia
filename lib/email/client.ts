import 'server-only';

import type { ReactElement } from 'react';
import { Resend } from 'resend';

import { env } from '@/lib/env';

export type SendEmailInput = {
  to: string;
  subject: string;
  react: ReactElement;
};

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (resendClient === null) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}

/** Expuesto para tests: sustituir la instancia singleton de Resend. */
export function setResendClientForTests(client: Resend | null): void {
  resendClient = client;
}

/**
 * Envía un email transaccional vía Resend con plantilla React.
 * Retorno tipado; no lanza ante fallo del proveedor.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const { data, error } = await getResendClient().emails.send({
    from: env.EMAIL_FROM,
    to: input.to,
    replyTo: env.EMAIL_REPLY_TO,
    subject: input.subject,
    react: input.react,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data?.id) {
    return { ok: false, error: 'Respuesta de Resend sin id de envío' };
  }

  return { ok: true, id: data.id };
}
