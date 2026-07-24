import 'server-only';

import {
  AiGenerationStatus,
  AuditAction,
  Prisma,
  type AiModel,
  type PromptPageType,
  type PromptTemplate,
} from '@prisma/client';

import { recordAudit } from '@/lib/audit/log';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { db } from '@/lib/db';

import type { GenerateContentInput } from './content-generation-schemas';
import { assertWithinBudget } from './budget';
import { BudgetExceededError } from './errors';
import { runGeneration } from './generate';
import {
  generationOutputSchema,
  isRegenerationSection,
  sectionOutputSchema,
  type GenerationOutput,
} from './output-schema';
import { persistTokenUsage } from './token-usage';
import { renderPromptTemplate } from './render-prompt-template';
import { validateTemplateInputs } from './template-input-validator';
import { parseStructuredModelText } from './parse-model-json';

const JSON_OUTPUT_INSTRUCTION = `
Responde ÚNICAMENTE con un objeto JSON válido (sin markdown ni texto adicional) con estas claves:
h1 (string), h2h3 (array de { level: "h2"|"h3", text: string }), body (string),
metaTitle (string, máx 60 caracteres), metaDescription (string, máx 155 caracteres),
schemaSuggestion (string, opcional), internalLinks (array opcional de { anchor, url }).
`.trim();

export type GenerateContentSuccess = {
  generationId: string;
  status: 'success' | 'partial';
  output: GenerationOutput | null;
  partialReason?: string;
  pageType: PromptPageType;
  model: AiModel;
  promptTemplateId: string;
};

export type GenerateContentFailure =
  | { kind: 'template_not_found' }
  | { kind: 'template_inputs_invalid'; message: string; path?: string }
  | { kind: 'section_invalid' }
  | { kind: 'parent_invalid' }
  | { kind: 'claude_error' }
  | { kind: 'budget_exceeded' };

export type GenerateContentResult =
  | { ok: true; data: GenerateContentSuccess }
  | { ok: false; error: GenerateContentFailure };

