'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ContactTrackLink } from '@/components/molecules/ContactTrackLink';
import { StickyCtaBar } from '@/components/organisms/StickyCtaBar';
import type {
  PublicContactChannel,
  PublicOrganizationProfile,
} from '@/lib/content/organization';
import {
  buildPresupuestoHref,
  buildWhatsAppUrl,
} from '@/lib/navigation/cta-query';
import { cn } from '@/lib/shared/cn';

const ctaButtonClass =
  'inline-flex min-h-11 flex-1 items-center justify-center rounded-sm px-4 py-2.5 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

export type SiteStickyContactBarProps = {
  profile: PublicOrganizationProfile | null;
  channel: PublicContactChannel | null;
};

export function SiteStickyContactBar({ profile, channel }: SiteStickyContactBarProps) {
  const pathname = usePathname() ?? '/';
  const phone = channel?.phone ?? profile?.napPhone;
  const whatsapp = channel?.whatsappNumber ?? channel?.phone ?? profile?.napPhone;

  if (!phone && !whatsapp) {
    return null;
  }

  return (
    <StickyCtaBar className="md:hidden">
      {phone ? (
        <ContactTrackLink
          eventName="click_tel"
          href={`tel:${phone.replace(/\D/g, '')}`}
          className={cn(ctaButtonClass, 'bg-brand-neutral text-brand-on-surface')}
        >
          Llamar
        </ContactTrackLink>
      ) : null}
      {whatsapp ? (
        <ContactTrackLink
          eventName="click_whatsapp"
          href={buildWhatsAppUrl(whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
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
