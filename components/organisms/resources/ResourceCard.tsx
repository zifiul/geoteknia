import Image from 'next/image';
import Link from 'next/link';

import type { PublishedLeadMagnetListItem } from '@/lib/content/lead-magnets';
import { RESOURCES_CATALOG_BASE_PATH } from '@/lib/resources/catalog-config';

type ResourceCardProps = {
  resource: PublishedLeadMagnetListItem;
};

export function ResourceCard({ resource }: ResourceCardProps) {
  const href = `${RESOURCES_CATALOG_BASE_PATH}/${resource.slug}`;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-brand-secondary/15 bg-brand-surface shadow-sm transition-shadow hover:shadow-md">
      <Link href={href} className="group block">
        <div className="relative aspect-[16/10] w-full bg-brand-neutral/60">
          {resource.coverImageUrl ? (
            <Image
              src={resource.coverImageUrl}
              alt={resource.coverImageAlt ?? resource.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full min-h-[10rem] items-center justify-center px-4 text-center text-sm text-muted">
              Recurso técnico
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-secondary">
            Descarga gratuita
          </p>
          <h2 className="mt-2 font-display text-lg font-semibold text-brand-on-surface group-hover:text-brand-accent">
            {resource.title}
          </h2>
          {resource.description ? (
            <p className="mt-2 line-clamp-3 text-sm text-muted">{resource.description}</p>
          ) : null}
          <span className="mt-4 text-sm font-semibold text-brand-accent">
            Solicitar descarga →
          </span>
        </div>
      </Link>
    </article>
  );
}
