import Image from 'next/image';

import type { PublishedCaseStudyCatalogItem } from '@/lib/content/case-studies';
import { buildSiloPath } from '@/lib/seo/silo-urls';

import { CaseCardSelectLink } from './CaseCardSelectLink';

export type CaseCardProps = {
  item: PublishedCaseStudyCatalogItem;
};

function formatVolume(item: PublishedCaseStudyCatalogItem): string | null {
  const parts: string[] = [];
  if (item.boreholesCount != null && item.boreholesCount > 0) {
    parts.push(
      `${item.boreholesCount} ${item.boreholesCount === 1 ? 'sondeo' : 'sondeos'}`,
    );
  }
  if (item.metersDrilled != null && item.metersDrilled > 0) {
    const meters = Number.isInteger(item.metersDrilled)
      ? String(item.metersDrilled)
      : item.metersDrilled.toFixed(1);
    parts.push(`${meters} m perforados`);
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function CaseCard({ item }: CaseCardProps) {
  const href = buildSiloPath('case_study', { slug: item.slug });
  const volume = formatVolume(item);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-brand-secondary/10 bg-brand-surface shadow-sm">
      <div className="relative aspect-[16/10] w-full bg-brand-neutral/40">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.imageAlt ?? item.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-full min-h-[10rem] items-center justify-center text-sm text-muted"
            aria-hidden
          >
            Sin imagen
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2 text-xs font-medium text-brand-secondary">
          <span className="rounded-full bg-brand-neutral/80 px-2.5 py-0.5">
            {item.service.name}
          </span>
          <span className="rounded-full bg-brand-neutral/80 px-2.5 py-0.5">
            {item.workTypology.name}
          </span>
          <span className="rounded-full bg-brand-neutral/80 px-2.5 py-0.5">
            {item.province.name}
            {item.projectYear ? ` · ${item.projectYear}` : ''}
          </span>
        </div>
        <h2 className="mt-3 font-display text-lg font-semibold text-brand-on-surface">
          <CaseCardSelectLink href={href} item={item}>
            {item.title}
          </CaseCardSelectLink>
        </h2>
        {volume ? <p className="mt-2 text-sm text-muted">{volume}</p> : null}
        <CaseCardSelectLink
          href={href}
          item={item}
          className="mt-4 inline-flex text-sm font-semibold text-brand-accent hover:underline"
        >
          Ver caso de estudio
        </CaseCardSelectLink>
      </div>
    </article>
  );
}
