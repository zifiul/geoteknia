'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ContactTrackLink } from '@/components/molecules/ContactTrackLink';
import {
  buildWhatsAppMessage,
  humanizeSlug,
} from '@/lib/contact/build-whatsapp-message';
import type { PublicContactChannel } from '@/lib/content/organization';
import {
  buildPresupuestoHref,
  buildUbicacionHref,
  buildWhatsAppUrl,
} from '@/lib/navigation/cta-query';

export type ContactConversionCtasProps = {
  presupuestosChannel: PublicContactChannel | null;
  serviceSlug?: string;
  provinceSlug?: string;
};

export function ContactConversionCtas({
  presupuestosChannel,
  serviceSlug,
  provinceSlug,
}: ContactConversionCtasProps) {
  const pathname = usePathname() ?? '/contacto';
  const labels = {
    servicio: serviceSlug ? humanizeSlug(serviceSlug) : undefined,
    provincia: provinceSlug ? humanizeSlug(provinceSlug) : undefined,
  };
  const whatsapp =
    presupuestosChannel?.whatsappNumber ?? presupuestosChannel?.phone ?? null;
  const whatsappHref = whatsapp
    ? buildWhatsAppUrl(
        whatsapp,
        buildWhatsAppMessage(presupuestosChannel?.prefilledMessageTemplate, labels),
      )
    : null;

  return (
    <div
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap"
      data-testid="contact-conversion-ctas"
    >
      <Link
        href={buildPresupuestoHref(pathname)}
        className="inline-flex min-h-11 flex-1 items-center justify-center rounded-sm bg-brand-accent px-4 py-2.5 text-center text-base font-semibold text-white hover:bg-brand-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
      >
        Solicitar presupuesto
      </Link>
      <Link
        href={buildUbicacionHref(pathname)}
        className="inline-flex min-h-11 flex-1 items-center justify-center rounded-sm border border-brand-secondary/30 bg-brand-surface px-4 py-2.5 text-center text-base font-semibold text-brand-on-surface hover:bg-brand-neutral/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
      >
        Ubicar parcela
      </Link>
      {whatsappHref ? (
        <ContactTrackLink
          eventName="click_whatsapp"
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          serviceSlug={serviceSlug}
          provinceSlug={provinceSlug}
          aria-label="Contactar por WhatsApp presupuestos"
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-sm border border-brand-secondary/30 px-4 py-2.5 text-center text-base font-semibold text-brand-on-surface hover:bg-brand-neutral/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
        >
          Contactar por WhatsApp
        </ContactTrackLink>
      ) : null}
    </div>
  );
}
