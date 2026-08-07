import Image from 'next/image';
import Link from 'next/link';

import type { PublishedMachineryDetail } from '@/lib/content/machinery';
import { buildSiloPath } from '@/lib/seo/silo-urls';

import { MachineryServiceTrackLink } from '@/components/organisms/machinery/MachineryServiceTrackLink';
import { SpecTable } from '@/components/organisms/machinery/SpecTable';

export type MachineCardProps = {
  item: PublishedMachineryDetail;
};

export function MachineCard({ item }: MachineCardProps) {
  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-lg border border-brand-secondary/10 bg-brand-neutral/30"
      data-testid="machinery-card"
    >
      {item.photoUrl ? (
        <div className="relative aspect-[4/3] w-full bg-brand-neutral">
          <Image
            src={item.photoUrl}
            alt={item.photoAlt ?? `Fotografía de ${item.name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className="flex aspect-[4/3] items-center justify-center bg-brand-neutral/80 text-sm text-muted"
          aria-hidden
        >
          Sin imagen
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-display text-xl font-semibold text-brand-on-surface">
          <Link
            href={buildSiloPath('machinery', { slug: item.slug })}
            className="hover:text-brand-accent hover:underline"
          >
            {item.name}
          </Link>
        </h2>
        {item.hasEnacLab === true ? (
          <p className="mt-2 inline-flex w-fit rounded-full bg-brand-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-accent">
            Laboratorio ENAC
          </p>
        ) : null}
        <SpecTable item={item} />
        {item.services.length > 0 ? (
          <div className="mt-auto border-t border-brand-secondary/10 pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Servicios donde se utiliza
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {item.services.map((service) => (
                <li key={service.id}>
                  <MachineryServiceTrackLink
                    href={buildSiloPath('service', { slug: service.slug })}
                    serviceSlug={service.slug}
                    serviceName={service.name}
                    machineryId={item.id}
                    className="inline-flex rounded-full bg-brand-surface px-3 py-1.5 text-sm font-medium text-brand-accent shadow-sm hover:underline"
                  >
                    {service.name}
                  </MachineryServiceTrackLink>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}
