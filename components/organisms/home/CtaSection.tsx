import { ContactTrackLink } from '@/components/molecules/ContactTrackLink';
import { EngagementTrackLink } from '@/components/molecules/EngagementTrackLink';
import type { PublicContactChannel } from '@/lib/content/organization';
import type { PublicOrganizationProfile } from '@/lib/content/organization';
import { buildWhatsAppUrl } from '@/lib/navigation/cta-query';

export type HomeCtaSectionProps = {
  profile: PublicOrganizationProfile | null;
  channel: PublicContactChannel | null;
};

export function HomeCtaSection({ profile, channel }: HomeCtaSectionProps) {
  const phone = channel?.phone ?? profile?.napPhone;
  const email = channel?.email ?? profile?.napEmail;
  const whatsapp = channel?.whatsappNumber ?? channel?.phone ?? profile?.napPhone;

  return (
    <section
      className="bg-brand-primary py-12 text-white md:py-16"
      aria-labelledby="home-cta-heading"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="home-cta-heading" className="font-display text-2xl font-semibold md:text-3xl">
            ¿Hablamos de su proyecto?
          </h2>
          <p className="mt-2 max-w-xl text-white/85">
            Equipo geotécnico con cobertura provincial y respuesta ágil para obra y licitación.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
          {phone ? (
            <ContactTrackLink
              eventName="click_tel"
              href={`tel:${phone.replace(/\D/g, '')}`}
              className="inline-flex min-h-11 items-center justify-center rounded-sm bg-white px-4 py-2.5 text-base font-semibold text-brand-primary"
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
              className="inline-flex min-h-11 items-center justify-center rounded-sm border border-white/50 px-4 py-2.5 text-base font-semibold text-white"
            >
              WhatsApp
            </ContactTrackLink>
          ) : null}
          {email ? (
            <ContactTrackLink
              eventName="click_email"
              href={`mailto:${email}`}
              className="inline-flex min-h-11 items-center justify-center rounded-sm border border-white/50 px-4 py-2.5 text-base font-semibold text-white"
            >
              Email
            </ContactTrackLink>
          ) : null}
          <EngagementTrackLink
            href="/contacto"
            contentType="contact"
            contentId="contacto-footer-cta"
            className="w-full sm:w-auto"
          >
            Formulario de contacto
          </EngagementTrackLink>
        </div>
      </div>
    </section>
  );
}
