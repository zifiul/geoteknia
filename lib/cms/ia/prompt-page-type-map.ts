import { PromptPageType } from '@prisma/client';

import type { EditorialContentType } from '@/lib/content/schemas/workflow';

const EDITORIAL_TO_PROMPT: Partial<Record<EditorialContentType, PromptPageType>> =
  {
    service: PromptPageType.service,
    geo_zone: PromptPageType.geo_zone,
    service_zone_page: PromptPageType.service_zone,
    case_study: PromptPageType.case_study,
    blog_post: PromptPageType.blog,
    faq: PromptPageType.faq,
  };

export function editorialContentTypeToPromptPageType(
  type: EditorialContentType,
): PromptPageType | null {
  return EDITORIAL_TO_PROMPT[type] ?? null;
}
