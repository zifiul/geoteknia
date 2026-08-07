import type { ContentActionResult } from '@/lib/content/content-action-result';
import type { EditorialContentType } from '@/lib/content/schemas/workflow';

import {
  createBlogPostAction,
  createCaseStudyAction,
  createFaqAction,
  createGeoZoneAction,
  createMachineryAction,
  createServiceAction,
  createServiceZonePageAction,
  createTeamMemberAction,
  updateBlogPostAction,
  updateCaseStudyAction,
  updateFaqAction,
  updateGeoZoneAction,
  updateMachineryAction,
  updateServiceAction,
  updateServiceZonePageAction,
  updateTeamMemberAction,
} from '@/app/(admin)/(portal)/contenido/actions';

export type EditorMutationConfig = {
  create: (raw: unknown) => Promise<ContentActionResult<{ id: string }>>;
  update: (
    id: string,
    raw: unknown,
  ) => Promise<ContentActionResult<unknown>>;
};

export const EDITOR_MUTATIONS: Record<EditorialContentType, EditorMutationConfig> =
  {
    service: {
      create: createServiceAction,
      update: updateServiceAction,
    },
    geo_zone: {
      create: createGeoZoneAction,
      update: updateGeoZoneAction,
    },
    service_zone_page: {
      create: createServiceZonePageAction,
      update: updateServiceZonePageAction,
    },
    case_study: {
      create: createCaseStudyAction,
      update: updateCaseStudyAction,
    },
    blog_post: {
      create: createBlogPostAction,
      update: updateBlogPostAction,
    },
    faq: {
      create: createFaqAction,
      update: updateFaqAction,
    },
    team_member: {
      create: createTeamMemberAction,
      update: updateTeamMemberAction,
    },
    machinery: {
      create: createMachineryAction,
      update: updateMachineryAction,
    },
  };
