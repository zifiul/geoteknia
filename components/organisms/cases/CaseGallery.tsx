import Image from 'next/image';

import type { ContentMediaGalleryItem } from '@/lib/content/media-assets';

export type CaseGalleryProps = {
  items: ContentMediaGalleryItem[];
  caseTitle: string;
};

export function CaseGallery({ items, caseTitle }: CaseGalleryProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="bg-brand-surface py-12 md:py-16" aria-labelledby="case-gallery-heading">
      <div className="mx-auto max-w-[1200px] px-4">
        <h2
          id="case-gallery-heading"
          className="font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
        >
          Fotografías de campo
        </h2>
        <ul
          className="mt-8 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-3"
          aria-label={`Galería de ${caseTitle}`}
        >
          {items.map((item, index) => (
            <li
              key={`${item.order}-${index}`}
              className="min-w-[min(100%,20rem)] shrink-0 snap-center md:min-w-0"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-brand-secondary/10 bg-brand-neutral/40">
                <Image
                  src={item.url}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
