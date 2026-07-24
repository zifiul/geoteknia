import type { LeadSource } from '@prisma/client';

export type AttributionInput = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingUrl?: string;
};

/**
 * Deriva LeadSource desde UTM/landing (función pura, GTK-28).
 */
export function deriveLeadSource(input: AttributionInput): LeadSource {
  const medium = input.utmMedium?.toLowerCase() ?? '';
  const source = input.utmSource?.toLowerCase() ?? '';

  if (medium === 'cpc' || medium === 'ppc') {
    return 'sem';
  }

  const organicSources = new Set([
    'google',
    'bing',
    'yahoo',
    'duckduckgo',
    'ecosia',
  ]);
  if (organicSources.has(source)) {
    return 'organico';
  }

  if (input.landingUrl) {
    try {
      const host = new URL(input.landingUrl).hostname.toLowerCase();
      const ownHosts = new Set(['geoteknia.es', 'www.geoteknia.es', 'localhost']);
      if (!ownHosts.has(host)) {
        return 'referral';
      }
    } catch {
      // URL inválida ya filtrada por Zod; tratar como directo
    }
  }

  return 'directo';
}
