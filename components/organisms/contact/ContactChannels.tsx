import type { ContactDepartment } from '@prisma/client';

import { ContactTrackLink } from '@/components/molecules/ContactTrackLink';
import { PhoneLink } from '@/components/molecules/PhoneLink';
import {
  buildWhatsAppMessage,
  humanizeSlug,
} from '@/lib/contact/build-whatsapp-message';
import { contactDepartmentLabel } from '@/lib/contact/contact-department';
import {
  CONTACT_DEPARTMENT_CARDS,
  type ContactDepartmentCardConfig,
} from '@/lib/contact/page-config';
import type { PublicContactChannel } from '@/lib/content/organization';
import { buildWhatsAppUrl } from '@/lib/navigation/cta-query';

export type ContactChannelsProps = {
  channelsByDepartment: Record<ContactDepartment, PublicContactChannel | null>;
  serviceSlug?: string;
  provinceSlug?: string;
};

function buildLabels(serviceSlug?: string, provinceSlug?: string) {
  return {
    servicio: serviceSlug ? humanizeSlug(serviceSlug) : undefined,
    provincia: provinceSlug ? humanizeSlug(provinceSlug) : undefined,
  };
}

function DepartmentCard({
  config,
  channel,
  serviceSlug,
  provinceSlug,
}: {
  config: ContactDepartmentCardConfig;
  channel: PublicContactChannel | null;
  serviceSlug?: string;
  provinceSlug?: string;
}) {
  const labels = buildLabels(serviceSlug, provinceSlug);
  const deptLabel = contactDepartmentLabel(config.department);
  const phone = channel?.phone;
  const email = channel?.email;
  const whatsapp = channel?.whatsappNumber ?? channel?.phone;
  const whatsappHref = whatsapp
    ? buildWhatsAppUrl(
        whatsapp,
        buildWhatsAppMessage(channel?.prefilledMessageTemplate, labels),
      )
    : null;

  return (
    <article
      className="rounded-sm border border-brand-secondary/15 bg-brand-surface p-5 shadow-sm"
      data-testid={`contact-department-${config.department}`}
    >
      <h3 className="font-display text-lg font-semibold text-brand-on-surface">{config.title}</h3>
      <p className="mt-2 text-sm text-muted">{config.description}</p>
      <div className="mt-4 flex flex-col gap-2">
        {phone ? (
          <PhoneLink
            phone={phone}
            trackEvent="click_tel"
            serviceSlug={serviceSlug}
            provinceSlug={provinceSlug}
            ariaLabel={`Llamar a ${deptLabel}`}
            className="text-sm"
          >
            {phone}
          </PhoneLink>
        ) : null}
        {email ? (
          <ContactTrackLink
            eventName="click_email"
            href={`mailto:${email.trim()}`}
            serviceSlug={serviceSlug}
            provinceSlug={provinceSlug}
            aria-label={`Email ${deptLabel}`}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-accent underline-offset-2 hover:underline"
          >
            {email}
          </ContactTrackLink>
        ) : null}
        {whatsappHref ? (
          <ContactTrackLink
            eventName="click_whatsapp"
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            serviceSlug={serviceSlug}
            provinceSlug={provinceSlug}
            aria-label={`WhatsApp ${deptLabel}`}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-on-surface underline-offset-2 hover:underline"
          >
            WhatsApp
          </ContactTrackLink>
        ) : null}
      </div>
    </article>
  );
}

export function ContactChannels({
  channelsByDepartment,
  serviceSlug,
  provinceSlug,
}: ContactChannelsProps) {
  return (
    <section aria-labelledby="contact-departments-heading">
      <h2
        id="contact-departments-heading"
        className="font-display text-xl font-semibold text-brand-on-surface md:text-2xl"
      >
        Departamentos
      </h2>
      <ul className="mt-6 grid gap-6 md:grid-cols-3">
        {CONTACT_DEPARTMENT_CARDS.map((config) => (
          <li key={config.department}>
            <DepartmentCard
              config={config}
              channel={channelsByDepartment[config.department]}
              serviceSlug={serviceSlug}
              provinceSlug={provinceSlug}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
