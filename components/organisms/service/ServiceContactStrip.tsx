import { ContactTrackLink } from '@/components/molecules/ContactTrackLink';
import type { PublicContactChannel } from '@/lib/content/organization';
import type { PublicOrganizationProfile } from '@/lib/content/organization';
import { buildWhatsAppUrl } from '@/lib/navigation/cta-query';

export type ServiceContactStripProps = {
  serviceSlug: string;
  profile: PublicOrganizationProfile | null;
  channel: PublicContactChannel | null;
};

export function ServiceContactStrip({
  serviceSlug,
  profile,
  channel,
}: ServiceContactStripProps) {
  const phone = channel?.phone ?? profile?.napPhone;
  const whatsapp = channel?.whatsappNumber ?? channel?.phone ?? profile?.napPhone;

  if (!phone && !whatsapp) {
    return null;
  }

  return (
    <section
      className="border-t border-brand-secondary/10 bg-brand-primary py-10 text-white md:py-12"
      aria-labelledby="service-contact-heading"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between">
        <h2 id="service-contact-heading" className="font-display text-xl font-semibold md:text-2xl">
          ¿Necesita respuesta rápida?
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          {phone ? (
            <ContactTrackLink
              eventName="click_tel"
              serviceSlug={serviceSlug}
              href={`tel:${phone.replace(/\D/g, '')}`}
              className="inline-flex min-h-11 items-center justify-center rounded-sm bg-white px-5 py-2.5 font-semibold text-brand-primary"
            >
              Llamar
            </ContactTrackLink>
          ) : null}
          {whatsapp ? (
            <ContactTrackLink
              eventName="click_whatsapp"
              serviceSlug={serviceSlug}
              href={buildWhatsAppUrl(whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-sm border border-white/50 px-5 py-2.5 font-semibold text-white"
            >
              WhatsApp
            </ContactTrackLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}
