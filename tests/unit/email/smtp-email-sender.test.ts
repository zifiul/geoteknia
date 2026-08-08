/**
 * Tests de lib/email/smtp-email-sender.ts — adaptador SMTP (Zoho Mail).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const sendMailMock = vi.fn();
const createTransportMock = vi.fn((...args: unknown[]) => {
  void args;
  return { sendMail: sendMailMock };
});

vi.mock('nodemailer', () => ({
  default: { createTransport: (...args: unknown[]) => createTransportMock(...args) },
}));

vi.mock('@/lib/env', () => ({
  env: {
    SMTP_HOST: 'smtp.zoho.eu',
    SMTP_PORT: 587,
    SMTP_SECURE: false,
    SMTP_USER: 'info@geoteknius.com',
    SMTP_PASSWORD: 'test-password',
    EMAIL_FROM: 'Geoteknius <info@geoteknius.com>',
    EMAIL_REPLY_TO: 'info@geoteknius.com',
  },
}));

const message = {
  to: 'lead@empresa.com',
  subject: 'Confirmación de solicitud — Ref. PRE-1',
  html: '<p>Hola</p>',
  text: 'Hola',
};

describe('lib/email/smtp-email-sender — createSmtpEmailSender', () => {
  beforeEach(() => {
    vi.resetModules();
    sendMailMock.mockReset();
    createTransportMock.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('configura el transporte con host, puerto, TLS y credenciales de Zoho', async () => {
    sendMailMock.mockResolvedValue({ messageId: 'msg-1' });

    const { createSmtpEmailSender } = await import('@/lib/email/smtp-email-sender');
    await createSmtpEmailSender().send(message);

    expect(createTransportMock).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.zoho.eu',
        port: 587,
        secure: false,
        auth: { user: 'info@geoteknius.com', pass: 'test-password' },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 10_000,
      }),
    );
  });

  it('envía el mensaje con from/replyTo del entorno y devuelve el messageId', async () => {
    sendMailMock.mockResolvedValue({ messageId: 'msg-abc' });

    const { createSmtpEmailSender } = await import('@/lib/email/smtp-email-sender');
    const result = await createSmtpEmailSender().send(message);

    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'Geoteknius <info@geoteknius.com>',
      replyTo: 'info@geoteknius.com',
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
    expect(result).toEqual({ ok: true, id: 'msg-abc' });
  });

  it('no lanza ante fallo del transporte; devuelve Result de error', async () => {
    sendMailMock.mockRejectedValue(new Error('Connection timeout'));

    const { createSmtpEmailSender } = await import('@/lib/email/smtp-email-sender');
    const result = await createSmtpEmailSender().send(message);

    expect(result).toEqual({ ok: false, error: 'Connection timeout' });
  });

  it('devuelve error si la respuesta SMTP no trae messageId', async () => {
    sendMailMock.mockResolvedValue({});

    const { createSmtpEmailSender } = await import('@/lib/email/smtp-email-sender');
    const result = await createSmtpEmailSender().send(message);

    expect(result).toEqual({ ok: false, error: 'Respuesta SMTP sin messageId' });
  });

  it('reutiliza el mismo transporter entre envíos (singleton perezoso)', async () => {
    sendMailMock.mockResolvedValue({ messageId: 'msg-1' });

    const { createSmtpEmailSender } = await import('@/lib/email/smtp-email-sender');
    const sender = createSmtpEmailSender();
    await sender.send(message);
    await sender.send(message);

    expect(createTransportMock).toHaveBeenCalledOnce();
  });
});
