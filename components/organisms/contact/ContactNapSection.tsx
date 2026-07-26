import { PhoneLink } from '@/components/molecules/PhoneLink';
import { ContactTrackLink } from '@/components/molecules/ContactTrackLink';
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
    <section aria-labelledby="contact-nap-heading" className="space-y-4">
      <h2
        id="contact-nap-heading"
        className="font-display text-xl font-semibold text-brand-on-surface md:text-2xl"
      >
        Sede central
      </h2>
      <p className="text-sm font-semibold text-brand-on-surface">{nap.displayName}</p>
      {nap.address ? (
        <p className="text-sm text-muted" data-testid="contact-nap-address">{nap.address}</p>
      ) : null}
      <div className="flex flex-col gap-2">
        {nap.phone ? (
          <PhoneLink
            phone={nap.phone}
            trackEvent="click_tel"
            serviceSlug={serviceSlug}
            provinceSlug={provinceSlug}
            ariaLabel={`Llamar a ${nap.displayName}`}
            className="text-sm"
          />
        ) : null}
        {nap.email ? (
          <ContactTrackLink
            eventName="click_email"
            href={`mailto:${nap.email}`}
            serviceSlug={serviceSlug}
            provinceSlug={provinceSlug}
            className="inline-flex min-h-11 items-center text-sm text-brand-accent underline-offset-2 hover:underline"
          >
            {nap.email}
          </ContactTrackLink>
        ) : null}
      </div>
    </section>
  );
}
