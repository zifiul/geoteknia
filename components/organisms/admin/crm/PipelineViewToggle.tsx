'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import type { PipelineView } from '@/lib/projects/pipeline-view';

type Props = {
  view: PipelineView;
  showBoardToggle: boolean;
};

function buildToggleHref(
  pathname: string,
  searchParams: URLSearchParams,
  view: PipelineView,
): string {
  const q = new URLSearchParams(searchParams.toString());
  if (view === 'board') {
    q.delete('view');
  } else {
    q.set('view', 'list');
  }
  q.delete('page');
  const s = q.toString();
  return s ? `${pathname}?${s}` : pathname;
}

export function PipelineViewToggle({ view, showBoardToggle }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!showBoardToggle) {
    return null;
  }

  const params = new URLSearchParams(searchParams.toString());
  const boardHref = buildToggleHref(pathname, params, 'board');
  const listHref = buildToggleHref(pathname, params, 'list');

  return (
    <div
      className="inline-flex rounded-lg border border-brand-secondary/20 p-1"
      role="group"
      aria-label="Vista del pipeline"
    >
      <Link
        href={boardHref}
        className={`min-h-10 rounded-md px-3 py-1.5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent ${
          view === 'board'
            ? 'bg-brand-primary text-white'
            : 'text-brand-secondary hover:bg-brand-neutral/50'
        }`}
        aria-current={view === 'board' ? 'true' : undefined}
      >
        Tablero
      </Link>
      <Link
        href={listHref}
        className={`min-h-10 rounded-md px-3 py-1.5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent ${
          view === 'list'
            ? 'bg-brand-primary text-white'
            : 'text-brand-secondary hover:bg-brand-neutral/50'
        }`}
        aria-current={view === 'list' ? 'true' : undefined}
      >
        Lista
      </Link>
    </div>
  );
}
