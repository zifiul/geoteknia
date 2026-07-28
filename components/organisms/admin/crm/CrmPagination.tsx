import Link from 'next/link';

type Props = {
  page: number;
  totalPages: number;
  prevHref?: string;
  nextHref?: string;
};

export function CrmPagination({ page, totalPages, prevHref, nextHref }: Props) {
  return (
    <nav aria-label="Paginación del pipeline" className="flex items-center gap-4 text-sm">
      {prevHref ? (
        <Link
          href={prevHref}
          className="min-h-11 inline-flex items-center rounded-md border border-brand-secondary/30 px-3 py-2 font-medium text-brand-primary hover:bg-brand-neutral/50"
        >
          Anterior
        </Link>
      ) : null}
      <span className="text-brand-secondary" aria-live="polite">
        Página {page} de {totalPages}
      </span>
      {nextHref ? (
        <Link
          href={nextHref}
          className="min-h-11 inline-flex items-center rounded-md border border-brand-secondary/30 px-3 py-2 font-medium text-brand-primary hover:bg-brand-neutral/50"
        >
          Siguiente
        </Link>
      ) : null}
    </nav>
  );
}

export function buildPageQuery(
  params: Record<string, string | string[] | undefined>,
  page: number,
  pageSize: number,
): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === 'page') continue;
    const v = Array.isArray(value) ? value[0] : value;
    if (v) q.set(key, v);
  }
  q.set('page', String(page));
  q.set('pageSize', String(pageSize));
  return q.toString();
}
