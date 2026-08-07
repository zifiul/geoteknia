import Link from 'next/link';

import { ContactTrackLink } from '@/components/molecules/ContactTrackLink';
import { PhoneLink } from '@/components/molecules/PhoneLink';
import { LocationIcon, MailIcon } from '@/components/organisms/contact/contact-icons';
import type { PublicOrganizationProfile } from '@/lib/content/organization';
import { PUBLIC_LEGAL_LINKS, PUBLIC_MAIN_NAV } from '@/lib/navigation/public-silos';
import { cn } from '@/lib/shared/cn';

import { FooterCookiePreferences } from './FooterCookiePreferences';

export type SiteFooterProps = {
  profile: PublicOrganizationProfile | null;
};

const footerLinkClass =
  'inline-flex min-h-11 items-center rounded-sm text-sm text-brand-surface/90 underline-offset-2 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent';

const footerSectionTitleClass =
  'mb-3 text-xs font-semibold uppercase tracking-wider text-brand-surface/60 md:text-sm md:tracking-wide md:text-brand-surface/70';

export function SiteFooter({ profile }: SiteFooterProps) {
  const displayName = profile?.displayName ?? 'Geoteknia';
  const address = profile?.napAddress;
  const phone = profile?.napPhone;
  const email = profile?.napEmail;
  const hasContactChannels = Boolean(phone || email);

  return (
    <footer className="mt-auto border-t border-brand-secondary/15 bg-brand-primary pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] text-brand-surface md:pb-0">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-x-6 gap-y-8 px-4 py-10 md:grid-cols-3 md:gap-10 md:py-12">
        <div className="col-span-2 space-y-4 border-b border-brand-surface/10 pb-8 md:col-span-1 md:border-b-0 md:pb-0">
          <p className="text-lg font-semibold">{displayName}</p>

          {address ? (
            <p className="flex items-start gap-2.5 text-sm leading-relaxed text-brand-surface/85">
              <LocationIcon className="mt-0.5 shrink-0 text-brand-surface/60" />
              <span>{address}</span>
            </p>
          ) : null}

          {hasContactChannels ? (
            <ul className="flex flex-col gap-0.5" aria-label="Contacto">
              {phone ? (
                <li>
                  <PhoneLink
                    phone={phone}
                    trackEvent="click_tel"
                    className={cn(footerLinkClass, 'gap-2.5 [&_svg]:text-brand-surface/60')}
                  />
                </li>
              ) : null}
              {email ? (
                <li>
                  <ContactTrackLink
                    eventName="click_email"
                    href={`mailto:${email}`}
                    className={cn(footerLinkClass, 'gap-2.5')}
                  >
                    <MailIcon className="shrink-0 text-brand-surface/60" />
                    <span className="break-all">{email}</span>
                  </ContactTrackLink>
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>

        <div>
          <p className={footerSectionTitleClass}>Mapa del sitio</p>
          <ul className="flex flex-col gap-1.5 text-sm md:gap-2">
            {PUBLIC_MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={footerLinkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className={footerSectionTitleClass}>Legal</p>
          <ul className="flex flex-col gap-1.5 text-sm md:gap-2">
            {PUBLIC_LEGAL_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={footerLinkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <FooterCookiePreferences
                className={cn(
                  footerLinkClass,
                  'border-0 bg-transparent p-0 text-left font-normal',
                )}
              />
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-surface/10 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] text-center text-xs leading-relaxed text-brand-surface/60 md:pb-4">
        © {new Date().getFullYear()} {displayName}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
