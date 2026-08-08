import 'server-only';

import type { ReactElement } from 'react';

import type { EmailSender } from './email-sender';
import { renderReactEmail } from './render-react-email';
import { createSmtpEmailSender } from './smtp-email-sender';

export type SendEmailInput = {
  to: string;
  subject: string;
  react: ReactElement;
};

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

let emailSender: EmailSender | null = null;

function getEmailSender(): EmailSender {
  if (emailSender === null) {
    emailSender = createSmtpEmailSender();
  }
  return emailSender;
}

/** Expuesto para tests: sustituir el EmailSender activo. */
export function setEmailSenderForTests(sender: EmailSender | null): void {
  emailSender = sender;
}

/**
 * Envía un email transaccional con plantilla React.
 * Retorno tipado; no lanza ante fallo del proveedor.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const { html, text } = await renderReactEmail(input.react);

  return getEmailSender().send({
    to: input.to,
    subject: input.subject,
    html,
    text,
  });
}
