import 'server-only';

import nodemailer, { type Transporter } from 'nodemailer';

import { env } from '@/lib/env';

import type { EmailMessage, EmailSendResult, EmailSender } from './email-sender';

const SMTP_TIMEOUT_MS = 10_000;

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter === null) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
      connectionTimeout: SMTP_TIMEOUT_MS,
      greetingTimeout: SMTP_TIMEOUT_MS,
      socketTimeout: SMTP_TIMEOUT_MS,
    });
  }
  return transporter;
}

/** Expuesto para tests: sustituir el transporter singleton. */
export function setSmtpTransporterForTests(client: Transporter | null): void {
  transporter = client;
}

/**
 * Adaptador de EmailSender para SMTP (Zoho Mail).
 * Degradación elegante: no lanza ante fallo del proveedor.
 */
export function createSmtpEmailSender(): EmailSender {
  return {
    async send(message: EmailMessage): Promise<EmailSendResult> {
      try {
        const info = await getTransporter().sendMail({
          from: env.EMAIL_FROM,
          replyTo: env.EMAIL_REPLY_TO,
          to: message.to,
          subject: message.subject,
          html: message.html,
          text: message.text,
        });

        if (!info?.messageId) {
          return { ok: false, error: 'Respuesta SMTP sin messageId' };
        }

        return { ok: true, id: info.messageId };
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : 'Error SMTP desconocido',
        };
      }
    },
  };
}
