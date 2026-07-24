/** Tag de caché para `revalidateTag` (GTK-40). */
export const SITEMAP_CACHE_TAG = 'sitemap';

/** Revalidación por tiempo hasta publicación on-demand (GTK-40). */
export const SITEMAP_REVALIDATE_SECONDS = 3600;

export type SitemapChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export type SitemapPriorityKind =
  | 'service'
  | 'geo_zone'
  | 'service_zone_page'
  | 'case_study'
  | 'blog_post'
  | 'team_member'
  | 'machinery'
  | 'faq_group';

export const SITEMAP_PRIORITY_BY_KIND: Record<
  SitemapPriorityKind,
  { priority: number; changeFrequency: SitemapChangeFrequency }
> = {
  service: { priority: 1.0, changeFrequency: 'monthly' },
  geo_zone: { priority: 0.8, changeFrequency: 'monthly' },
  service_zone_page: { priority: 0.8, changeFrequency: 'monthly' },
  case_study: { priority: 0.7, changeFrequency: 'monthly' },
  blog_post: { priority: 0.6, changeFrequency: 'weekly' },
  team_member: { priority: 0.4, changeFrequency: 'yearly' },
  machinery: { priority: 0.4, changeFrequency: 'yearly' },
  faq_group: { priority: 0.4, changeFrequency: 'yearly' },
};
