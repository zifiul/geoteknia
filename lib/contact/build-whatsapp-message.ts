export const WHATSAPP_DEFAULT_MESSAGE =
  'Hola, me gustaría información sobre {{servicio}} en {{provincia}}.';

export type WhatsAppMessageLabels = {
  servicio?: string;
  provincia?: string;
};

export function interpolateWhatsAppTemplate(
  template: string,
  labels: WhatsAppMessageLabels,
): string {
  const servicio = labels.servicio?.trim() ?? '';
  const provincia = labels.provincia?.trim() ?? '';
  return template
    .replaceAll('{{servicio}}', servicio)
    .replaceAll('{{provincia}}', provincia)
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function buildWhatsAppMessage(
  template: string | null | undefined,
  labels: WhatsAppMessageLabels,
): string {
  const base = template?.trim() || WHATSAPP_DEFAULT_MESSAGE;
  return interpolateWhatsAppTemplate(base, labels);
}

export function humanizeSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
