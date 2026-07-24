import { NextRequest } from 'next/server';

import {
  ingestSchema,
  normalizeIngestEvents,
} from '@/lib/analytics/schema';
import { recordConversionEvents } from '@/lib/analytics/record-event';
import {
  apiError,
  apiSuccess,
  zodFieldDetails,
} from '@/lib/http/api-envelope';
import { readRateLimitEnv } from '@/lib/security/rate-limit-env';
import { checkRateLimit } from '@/lib/security/rate-limit';

function extractClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return 'unknown';
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    const text = await request.text();
    body = JSON.parse(text) as unknown;
  } catch {
    return apiError(400, {
      code: 'VALIDATION_ERROR',
      message: 'Cuerpo JSON inválido',
    });
  }

  const parsed = ingestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, {
      code: 'VALIDATION_ERROR',
      message: 'Los datos enviados no son válidos',
      details: zodFieldDetails(parsed.error.issues),
    });
  }

  const events = normalizeIngestEvents(parsed.data);
  const ip = extractClientIp(request);
  const { publicPerMin } = readRateLimitEnv();

  // Contar eventos: N unidades (coste opcional en checkRateLimit).
  const rate = checkRateLimit(
    `eventos:${ip}`,
    publicPerMin,
    60_000,
    events.length,
  );
  if (!rate.allowed) {
    const retryAfterSec = Math.ceil((rate.retryAfterMs ?? 60_000) / 1000);
    return apiError(
      429,
      {
        code: 'RATE_LIMITED',
        message: 'Demasiadas solicitudes. Inténtelo de nuevo más tarde.',
      },
      { 'Retry-After': String(retryAfterSec) },
    );
  }

  try {
    const recorded = await recordConversionEvents(events);
    console.info(
      JSON.stringify({
        event: 'conversion_events_recorded',
        recorded,
        requested: events.length,
      }),
    );
    return apiSuccess({ recorded }, 202);
  } catch (error) {
    console.error(
      JSON.stringify({
        event: 'conversion_events_unexpected_error',
        message: error instanceof Error ? error.message : 'unknown',
      }),
    );
    return apiError(500, {
      code: 'INTERNAL_ERROR',
      message: 'Error interno del servidor',
    });
  }
}
