import type { ZodIssue } from 'zod';

export function sanitizePrefill(value: string | null, max: number): string {
  if (!value) return '';
  return value.trim().slice(0, max);
}

export function readUtmParams(): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingUrl?: string;
} {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source')?.trim();
  const utmMedium = params.get('utm_medium')?.trim();
  const utmCampaign = params.get('utm_campaign')?.trim();
  return {
    ...(utmSource ? { utmSource: utmSource.slice(0, 200) } : {}),
    ...(utmMedium ? { utmMedium: utmMedium.slice(0, 200) } : {}),
    ...(utmCampaign ? { utmCampaign: utmCampaign.slice(0, 200) } : {}),
    landingUrl: window.location.href,
  };
}

export function issuesToFieldErrors<T extends string>(
  issues: ZodIssue[],
): Partial<Record<T | 'global', string>> {
  const map: Partial<Record<T | 'global', string>> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !(key in map)) {
      map[key as T] = issue.message;
    }
  }
  return map;
}

export type LeadApiJson = {
  success?: boolean;
  data?: { referenceNumber?: string };
  error?: { message?: string; code?: string };
};

export type LeadSubmitOutcome =
  | { kind: 'success'; referenceNumber: string }
  | { kind: 'turnstile_invalid' }
  | { kind: 'rate_limited' }
  | { kind: 'validation'; message: string }
  | { kind: 'error'; message: string };

export function interpretLeadSubmitResponse(
  status: number,
  json: LeadApiJson,
  fallbackMessage: string,
): LeadSubmitOutcome {
  if (status === 201 && json.success && json.data?.referenceNumber) {
    return { kind: 'success', referenceNumber: json.data.referenceNumber };
  }
  if (status === 403 && json.error?.code === 'TURNSTILE_INVALID') {
    return { kind: 'turnstile_invalid' };
  }
  if (status === 429) {
    return { kind: 'rate_limited' };
  }
  if (status === 400 && json.error?.message) {
    return { kind: 'validation', message: json.error.message };
  }
  return {
    kind: 'error',
    message: json.error?.message ?? fallbackMessage,
  };
}
