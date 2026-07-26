import type { Metadata } from 'next';

import { THANK_YOU_PAGE_ROBOTS } from '@/lib/seo/robots-rules';

export function buildThankYouMetadata(
  title: string,
  description: string,
): Metadata {
  return {
    title,
    description,
    robots: THANK_YOU_PAGE_ROBOTS,
  };
}
