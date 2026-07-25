import 'server-only';

import { SchemaType } from '@prisma/client';

import { ContentValidationError } from '@/lib/content/errors';
import type { EditorialContentType } from '@/lib/content/schemas/workflow';

const EXPECTED_SCHEMA_BY_TYPE: Partial<
  Record<EditorialContentType, SchemaType>
> = {
  service: SchemaType.Service,
  geo_zone: SchemaType.LocalBusiness,
  service_zone_page: SchemaType.Service,
  case_study: SchemaType.CreativeWork,
  blog_post: SchemaType.Article,
  faq: SchemaType.FAQPage,
};

export function assertSchemaTypeCoherent(
  contentType: EditorialContentType,
  schemaType: SchemaType | null | undefined,
): void {
  const expected = EXPECTED_SCHEMA_BY_TYPE[contentType];
  if (!expected || schemaType == null) {
    return;
  }
  if (schemaType !== expected) {
    throw new ContentValidationError(
      `schema_type ${schemaType} no es coherente con ${contentType} (esperado ${expected})`,
    );
  }
}
