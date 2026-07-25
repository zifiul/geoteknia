import { WorkflowStatus } from '@prisma/client';

/** Filtro editorial indexable (mismo criterio que `lib/seo/sitemap-sources.ts`). */
export const PUBLISHED_EDITORIAL_WHERE = {
  workflowStatus: WorkflowStatus.publicado,
  deletedAt: null,
} as const;
