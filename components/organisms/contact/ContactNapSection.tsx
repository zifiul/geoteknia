import { ContactTrackLink } from '@/components/molecules/ContactTrackLink';
import { PhoneLink } from '@/components/molecules/PhoneLink';
import { BusinessIcon } from '@/components/organisms/contact/contact-icons';
import type { PublicNapSnapshot } from '@/lib/contact/public-nap';

export type ContactNapSectionProps = {
  nap: PublicNapSnapshot;
  serviceSlug?: string;
  provinceSlug?: string;
};

export function ContactNapSection({
  nap,
  serviceSlug,
  provinceSlug,
}: ContactNapSectionProps) {
  return (
    <section
      aria-labelledby="contact-nap-heading"
      className="w-full min-w-0 rounded-sm border border-brand-secondary/15 bg-brand-neutral/50 p-4 sm:p-6"
    >
      <h2
        id="contact-nap-heading"
        className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-brand-on-surface"
      >
        <BusinessIcon className="text-brand-on-surface" />
        Sede Central
      </h2>
      <address className="space-y-2 not-italic text-sm text-muted">
        <p className="font-semibold text-brand-on-surface">{nap.displayName}</p>
        {nap.address ? (
          <p className="break-words" data-testid="contact-nap-address">
            {nap.address}
          </p>
        ) : null}
        {nap.phone ? (
          <p className="mt-4 flex items-center gap-2 border-t border-brand-secondary/15 pt-4">
            <PhoneLink
              phone={nap.phone}
              trackEvent="click_tel"
              serviceSlug={serviceSlug}
              provinceSlug={provinceSlug}
              ariaLabel={`Llamar a ${nap.displayName}`}
              className="font-semibold text-brand-accent"
            />
          </p>
        ) : null}
        {nap.email ? (
          <ContactTrackLink
            eventName="click_email"
            href={`mailto:${nap.email}`}
            serviceSlug={serviceSlug}
            provinceSlug={provinceSlug}
            className="inline-flex min-h-11 max-w-full items-center break-all text-sm text-brand-accent underline-offset-2 hover:underline"
          >
            {nap.email}
          </ContactTrackLink>
        ) : null}
      </address>
    </section>
  );
}
