import { NextRequest, NextResponse } from 'next/server';

import { recordConversionEvent } from '@/lib/analytics/record-event';
import { calculateAlcance } from '@/lib/calculator/calculate-alcance';
import { CalculatorFormulaError } from '@/lib/calculator/estimate';
import { calculatorInputSchema } from '@/lib/calculator/schema';
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
  const ip = extractClientIp(request);
  const { publicPerMin } = readRateLimitEnv();
  const rate = checkRateLimit(`calculadora:${ip}`, publicPerMin, 60_000);
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
      message: 'Cuerpo JSON inválido.',
    });
  }

  const parsed = calculatorInputSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, {
      code: 'VALIDATION_ERROR',
      message: 'Datos de entrada inválidos.',
      details: zodFieldDetails(parsed.error.issues),
    });
  }

  const input = parsed.data;

  try {
    const outcome = await calculateAlcance(input);

    if (outcome.kind === 'catalog') {
      return apiError(400, {
        code: 'VALIDATION_ERROR',
        message:
          outcome.field === 'tipoObra'
            ? 'Tipología de obra no válida.'
            : 'Provincia no válida.',
        details: [{ path: outcome.field, message: 'No encontrado' }],
      });
    }

    if (outcome.kind === 'no_rule') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_APPLICABLE_RULE',
            message: outcome.message,
          },
          data: { prefill: outcome.prefill },
        },
        { status: 422 },
      );
    }

    void recordConversionEvent({
      eventName: 'calculator_use',
      provinceSlug: input.provincia,
      serviceSlug: input.tipoObra,
      value: outcome.boreholes,
    }).catch(() => undefined);

    console.info('calculadora.estimate', {
      tipoObra: input.tipoObra,
      provincia: input.provincia,
      boreholes: outcome.boreholes,
    });

    return apiSuccess(outcome.data, 200);
  } catch (error) {
    if (error instanceof CalculatorFormulaError) {
      console.error('calculadora.formula_invalid', {
        tipoObra: input.tipoObra,
      });
      return apiError(500, {
        code: 'INTERNAL_ERROR',
        message: 'No se pudo calcular el alcance en este momento.',
      });
    }
    console.error('calculadora.unexpected', { tipoObra: input.tipoObra });
    return apiError(500, {
      code: 'INTERNAL_ERROR',
      message: 'Error interno del servidor.',
    });
  }
}
