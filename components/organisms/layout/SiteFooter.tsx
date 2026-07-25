import Link from 'next/link';

import { ContactTrackLink } from '@/components/molecules/ContactTrackLink';
import { PhoneLink } from '@/components/molecules/PhoneLink';
import type { PublicOrganizationProfile } from '@/lib/content/organization';
import { PUBLIC_LEGAL_LINKS, PUBLIC_MAIN_NAV } from '@/lib/navigation/public-silos';

import { FooterCookiePreferences } from './FooterCookiePreferences';

export type SiteFooterProps = {
  profile: PublicOrganizationProfile | null;
};

export function SiteFooter({ profile }: SiteFooterProps) {
  const displayName = profile?.displayName ?? 'Geoteknia';
  const address = profile?.napAddress;
  const phone = profile?.napPhone;
  const email = profile?.napEmail;

  return (
    <footer className="mt-auto border-t border-brand-secondary/15 bg-brand-primary text-brand-surface">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 md:grid-cols-3">
        <div className="space-y-3">
          <p className="text-lg font-semibold">{displayName}</p>
          {address ? (
            <p className="text-sm text-brand-surface/85">{address}</p>
          ) : null}
          {phone ? (
            <PhoneLink
              phone={phone}
              trackEvent="click_tel"
              className="text-sm text-brand-surface/90 hover:text-white"
            />
          ) : null}
          {email ? (
            <ContactTrackLink
              eventName="click_email"
              href={`mailto:${email}`}
              className="text-sm text-brand-surface/90 underline-offset-2 hover:underline"
            >
              {email}
            </ContactTrackLink>
          ) : null}
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-surface/70">
            Mapa del sitio
          </p>
          <ul className="grid gap-2 text-sm">
            {PUBLIC_MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-brand-surface/90 underline-offset-2 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded-sm"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-surface/70">
            Legal
          </p>
          <ul className="flex flex-col gap-2 text-sm">
            {PUBLIC_LEGAL_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-brand-surface/90 underline-offset-2 hover:text-white hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <FooterCookiePreferences className="text-brand-surface/90 hover:text-white" />
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-surface/10 py-4 text-center text-xs text-brand-surface/60">
        © {new Date().getFullYear()} {displayName}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
