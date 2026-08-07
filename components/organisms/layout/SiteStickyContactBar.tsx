'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { ContactTrackLink } from '@/components/molecules/ContactTrackLink';
import type { LayoutContactChannels } from '@/lib/contact/contact-department';
import type {
  PublicContactChannel,
  PublicOrganizationProfile,
} from '@/lib/content/organization';
import { buildPresupuestoHref } from '@/lib/navigation/cta-query';
import { cn } from '@/lib/shared/cn';

import { useLayoutContact } from './use-layout-contact';

export type SiteStickyContactBarProps = {
  profile: PublicOrganizationProfile | null;
  channel: PublicContactChannel | null;
  channels: LayoutContactChannels;
};

function NavIcon({ children }: { children: ReactNode }) {
  return <span className="mb-0.5 inline-flex size-6 items-center justify-center">{children}</span>;
}

function CallIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.6 10.8a15.9 15.9 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.3 21 3 13.7 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14 3v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const sideActionClass =
  'flex min-h-11 min-w-[44px] flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-white/85 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary';

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

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid h-[72px] grid-cols-3 items-end border-t border-brand-secondary/30 bg-brand-primary px-2 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_12px_rgba(27,40,56,0.25)] md:hidden"
      aria-label="Contacto rápido"
      data-testid="site-sticky-contact-bar"
    >
      {resolvedPhone ? (
        <ContactTrackLink
          eventName="click_tel"
          serviceSlug={slugs.serviceSlug}
          provinceSlug={slugs.provinceSlug}
          href={`tel:${resolvedPhone.replace(/\D/g, '')}`}
          aria-label={`Llamar a ${deptLabel}`}
          className={cn(sideActionClass, 'justify-self-center')}
        >
          <NavIcon>
            <CallIcon />
          </NavIcon>
          Llamar
        </ContactTrackLink>
      ) : (
        <span aria-hidden className="min-h-11" />
      )}

      <Link
        href={buildPresupuestoHref(pathname)}
        className={cn(
          sideActionClass,
          '-mt-4 justify-self-center rounded-full border-4 border-brand-surface bg-brand-accent px-4 py-2 font-semibold !text-white shadow-md',
        )}
      >
        <NavIcon>
          <QuoteIcon />
        </NavIcon>
        Presupuesto
      </Link>

      {resolvedWhatsappHref ? (
        <ContactTrackLink
          eventName="click_whatsapp"
          serviceSlug={slugs.serviceSlug}
          provinceSlug={slugs.provinceSlug}
          href={resolvedWhatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp ${deptLabel}`}
          className={cn(sideActionClass, 'justify-self-center')}
        >
          <NavIcon>
            <WhatsAppIcon />
          </NavIcon>
          WhatsApp
        </ContactTrackLink>
      ) : (
        <span aria-hidden className="min-h-11" />
      )}
    </nav>
  );
}
