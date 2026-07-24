import { NextRequest } from 'next/server';

import { createLocationLead } from '@/lib/leads/create-location-lead';
import { LeadCaptureError } from '@/lib/leads/errors';
import { locationLeadSchema } from '@/lib/leads/schema';
import {
  apiError,
  apiSuccess,
  zodFieldDetails,
} from '@/lib/http/api-envelope';
import { readRateLimitEnv } from '@/lib/security/rate-limit-env';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { verifyTurnstileToken } from '@/lib/security/turnstile';

function extractClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return 'unknown';
}

export async function POST(request: NextRequest) {
  const ip = extractClientIp(request);
  const { publicPerMin } = readRateLimitEnv();
  const rate = checkRateLimit(`leads-ubicacion:${ip}`, publicPerMin, 60_000);
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, {
      code: 'VALIDATION_ERROR',
      message: 'Cuerpo JSON inválido',
    });
  }

  const parsed = locationLeadSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, {
      code: 'VALIDATION_ERROR',
      message: 'Los datos enviados no son válidos',
      details: zodFieldDetails(parsed.error.issues),
    });
  }

  const turnstile = await verifyTurnstileToken(
    parsed.data.turnstileToken,
    ip !== 'unknown' ? ip : undefined,
  );
  if (!turnstile.ok) {
    if (turnstile.reason === 'unavailable') {
      return apiError(502, {
        code: 'TURNSTILE_UNAVAILABLE',
        message: 'No se pudo verificar el anti-spam. Inténtelo más tarde.',
      });
    }
    return apiError(403, {
      code: 'TURNSTILE_INVALID',
      message: 'Verificación anti-spam no válida',
    });
  }

  try {
    const { referenceNumber } = await createLocationLead(parsed.data);
    console.info(
      JSON.stringify({
        event: 'location_lead_created',
        referenceNumber,
      }),
    );
    return apiSuccess({ referenceNumber }, 201);
  } catch (error) {
    if (error instanceof LeadCaptureError) {
      return apiError(error.status, {
        code: error.code,
        message: error.message,
        details: error.details,
      });
    }
    console.error(
      JSON.stringify({
        event: 'location_lead_unexpected_error',
        message: error instanceof Error ? error.message : 'unknown',
      }),
    );
    return apiError(500, {
      code: 'INTERNAL_ERROR',
      message: 'Error interno del servidor',
    });
  }
}
