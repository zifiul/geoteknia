import { withRoutePermission } from '@/lib/auth/rbac';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { generateContentSchema } from '@/lib/ia/content-generation-schemas';
import { generateContent } from '@/lib/ia/content-generation';
import { BudgetExceededError } from '@/lib/ia/errors';
import {
  apiError,
  apiSuccess,
  zodFieldDetails,
} from '@/lib/http/api-envelope';

function extractClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return null;
}

async function handlePost(
  user: PortalSessionPayload,
  request: Request,
): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, {
      code: 'VALIDATION_ERROR',
      message: 'Cuerpo JSON inválido',
    });
  }

  const parsed = generateContentSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, {
      code: 'VALIDATION_ERROR',
      message: 'Los datos enviados no son válidos',
      details: zodFieldDetails(
        parsed.error.issues as { path: (string | number)[]; message: string }[],
      ),
    });
  }

  const ip = extractClientIp(request);
  const userAgent = request.headers.get('user-agent');

  try {
    const result = await generateContent(user, parsed.data, {
      ip,
      userAgent: userAgent ? userAgent.slice(0, 512) : null,
    });

    if (!result.ok) {
      switch (result.error.kind) {
        case 'template_not_found':
          return apiError(400, {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'No hay plantilla activa para el tipo de página indicado',
          });
        case 'template_inputs_invalid':
          return apiError(400, {
            code: 'VALIDATION_ERROR',
            message: result.error.message,
            details: result.error.path
              ? [{ path: result.error.path, message: result.error.message }]
              : undefined,
          });
        case 'section_invalid':
          return apiError(400, {
            code: 'VALIDATION_ERROR',
            message: 'Sección de regeneración no válida',
          });
        case 'parent_invalid':
          return apiError(400, {
            code: 'VALIDATION_ERROR',
            message: 'Generación padre no válida',
          });
        case 'claude_error':
          return apiError(502, {
            code: 'AI_GENERATION_FAILED',
            message: 'No se pudo completar la generación con el modelo de IA',
          });
        case 'budget_exceeded':
          return apiError(429, {
            code: 'BUDGET_EXCEEDED',
            message: 'Presupuesto mensual de IA alcanzado',
          });
        default:
          return apiError(500, {
            code: 'INTERNAL_ERROR',
            message: 'Error interno',
          });
      }
    }

    const { data } = result;
    return apiSuccess(
      {
        generationId: data.generationId,
        status: data.status,
        output: data.output,
        partialReason: data.partialReason,
        pageType: data.pageType,
        model: data.model,
        promptTemplateId: data.promptTemplateId,
      },
      201,
    );
  } catch (error) {
    if (error instanceof BudgetExceededError) {
      return apiError(429, {
        code: error.code,
        message: error.message,
      });
    }
    throw error;
  }
}

export const POST = withRoutePermission('ai.generate', handlePost);
