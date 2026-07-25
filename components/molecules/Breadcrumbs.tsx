import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/shared/cn';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Ruta de navegación" className={cn(className)}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-brand-secondary">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const content: ReactNode = item.href && !isLast ? (
            <Link
              href={item.href}
              className="underline-offset-2 hover:text-brand-on-surface hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded-sm"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={isLast ? 'font-semibold text-brand-on-surface' : undefined}
              aria-current={isLast ? 'page' : undefined}
            >
              {item.label}
            </span>
          );

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
              {index > 0 ? (
                <span aria-hidden className="text-brand-secondary/60">
                  /
                </span>
              ) : null}
              {content}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
