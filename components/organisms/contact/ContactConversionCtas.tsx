'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ContactTrackLink } from '@/components/molecules/ContactTrackLink';
import {
  ParcelIcon,
  RequestQuoteIcon,
  WhatsAppIcon,
} from '@/components/organisms/contact/contact-icons';
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
import { cn } from '@/lib/shared/cn';

export type ContactConversionCtasProps = {
  presupuestosChannel: PublicContactChannel | null;
  serviceSlug?: string;
  provinceSlug?: string;
  embedded?: boolean;
};

const actionButtonClass =
  'inline-flex min-h-11 w-full max-w-full items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-center text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent sm:text-base';

export function ContactConversionCtas({
  presupuestosChannel,
  serviceSlug,
  provinceSlug,
  embedded = false,
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
    <section
      aria-label="Acciones de conversión"
      className={cn(
        'w-full min-w-0',
        embedded
          ? 'rounded-sm border border-brand-secondary/15 bg-brand-neutral/30 p-4'
          : 'border-t border-brand-secondary/10 bg-brand-neutral/40 py-6 md:py-8',
      )}
      data-testid="contact-conversion-ctas"
    >
      <div
        className={cn(
          'mx-auto w-full min-w-0 max-w-[1200px]',
          embedded ? '' : 'px-4',
        )}
      >
        <div className="flex w-full min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full min-w-0 flex-col gap-3 md:w-auto md:flex-row md:flex-wrap">
            <Link
              href={buildPresupuestoHref(pathname)}
              className={cn(
                actionButtonClass,
                'bg-brand-accent text-white hover:bg-brand-accent/90 focus-visible:ring-brand-accent',
              )}
            >
              <RequestQuoteIcon className="shrink-0 text-white" />
              <span className="truncate">Solicitar presupuesto</span>
            </Link>
            <Link
              href={buildUbicacionHref(pathname)}
              className={cn(
                actionButtonClass,
                'border border-brand-secondary/30 bg-brand-surface text-brand-on-surface hover:bg-brand-neutral/40',
              )}
            >
              <ParcelIcon className="shrink-0" />
              <span className="truncate md:hidden">Ubicar parcela</span>
              <span className="hidden truncate md:inline">Enviar ubicación de parcela</span>
            </Link>
          </div>

          {whatsappHref ? (
            <div className="flex w-full min-w-0 flex-col gap-2 md:w-auto md:flex-row md:items-center">
              <p className="hidden text-sm text-muted md:inline">
                Respuesta rápida en horario laboral:
              </p>
              <ContactTrackLink
                eventName="click_whatsapp"
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                serviceSlug={serviceSlug}
                provinceSlug={provinceSlug}
                aria-label="Contactar por WhatsApp presupuestos"
                className={cn(
                  actionButtonClass,
                  'border border-[#25D366]/30 bg-[#25D366] text-white hover:bg-[#128C7E] md:bg-[#25D366]/10 md:text-[#128C7E] md:hover:bg-[#25D366]/20',
                )}
              >
                <WhatsAppIcon className="shrink-0" />
                <span className="truncate md:hidden">Contactar por WhatsApp</span>
                <span className="hidden truncate md:inline">WhatsApp</span>
              </ContactTrackLink>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
