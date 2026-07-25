import type { ReactNode } from 'react';

import {
  ConsentBanner,
} from '@/components/analytics/consent-banner';
import { GtmScript } from '@/components/analytics/gtm';
import { SiteFooter } from '@/components/organisms/layout/SiteFooter';
import { SiteHeader } from '@/components/organisms/layout/SiteHeader';
import { SiteStickyContactBar } from '@/components/organisms/layout/SiteStickyContactBar';
import {
  getGeneralContactChannel,
  getOrganizationProfile,
} from '@/lib/content/organization';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const [profile, channel] = await Promise.all([
    getOrganizationProfile(),
    getGeneralContactChannel(),
  ]);
  const phone = channel?.phone ?? profile?.napPhone ?? null;

  return (
    <div className="flex min-h-dvh flex-col">
      <GtmScript />
      <SiteHeader profile={profile} phone={phone} />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-1 flex-col outline-none pb-28 md:pb-0"
      >
        {children}
      </main>
      <SiteFooter profile={profile} />
      <SiteStickyContactBar profile={profile} channel={channel} />
      <ConsentBanner />
    </div>
  );
}
