'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ContactTrackLink } from '@/components/molecules/ContactTrackLink';
import { StickyCtaBar } from '@/components/organisms/StickyCtaBar';
import type { LayoutContactChannels } from '@/lib/contact/contact-department';
import type {
  PublicContactChannel,
  PublicOrganizationProfile,
} from '@/lib/content/organization';
import { buildPresupuestoHref } from '@/lib/navigation/cta-query';
import { cn } from '@/lib/shared/cn';

import { useLayoutContact } from './use-layout-contact';

const ctaButtonClass =
  'inline-flex min-h-11 flex-1 items-center justify-center rounded-sm px-4 py-2.5 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

export type SiteStickyContactBarProps = {
  profile: PublicOrganizationProfile | null;
  channel: PublicContactChannel | null;
  channels: LayoutContactChannels;
};

export function SiteStickyContactBar({
  profile,
  channel,
  channels,
}: SiteStickyContactBarProps) {
  const pathname = usePathname() ?? '/';
  const { phone, whatsappHref, slugs, deptLabel } = useLayoutContact(channels, profile);
  const resolvedPhone = phone ?? channel?.phone ?? profile?.napPhone;
  const resolvedWhatsappHref =
    whatsappHref ??
    (channel?.whatsappNumber
      ? `https://wa.me/${(channel.whatsappNumber ?? channel.phone ?? '').replace(/\D/g, '')}`
      : null);

  if (!resolvedPhone && !resolvedWhatsappHref) {
    return null;
  }

  return (
    <StickyCtaBar className="md:hidden">
      {resolvedPhone ? (
        <ContactTrackLink
          eventName="click_tel"
          serviceSlug={slugs.serviceSlug}
          provinceSlug={slugs.provinceSlug}
          href={`tel:${resolvedPhone.replace(/\D/g, '')}`}
          aria-label={`Llamar a ${deptLabel}`}
          className={cn(ctaButtonClass, 'bg-brand-neutral text-brand-on-surface')}
        >
          Llamar
        </ContactTrackLink>
      ) : null}
      {resolvedWhatsappHref ? (
        <ContactTrackLink
          eventName="click_whatsapp"
          serviceSlug={slugs.serviceSlug}
          provinceSlug={slugs.provinceSlug}
          href={resolvedWhatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp ${deptLabel}`}
          className={cn(
            ctaButtonClass,
            'border border-brand-secondary/40 bg-transparent text-brand-on-surface',
          )}
        >
          WhatsApp
        </ContactTrackLink>
      ) : null}
      <Link
        href={buildPresupuestoHref(pathname)}
        className={cn(
          ctaButtonClass,
          'bg-brand-accent !text-white hover:bg-brand-accent/90 focus-visible:ring-brand-accent',
        )}
      >
        Presupuesto
      </Link>
    </StickyCtaBar>
  );
}
