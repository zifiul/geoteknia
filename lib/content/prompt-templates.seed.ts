import type { AiModel, PromptPageType } from '@prisma/client';

/** Clave natural del seed — única por plantilla en runtime. */
export type PromptTemplateSeed = {
  seedKey: string;
  name: string;
  pageType: PromptPageType;
  templateBody: string;
  inputSchema: Record<string, unknown>;
  defaultModel: AiModel;
  cacheablePrefix: string;
  version: number;
};

const BASE_INSTRUCTIONS =
  'Eres un redactor técnico senior de Geoteknia. Genera contenido SEO original en español (España) para ingeniería geotécnica B2B. Sin PII. Tono profesional y preciso.';

export const PROMPT_TEMPLATE_SEEDS: readonly PromptTemplateSeed[] = [
  {
    seedKey: 'seed-service-v1',
    name: 'Servicio geotécnico — plantilla base',
    pageType: 'service',
    cacheablePrefix: BASE_INSTRUCTIONS,
    defaultModel: 'claude_sonnet_4_6',
    version: 1,
    inputSchema: {
      type: 'object',
      properties: {
        serviceName: { type: 'string' },
        primaryKeyword: { type: 'string' },
        secondaryKeywords: { type: 'array', items: { type: 'string' } },
      },
      required: ['serviceName', 'primaryKeyword'],
    },
    templateBody: `${BASE_INSTRUCTIONS}\n\nServicio: {{serviceName}}\nKeyword principal: {{primaryKeyword}}\nGenera H1, H2-H3, meta title (≤60), meta description (≤155) y párrafo introductorio.`,
  },
  {
    seedKey: 'seed-geo-zone-v1',
    name: 'Geo-landing provincial — plantilla base',
    pageType: 'geo_zone',
    cacheablePrefix: BASE_INSTRUCTIONS,
    defaultModel: 'claude_sonnet_4_6',
    version: 1,
    inputSchema: {
      type: 'object',
      properties: {
        provinceName: { type: 'string' },
        geologyNotes: { type: 'string' },
        primaryKeyword: { type: 'string' },
      },
      required: ['provinceName', 'primaryKeyword'],
    },
    templateBody: `${BASE_INSTRUCTIONS}\n\nProvincia: {{provinceName}}\nContexto geológico: {{geologyNotes}}\nKeyword: {{primaryKeyword}}\nGenera contenido localizado ≥800 palabras con geología específica.`,
  },
  {
    seedKey: 'seed-service-zone-v1',
    name: 'Intersección servicio×zona — plantilla base',
    pageType: 'service_zone',
    cacheablePrefix: BASE_INSTRUCTIONS,
    defaultModel: 'claude_sonnet_4_6',
    version: 1,
    inputSchema: {
      type: 'object',
      properties: {
        serviceName: { type: 'string' },
        provinceName: { type: 'string' },
        primaryKeyword: { type: 'string' },
      },
      required: ['serviceName', 'provinceName', 'primaryKeyword'],
    },
    templateBody: `${BASE_INSTRUCTIONS}\n\nServicio: {{serviceName}}\nZona: {{provinceName}}\nKeyword: {{primaryKeyword}}\nGenera landing de intersección con CTA y casos locales.`,
  },
  {
    seedKey: 'seed-case-study-v1',
    name: 'Caso de estudio — plantilla base',
    pageType: 'case_study',
    cacheablePrefix: BASE_INSTRUCTIONS,
    defaultModel: 'claude_sonnet_4_6',
    version: 1,
    inputSchema: {
      type: 'object',
      properties: {
        projectTitle: { type: 'string' },
        workTypology: { type: 'string' },
        provinceName: { type: 'string' },
        challenge: { type: 'string' },
      },
      required: ['projectTitle', 'workTypology', 'provinceName'],
    },
    templateBody: `${BASE_INSTRUCTIONS}\n\nProyecto: {{projectTitle}}\nTipología: {{workTypology}}\nUbicación: {{provinceName}}\nReto: {{challenge}}\nGenera estructura problema-solución-resultado con datos técnicos.`,
  },
  {
    seedKey: 'seed-blog-v1',
    name: 'Artículo blog técnico — plantilla base',
    pageType: 'blog',
    cacheablePrefix: BASE_INSTRUCTIONS,
    defaultModel: 'claude_sonnet_4_6',
    version: 1,
    inputSchema: {
      type: 'object',
      properties: {
        topic: { type: 'string' },
        audience: { type: 'string' },
        primaryKeyword: { type: 'string' },
      },
      required: ['topic', 'primaryKeyword'],
    },
    templateBody: `${BASE_INSTRUCTIONS}\n\nTema: {{topic}}\nAudiencia: {{audience}}\nKeyword: {{primaryKeyword}}\nGenera artículo técnico con H2-H3, conclusión y enlaces internos sugeridos.`,
  },
  {
    seedKey: 'seed-faq-v1',
    name: 'Bloque FAQ — plantilla base',
    pageType: 'faq',
    cacheablePrefix: BASE_INSTRUCTIONS,
    defaultModel: 'claude_sonnet_4_6',
    version: 1,
    inputSchema: {
      type: 'object',
      properties: {
        serviceName: { type: 'string' },
        questions: { type: 'array', items: { type: 'string' } },
      },
      required: ['serviceName'],
    },
    templateBody: `${BASE_INSTRUCTIONS}\n\nServicio: {{serviceName}}\nGenera 5-8 preguntas frecuentes con respuestas concisas aptas para FAQPage schema.`,
  },
  {
    seedKey: 'seed-meta-v1',
    name: 'Metadatos SEO — plantilla base',
    pageType: 'meta',
    cacheablePrefix: BASE_INSTRUCTIONS,
    defaultModel: 'claude_sonnet_4_6',
    version: 1,
    inputSchema: {
      type: 'object',
      properties: {
        pageTitle: { type: 'string' },
        primaryKeyword: { type: 'string' },
        pageType: { type: 'string' },
      },
      required: ['pageTitle', 'primaryKeyword'],
    },
    templateBody: `${BASE_INSTRUCTIONS}\n\nPágina: {{pageTitle}}\nTipo: {{pageType}}\nKeyword: {{primaryKeyword}}\nGenera meta title, meta description y sugerencia de canonical.`,
  },
] as const;

const PAGE_TYPES: PromptPageType[] = [
  'service',
  'geo_zone',
  'service_zone',
  'case_study',
  'blog',
  'faq',
  'meta',
];

/** Verifica ≥1 plantilla activa por cada PromptPageType. */
export function assertPromptTemplateSeedCoverage(): void {
  for (const pageType of PAGE_TYPES) {
    const found = PROMPT_TEMPLATE_SEEDS.some((t) => t.pageType === pageType);
    if (!found) {
      throw new Error(`Falta plantilla seed para pageType=${pageType}`);
    }
  }
}