async function resolveTemplate(
  pageType: PromptPageType,
  templateId?: string,
): Promise<PromptTemplate | null> {
  if (templateId) {
    return db.promptTemplate.findFirst({
      where: { id: templateId, isActive: true, deletedAt: null },
    });
  }
  return db.promptTemplate.findFirst({
    where: { pageType, isActive: true, deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });
}

function buildUserMessage(
  template: PromptTemplate,
  inputs: Record<string, unknown>,
  section?: string,
): string {
  const rendered = renderPromptTemplate(template.templateBody, inputs);
  const sectionHint = section
    ? `\nRegenera únicamente la sección "${section}" del contenido.`
    : '';
  return `${rendered}${sectionHint}\n\n${JSON_OUTPUT_INSTRUCTION}`;
}

async function validateParentGeneration(
  input: GenerateContentInput,
): Promise<{ ok: true; parentId: string } | { ok: false }> {
  const regen = input.regenerateSection;
  if (!regen) {
    return { ok: true, parentId: '' };
  }

  if (!isRegenerationSection(regen.section)) {
    return { ok: false };
  }

  const parent = await db.aiGeneration.findFirst({
    where: { id: regen.parentGenerationId, deletedAt: null },
  });
  if (!parent) {
    return { ok: false };
  }

  if (input.targetContentType && parent.targetContentType !== input.targetContentType) {
    return { ok: false };
  }
  if (input.targetContentId && parent.targetContentId !== input.targetContentId) {
    return { ok: false };
  }

  return { ok: true, parentId: parent.id };
}

export async function generateContent(
  user: PortalSessionPayload,
  input: GenerateContentInput,
  auditContext: { ip: string | null; userAgent: string | null },
): Promise<GenerateContentResult> {
  try {
    await assertWithinBudget();
  } catch (error) {
    if (error instanceof BudgetExceededError) {
      return { ok: false, error: { kind: 'budget_exceeded' } };
    }
    throw error;
  }

  if (input.regenerateSection && !isRegenerationSection(input.regenerateSection.section)) {
    return { ok: false, error: { kind: 'section_invalid' } };
  }

  const parentCheck = await validateParentGeneration(input);
  if (!parentCheck.ok) {
    return { ok: false, error: { kind: 'parent_invalid' } };
  }

  const template = await resolveTemplate(input.pageType, input.templateId);
  if (!template) {
    return { ok: false, error: { kind: 'template_not_found' } };
  }

  const inputValidation = validateTemplateInputs(
    template.inputSchema,
    input.inputs as Record<string, unknown>,
  );
  if (!inputValidation.ok) {
    return {
      ok: false,
      error: {
        kind: 'template_inputs_invalid',
        message: inputValidation.message,
        path: inputValidation.path,
      },
    };
  }

  const model = input.model ?? template.defaultModel;
  const userMessage = buildUserMessage(
    template,
    input.inputs as Record<string, unknown>,
    input.regenerateSection?.section,
  );
  const renderedPrompt = renderPromptTemplate(template.templateBody, input.inputs as Record<string, unknown>);

  const generation = await db.aiGeneration.create({
    data: {
      promptTemplateId: template.id,
      requestedById: user.userId,
      model,
      inputParams: input.inputs as Prisma.InputJsonValue,
      renderedPrompt,
      status: AiGenerationStatus.retrying,
      retryCount: 0,
      targetContentType: input.targetContentType ?? null,
      targetContentId: input.targetContentId ?? null,
      isSectionRegeneration: Boolean(input.regenerateSection),
      parentGenerationId: input.regenerateSection?.parentGenerationId ?? null,
    },
  });

  const genResult = await runGeneration({
    model,
    userMessage,
    cacheablePrefix: template.cacheablePrefix ?? undefined,
  });

  if (!genResult.ok) {
    await db.aiGeneration.update({
      where: { id: generation.id },
      data: {
        status: AiGenerationStatus.error,
        errorMessage: 'Error al invocar el modelo de IA',
        latencyMs: genResult.latencyMs,
        outputText: null,
      },
    });
    return { ok: false, error: { kind: 'claude_error' } };
  }

  let parsed: unknown;
  try {
    parsed = parseStructuredModelText(genResult.text);
  } catch {
    parsed = null;
  }

  const outputSchema = input.regenerateSection?.section
    ? sectionOutputSchema(input.regenerateSection.section as Parameters<typeof sectionOutputSchema>[0])
    : generationOutputSchema;

  const validated = outputSchema.safeParse(parsed);
  const truncated = genResult.status === 'partial';
  let finalStatus: AiGenerationStatus;
  let output: GenerationOutput | null = null;
  let partialReason: string | undefined;
  let structured: object | undefined;

  if (truncated || !validated.success) {
    finalStatus = AiGenerationStatus.partial;
    partialReason = truncated
      ? 'La respuesta del modelo fue truncada'
      : 'La salida no cumple el formato estructurado esperado';
  } else {
    finalStatus = AiGenerationStatus.success;
    structured = validated.data as object;
    output = input.regenerateSection ? null : (validated.data as GenerationOutput);
  }

  await db.$transaction(async (tx) => {
    await tx.aiGeneration.update({
      where: { id: generation.id },
      data: {
        status: finalStatus,
        outputText: genResult.text,
        outputStructured: structured,
        latencyMs: genResult.latencyMs,
        errorMessage: partialReason ?? null,
      },
    });
    await persistTokenUsage(generation.id, genResult.usage, genResult.model, tx);
  });

  try {
    await recordAudit({
      userId: user.userId,
      action: AuditAction.ai_generate,
      entityType: 'ai_generations',
      entityId: generation.id,
      ip: auditContext.ip,
      userAgent: auditContext.userAgent,
      metadata: {
        generationId: generation.id,
        pageType: input.pageType,
        model,
        promptTemplateId: template.id,
      },
    });
  } catch {
    // best-effort
  }

  return {
    ok: true,
    data: {
      generationId: generation.id,
      status: finalStatus === AiGenerationStatus.success ? 'success' : 'partial',
      output: structured ? (structured as GenerationOutput) : null,
      partialReason,
      pageType: input.pageType,
      model: genResult.model,
      promptTemplateId: template.id,
    },
  };
}
