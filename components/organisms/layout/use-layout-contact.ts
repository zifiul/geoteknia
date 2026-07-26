'use client';

import { useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import {
  buildWhatsAppMessage,
  humanizeSlug,
} from '@/lib/contact/build-whatsapp-message';
import {
  contactDepartmentLabel,
  resolveLayoutContactChannel,
  type LayoutContactChannels,
} from '@/lib/contact/contact-department';
import type { PublicOrganizationProfile } from '@/lib/content/organization';
import {
  buildWhatsAppUrl,
  parseContactContextSlugs,
} from '@/lib/navigation/cta-query';

export function useLayoutContact(
  channels: LayoutContactChannels,
  profile: PublicOrganizationProfile | null,
) {
  const pathname = usePathname() ?? '/';
  const searchParams = useSearchParams();
  const { channel, department } = useMemo(
    () => resolveLayoutContactChannel(pathname, channels),
    [pathname, channels],
  );
  const slugs = useMemo(
    () => parseContactContextSlugs(pathname, searchParams),
    [pathname, searchParams],
  );
  const labels = useMemo(
    () => ({
      servicio: slugs.serviceSlug ? humanizeSlug(slugs.serviceSlug) : undefined,
      provincia: slugs.provinceSlug ? humanizeSlug(slugs.provinceSlug) : undefined,
    }),
    [slugs.provinceSlug, slugs.serviceSlug],
  );
  const message = useMemo(
    () => buildWhatsAppMessage(channel?.prefilledMessageTemplate, labels),
    [channel?.prefilledMessageTemplate, labels],
  );
  const phone = channel?.phone ?? profile?.napPhone ?? null;
  const whatsapp = channel?.whatsappNumber ?? channel?.phone ?? profile?.napPhone ?? null;
  const whatsappHref = whatsapp ? buildWhatsAppUrl(whatsapp, message) : null;
  const deptLabel = contactDepartmentLabel(department);

  return {
    phone,
    whatsapp,
    whatsappHref,
    slugs,
    deptLabel,
    department,
  };
}
