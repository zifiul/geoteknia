import Link from 'next/link';

export type ZoneCasesProps = {
  zoneName: string;
  provinceSlug: string;
  caseCount: number;
};

export function ZoneCases({ zoneName, provinceSlug, caseCount }: ZoneCasesProps) {
  const catalogHref = `/proyectos?provincia=${encodeURIComponent(provinceSlug)}`;

  if (caseCount === 0) {
    return (
      <section
        className="bg-brand-surface py-12 md:py-16"
        aria-labelledby="geo-cases-heading"
      >
        <div className="mx-auto max-w-[1200px] px-4">
          <h2
            id="geo-cases-heading"
            className="font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
          >
            Proyectos en {zoneName}
          </h2>
          <p className="mt-4 max-w-2xl text-muted">
            Aún no hay casos publicados para esta provincia.{' '}
            <Link href="/contacto" className="font-semibold text-brand-accent hover:underline">
              Contacta con nosotros
            </Link>{' '}
            para conocer referencias recientes.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="bg-brand-surface py-12 md:py-16"
      aria-labelledby="geo-cases-heading"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2
            id="geo-cases-heading"
            className="font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
          >
            Casos realizados en {zoneName}
          </h2>
          <p className="mt-2 max-w-xl text-muted">
            {caseCount} {caseCount === 1 ? 'proyecto publicado' : 'proyectos publicados'} en el
            catálogo filtrado por provincia.
          </p>
        </div>
        <Link
          href={catalogHref}
          className="inline-flex min-h-11 items-center justify-center rounded-sm border border-brand-secondary/30 bg-brand-surface px-6 py-3 text-base font-semibold text-brand-on-surface hover:border-brand-accent hover:text-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
        >
          Ver proyectos en {zoneName}
        </Link>
      </div>
    </section>
  );
}
