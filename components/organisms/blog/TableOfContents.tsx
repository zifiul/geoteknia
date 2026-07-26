'use client';

import { useEffect, useState } from 'react';

import { pushRawDataLayer } from '@/lib/analytics/datalayer';
import { hasAnalyticsConsent, readBrowserConsent } from '@/lib/analytics/consent';
import type { BlogTocEntry } from '@/lib/content/schemas/blog-toc';
import { cn } from '@/lib/shared/cn';

export type TableOfContentsProps = {
  entries: BlogTocEntry[];
  className?: string;
};

function trackTocClick(entryId: string) {
  const stored = readBrowserConsent();
  if (!stored || !hasAnalyticsConsent(stored.categories)) {
    return;
  }
  pushRawDataLayer({
    event: 'select_content',
    content_type: 'blog_toc',
    content_id: entryId,
    link_text: 'toc_anchor',
  });
}

function TocList({ entries, onNavigate }: { entries: BlogTocEntry[]; onNavigate: (id: string) => void }) {
  return (
    <nav aria-label="Tabla de contenidos">
      <ol className="space-y-2 text-sm">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className={cn(entry.level === 3 && 'ml-4 border-l border-brand-secondary/15 pl-3')}
          >
            <a
              href={`#${entry.id}`}
              className="text-brand-secondary hover:text-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
              onClick={() => onNavigate(entry.id)}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function TableOfContents({ entries, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const ids = entries.map((entry) => entry.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) {
      return;
    }
    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((record) => record.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    for (const element of elements) {
      observer.observe(element);
    }
    return () => observer.disconnect();
  }, [entries]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <aside className={cn('lg:sticky lg:top-24', className)}>
      <div className="hidden lg:block">
        <p className="text-label-md font-semibold uppercase tracking-widest text-brand-accent">
          En este artículo
        </p>
        <div className="mt-4 rounded-lg border border-brand-secondary/10 bg-brand-surface p-4">
          <TocList entries={entries} onNavigate={trackTocClick} />
          {activeId ? (
            <p className="sr-only" aria-live="polite">
              Sección activa: {activeId}
            </p>
          ) : null}
        </div>
      </div>
      <details className="group rounded-lg border border-brand-secondary/10 bg-brand-surface p-4 lg:hidden">
        <summary className="cursor-pointer list-none font-semibold text-brand-on-surface marker:content-none [&::-webkit-details-marker]:hidden">
          Tabla de contenidos
        </summary>
        <div className="mt-4">
          <TocList entries={entries} onNavigate={trackTocClick} />
        </div>
      </details>
    </aside>
  );
}
