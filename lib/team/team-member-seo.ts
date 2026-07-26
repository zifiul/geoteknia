import { SchemaType } from '@prisma/client';

import type { SeoBlockInput } from '@/lib/content/schemas/seo';
import { truncateMetaDescription, truncateMetaTitle } from '@/lib/seo/metadata';

export type TeamMemberSeoSource = {
  slug: string;
  fullName: string;
  jobTitle: string;
  bio: string | null;
};

/**
 * team_members no tiene bloque SEO en BD (solo slug). Metadata sintética fija Person + index.
 */
export function buildTeamMemberSeoBlock(source: TeamMemberSeoSource): SeoBlockInput {
  const derivedTitle = `${source.fullName} — ${source.jobTitle}`;
  const metaTitle = truncateMetaTitle(derivedTitle) ?? derivedTitle.slice(0, 60);
  const metaDescription =
    truncateMetaDescription(source.bio) ??
    truncateMetaDescription(`${source.jobTitle} en Geoteknia.`) ??
    null;

  return {
    slug: source.slug,
    schemaType: SchemaType.Person,
    metaTitle,
    metaDescription,
    canonicalUrl: null,
    noindex: false,
  };
}
