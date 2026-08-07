import { ScheduleIcon } from '@/components/organisms/contact/contact-icons';
import { CONTACT_OFFICE_HOURS } from '@/lib/contact/page-config';

export function ContactHoursSection() {
  return (
    <section
      aria-labelledby="contact-hours-heading"
      className="flex w-full min-w-0 items-center gap-4 rounded-sm border border-brand-secondary/15 bg-brand-neutral/30 p-4"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-neutral text-brand-on-surface">
        <ScheduleIcon />
      </div>
      <div>
        <h2
          id="contact-hours-heading"
          className="text-sm font-semibold text-brand-on-surface"
        >
          Horario de Atención
        </h2>
        <p className="text-sm text-muted" data-testid="contact-office-hours">
          {CONTACT_OFFICE_HOURS}
        </p>
      </div>
    </section>
  );
}
