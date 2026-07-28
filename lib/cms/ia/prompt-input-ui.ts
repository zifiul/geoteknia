import type { PromptPageType } from '@prisma/client';

import { PROMPT_TEMPLATE_SEEDS } from '@/lib/content/prompt-templates.seed';

export type PromptInputField = {
  name: string;
  type: 'string' | 'string[]';
  required: boolean;
  label: string;
};

const FIELD_LABELS: Record<string, string> = {
  serviceName: 'Nombre del servicio',
  primaryKeyword: 'Keyword principal',
  secondaryKeywords: 'Keywords secundarias',
  provinceName: 'Provincia',
  geologyNotes: 'Contexto geológico',
  normativa: 'Normativa aplicable',
  topic: 'Tema del artículo',
  question: 'Pregunta FAQ',
};

function labelForField(name: string): string {
  return FIELD_LABELS[name] ?? name;
}

export function getPromptInputFieldsForPageType(
  pageType: PromptPageType,
): PromptInputField[] {
  const seed = PROMPT_TEMPLATE_SEEDS.find((row) => row.pageType === pageType);
  if (!seed) return [];
  const schema = seed.inputSchema as {
    properties?: Record<string, { type?: string; items?: { type?: string } }>;
    required?: string[];
  };
  const required = new Set(schema.required ?? []);
  const properties = schema.properties ?? {};
  return Object.entries(properties).map(([name, def]) => {
    const isArray = def.type === 'array' && def.items?.type === 'string';
    return {
      name,
      type: isArray ? 'string[]' : 'string',
      required: required.has(name),
      label: labelForField(name),
    };
  });
}
