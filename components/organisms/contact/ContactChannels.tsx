import type { ContactDepartment } from '@prisma/client';

import { ContactTrackLink } from '@/components/molecules/ContactTrackLink';
import {
  AssignmentIcon,
  CallIcon,
  EngineeringIcon,
  MailIcon,
  RequestQuoteIcon,
  WhatsAppIcon,
} from '@/components/organisms/contact/contact-icons';
import {
  buildWhatsAppMessage,
  humanizeSlug,
} from '@/lib/contact/build-whatsapp-message';
import { contactDepartmentLabel } from '@/lib/contact/contact-department';
import {
  CONTACT_DEPARTMENT_CARDS,
  type ContactDepartmentCardConfig,
  type ContactDepartmentIcon,
} from '@/lib/contact/page-config';
import type { PublicContactChannel } from '@/lib/content/organization';
import { buildWhatsAppUrl, digitsOnlyPhone } from '@/lib/navigation/cta-query';
import { cn } from '@/lib/shared/cn';

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

function DepartmentIcon({ icon, className }: { icon: ContactDepartmentIcon; className?: string }) {
  switch (icon) {
    case 'request_quote':
      return <RequestQuoteIcon className={className} />;
    case 'engineering':
      return <EngineeringIcon className={className} />;
    case 'assignment':
      return <AssignmentIcon className={className} />;
  }
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
  const whatsappHref =
    config.showWhatsApp && whatsapp
      ? buildWhatsAppUrl(
          whatsapp,
          buildWhatsAppMessage(channel?.prefilledMessageTemplate, labels),
        )
      : null;

  return (
    <article
      className="relative w-full max-w-full overflow-hidden rounded-sm border border-brand-secondary/15 bg-brand-surface p-4 shadow-sm sm:p-5 lg:p-6 lg:hover:bg-brand-neutral/20 lg:transition-colors"
      data-testid={`contact-department-${config.department}`}
    >
      <div
        aria-hidden
        className={cn('absolute inset-y-0 left-0 w-1 lg:hidden', config.accentClass)}
      />

      <div className="flex items-start gap-4">
        <div
          className={cn(
            'hidden shrink-0 rounded-sm p-3 lg:flex',
            config.iconBgClass,
          )}
        >
          <DepartmentIcon icon={config.icon} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-semibold text-brand-on-surface lg:text-xl">
            <span className="lg:hidden">{config.mobileTitle}</span>
            <span className="hidden lg:inline">{config.title}</span>
          </h3>
          <p className="mt-2 break-words text-sm text-muted">{config.description}</p>

          <div className="mt-4 flex flex-wrap gap-2 lg:mt-6 lg:flex-col lg:gap-1">
            {phone ? (
              <>
                <ContactTrackLink
                  eventName="click_tel"
                  href={`tel:${digitsOnlyPhone(phone)}`}
                  serviceSlug={serviceSlug}
                  provinceSlug={provinceSlug}
                  aria-label={`Llamar a ${deptLabel}`}
                  className="inline-flex size-11 items-center justify-center rounded-full bg-brand-neutral text-brand-on-surface transition-colors hover:bg-brand-on-surface hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent lg:size-auto lg:min-h-11 lg:rounded-sm lg:bg-transparent lg:px-2 lg:hover:bg-brand-neutral/60 lg:hover:text-brand-accent"
                >
                  <CallIcon className="lg:text-brand-secondary" />
                  <span className="sr-only lg:not-sr-only lg:ml-3 lg:text-sm lg:font-medium">
                    {phone}
                  </span>
                </ContactTrackLink>
              </>
            ) : null}

            {email ? (
              <ContactTrackLink
                eventName="click_email"
                href={`mailto:${email.trim()}`}
                serviceSlug={serviceSlug}
                provinceSlug={provinceSlug}
                aria-label={`Email ${deptLabel}`}
                className="inline-flex size-11 items-center justify-center rounded-full bg-brand-neutral text-brand-on-surface transition-colors hover:bg-brand-on-surface hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent lg:size-auto lg:min-h-11 lg:rounded-sm lg:bg-transparent lg:px-2 lg:hover:bg-brand-neutral/60 lg:hover:text-brand-accent"
              >
                <MailIcon className="lg:text-brand-secondary" />
                <span className="sr-only lg:not-sr-only lg:ml-3 lg:text-sm lg:font-medium">
                  {email}
                </span>
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
                className="inline-flex size-11 items-center justify-center rounded-full bg-brand-neutral text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent lg:mt-3 lg:size-auto lg:min-h-11 lg:w-fit lg:rounded-sm lg:bg-[#25D366] lg:px-4 lg:text-sm lg:font-semibold lg:text-white lg:hover:bg-[#128C7E]"
              >
                <WhatsAppIcon />
                <span className="sr-only lg:not-sr-only lg:ml-2">Contactar por WhatsApp</span>
              </ContactTrackLink>
            ) : null}
          </div>
        </div>
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
    <section aria-labelledby="contact-departments-heading" className="w-full min-w-0">
      <h2
        id="contact-departments-heading"
        className="font-display text-xl font-semibold text-brand-on-surface md:text-2xl"
      >
        Departamentos
      </h2>
      <ul className="mt-6 flex flex-col gap-4 lg:gap-6">
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
