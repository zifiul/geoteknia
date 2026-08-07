import { SchemaType } from '@prisma/client';

import type { EditorialContentType } from '@/lib/content/schemas/workflow';

const DEFAULT_SCHEMA_TYPE: Record<EditorialContentType, SchemaType> = {
  service: SchemaType.Service,
  geo_zone: SchemaType.LocalBusiness,
  service_zone_page: SchemaType.Service,
  case_study: SchemaType.CreativeWork,
  blog_post: SchemaType.Article,
  faq: SchemaType.FAQPage,
  team_member: SchemaType.Person,
  machinery: SchemaType.Service,
};

export function defaultSchemaTypeFor(
  contentType: EditorialContentType,
): SchemaType {
  return DEFAULT_SCHEMA_TYPE[contentType];
}

export function defaultInitialFor(
  contentType: EditorialContentType,
): Record<string, unknown> {
  const schemaType = defaultSchemaTypeFor(contentType);
  const seoDefaults = {
    slug: '',
    schemaType,
    noindex: false,
  };

  switch (contentType) {
    case 'service':
      return {
        ...seoDefaults,
        name: '',
        summary: '',
        body: '',
        applicableNorms: '',
        isPillar: true,
        zoneIds: [],
        methodology: [],
        deliverables: [],
      };
    case 'geo_zone':
      return {
        ...seoDefaults,
        provinceId: '',
        name: '',
        localGeology: '',
        operationalBase: '',
        body: '',
      };
    case 'service_zone_page':
      return {
        ...seoDefaults,
        serviceId: '',
        zoneId: '',
        targetKeyword: '',
        body: '',
      };
    case 'case_study':
      return {
        ...seoDefaults,
        title: '',
        serviceId: '',
        provinceId: '',
        workTypologyId: '',
        problem: '',
        solution: '',
        result: '',
        teamMemberIds: [],
      };
    case 'blog_post':
      return {
        ...seoDefaults,
        title: '',
        categoryId: '',
        teamAuthorId: '',
        excerpt: '',
        body: '',
        serviceIds: [],
      };
    case 'faq':
      return {
        faqGroupId: '',
        question: '',
        answer: '',
        internalLinkUrl: '',
      };
    case 'team_member':
      return {
        slug: '',
        fullName: '',
        jobTitle: '',
        bio: '',
      };
    case 'machinery':
      return {
        slug: '',
        name: '',
        equipmentType: 'sonda_rotacion',
        model: '',
        serviceIds: [],
      };
    default: {
      const _exhaustive: never = contentType;
      return _exhaustive;
    }
  }
}
