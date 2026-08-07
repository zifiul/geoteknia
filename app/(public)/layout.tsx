import { Suspense } from 'react';
import type { ReactNode } from 'react';

import {
  ConsentBanner,
} from '@/components/analytics/consent-banner';
import { GtmConsentBootstrap } from '@/components/analytics/gtm-consent-bootstrap';
import { GtmContainer } from '@/components/analytics/gtm';
import { SiteFooter } from '@/components/organisms/layout/SiteFooter';
import { SiteHeader } from '@/components/organisms/layout/SiteHeader';
import { SiteStickyContactBar } from '@/components/organisms/layout/SiteStickyContactBar';
import {
  getContactChannelByDepartment,
  getGeneralContactChannel,
  getOrganizationProfile,
} from '@/lib/content/organization';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const [profile, channel, presupuestosChannel, licitacionesChannel] = await Promise.all([
    getOrganizationProfile(),
    getGeneralContactChannel(),
    getContactChannelByDepartment('presupuestos'),
    getContactChannelByDepartment('licitaciones'),
  ]);
  const channels = {
    general: channel,
    presupuestos: presupuestosChannel,
    licitaciones: licitacionesChannel,
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <GtmConsentBootstrap />
      <GtmContainer />
      <Suspense fallback={<div className="min-h-14 border-b border-brand-secondary/15" />}>
        <SiteHeader profile={profile} channels={channels} />
      </Suspense>
      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-1 flex-col outline-none pb-28 md:pb-0"
      >
        {children}
      </main>
      <SiteFooter profile={profile} />
      <Suspense fallback={null}>
        <SiteStickyContactBar profile={profile} channel={channel} channels={channels} />
      </Suspense>
      <ConsentBanner />
    </div>
  );
}
