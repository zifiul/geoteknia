import { LocationIcon, ScheduleIcon } from '@/components/organisms/contact/contact-icons';
import {
  CONTACT_OFFICE_HOURS_LONG,
} from '@/lib/contact/page-config';
import type { PublicNapSnapshot } from '@/lib/contact/public-nap';

export type ContactOfficePanelProps = {
  nap: PublicNapSnapshot;
};

export function ContactOfficePanel({ nap }: ContactOfficePanelProps) {
  return (
    <section
      aria-labelledby="contact-office-heading"
      className="rounded-sm bg-brand-on-surface p-6 text-white shadow-sm"
    >
      <div className="flex items-start gap-3">
        <LocationIcon className="mt-1 text-brand-neutral" />
        <div>
          <h2
            id="contact-office-heading"
            className="font-display text-lg font-semibold"
          >
            Oficina Central y Laboratorio
          </h2>
          <address className="mt-2 space-y-1 not-italic text-sm text-brand-neutral">
            <p className="font-medium text-white">{nap.displayName}</p>
            {nap.address ? (
              <p data-testid="contact-office-address">{nap.address}</p>
            ) : null}
          </address>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 border-t border-white/15 pt-4">
        <ScheduleIcon className="mt-0.5 text-brand-neutral" />
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-white">
            Horario de atención
          </h3>
          <p className="mt-1 text-sm text-brand-neutral" data-testid="contact-office-hours">
            {CONTACT_OFFICE_HOURS_LONG}
          </p>
        </div>
      </div>
    </section>
  );
}
