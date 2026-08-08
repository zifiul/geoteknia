export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type EmailSendResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/**
 * Puerto de infraestructura para el envío de correo (DIP/ISP,
 * ver docs/technical/backend-standards.md §3.4).
 * El dominio depende de esta interfaz, nunca de un proveedor concreto.
 */
export interface EmailSender {
  send(message: EmailMessage): Promise<EmailSendResult>;
}
