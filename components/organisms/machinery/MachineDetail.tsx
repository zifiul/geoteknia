import Image from 'next/image';
import Link from 'next/link';

import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import { MachineryServiceTrackLink } from '@/components/organisms/machinery/MachineryServiceTrackLink';
import { SpecTable } from '@/components/organisms/machinery/SpecTable';
import {
  EQUIPMENT_TYPE_LABELS,
  type PublishedMachineryDetail,
} from '@/lib/content/machinery';
import { buildSiloPath } from '@/lib/seo/silo-urls';

export type MachineDetailProps = {
  item: PublishedMachineryDetail;
  breadcrumbItems: { label: string; href?: string }[];
  priorityPhoto?: boolean;
};

export function MachineDetail({
  item,
  breadcrumbItems,
  priorityPhoto = false,
}: MachineDetailProps) {
  const imageAlt = item.photoAlt?.trim() || `Fotografía de ${item.name}`;
  const typeLabel = EQUIPMENT_TYPE_LABELS[item.equipmentType];

  return (
    <article className="mx-auto max-w-[1200px] px-4 py-10 md:py-14">
      <Breadcrumbs items={breadcrumbItems} className="mb-8" />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,480px)_1fr] lg:gap-14">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-lg bg-brand-neutral/40 shadow-md lg:mx-0">
          {item.photoUrl ? (
            <Image
              src={item.photoUrl}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 480px"
              priority={priorityPhoto}
            />
          ) : (
            <div
              className="flex h-full min-h-[16rem] items-center justify-center text-sm text-muted"
              aria-hidden
            >
              Sin imagen
            </div>
          )}
        </div>
        <div>
          <p className="text-label-md font-semibold uppercase tracking-widest text-brand-accent">
            Equipamiento
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-brand-on-surface md:text-4xl">
            {item.name}
          </h1>
          <p className="mt-2 text-lg font-medium text-brand-secondary">{typeLabel}</p>
          {item.hasEnacLab === true ? (
            <p className="mt-4 inline-flex w-fit rounded-full bg-brand-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-accent">
              Laboratorio ENAC
            </p>
          ) : null}

          <SpecTable item={item} />

          {item.services.length > 0 ? (
            <section className="mt-8" aria-labelledby="machinery-services-heading">
              <h2
                id="machinery-services-heading"
                className="font-display text-xl font-semibold text-brand-on-surface"
              >
                Servicios donde se utiliza
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {item.services.map((service) => (
                  <li key={service.id}>
                    <MachineryServiceTrackLink
                      href={buildSiloPath('service', { slug: service.slug })}
                      serviceSlug={service.slug}
                      serviceName={service.name}
                      machineryId={item.id}
                      className="inline-flex rounded-full bg-brand-surface px-4 py-2 text-sm font-medium text-brand-accent shadow-sm hover:underline"
                    >
                      {service.name}
                    </MachineryServiceTrackLink>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="mt-10 border-t border-brand-secondary/10 pt-8">
            <p className="text-sm text-muted">
              ¿Necesitas este equipamiento en tu proyecto? Consulta disponibilidad y alcance técnico
              con nuestro equipo.
            </p>
            <Link
              href="/contacto"
              className="mt-4 inline-flex rounded-md bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-accent/90"
            >
              Contactar
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
