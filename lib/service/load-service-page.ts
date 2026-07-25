import 'server-only';

import { listPublishedFaqsByService } from '@/lib/content/blog-faqs';
import { listPublishedCaseStudiesByService } from '@/lib/content/case-studies';
import { listMachineryByService } from '@/lib/content/machinery';
import {
  getGeneralContactChannel,
  getOrganizationProfile,
} from '@/lib/content/organization';
import { listPublishedServiceZonePagesByService } from '@/lib/content/service-zone-pages';
import {
  getPublishedServiceBySlug,
  type PublishedServiceDetail,
} from '@/lib/content/services';

export type ServicePageData = {
  service: PublishedServiceDetail;
  caseStudies: Awaited<ReturnType<typeof listPublishedCaseStudiesByService>>;
  faqs: Awaited<ReturnType<typeof listPublishedFaqsByService>>;
  zonePages: Awaited<ReturnType<typeof listPublishedServiceZonePagesByService>>;
  machinery: Awaited<ReturnType<typeof listMachineryByService>>;
  profile: Awaited<ReturnType<typeof getOrganizationProfile>>;
  channel: Awaited<ReturnType<typeof getGeneralContactChannel>>;
};

export async function loadServicePageData(slug: string): Promise<ServicePageData | null> {
  const service = await getPublishedServiceBySlug(slug);
  if (!service) {
    return null;
  }

  const [caseStudies, faqs, zonePages, machinery, profile, channel] = await Promise.all([
    listPublishedCaseStudiesByService(service.id),
    listPublishedFaqsByService(service.id),
    listPublishedServiceZonePagesByService(service.id),
    listMachineryByService(service.id),
    getOrganizationProfile(),
    getGeneralContactChannel(),
  ]);

  return {
    service,
    caseStudies,
    faqs,
    zonePages,
    machinery,
    profile,
    channel,
  };
}
