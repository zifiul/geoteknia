import Image from 'next/image';
import Link from 'next/link';

import type { PublishedMachineryListItem } from '@/lib/content/machinery';
import { buildSiloPath } from '@/lib/seo/silo-urls';

export type ServiceEquipmentProps = {
  items: PublishedMachineryListItem[];
};

export function ServiceEquipment({ items }: ServiceEquipmentProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="bg-brand-surface py-12 md:py-16" aria-labelledby="service-equipment-heading">
      <div className="mx-auto max-w-[1200px] px-4">
        <h2
          id="service-equipment-heading"
          className="font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
        >
          Equipamiento
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-lg border border-brand-secondary/10 bg-brand-neutral/30"
            >
              {item.photoUrl ? (
                <div className="relative aspect-[4/3] w-full bg-brand-neutral">
                  <Image
                    src={item.photoUrl}
                    alt={item.photoAlt ?? item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="p-4">
                <h3 className="font-display text-lg font-semibold text-brand-on-surface">
                  <Link
                    href={buildSiloPath('machinery', { slug: item.slug })}
                    className="hover:text-brand-accent hover:underline"
                  >
                    {item.name}
                  </Link>
                </h3>
                {item.model ? (
                  <p className="mt-1 text-sm text-muted">Modelo {item.model}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
