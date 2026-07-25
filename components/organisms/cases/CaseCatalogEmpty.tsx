import Link from 'next/link';

import { LinkButton } from '@/components/atoms/LinkButton';
import { CASE_CATALOG_BASE_PATH } from '@/lib/cases/catalog-config';

export type CaseCatalogEmptyProps = {
  hasActiveFilters: boolean;
};

export function CaseCatalogEmpty({ hasActiveFilters }: CaseCatalogEmptyProps) {
  return (
    <div
      className="rounded-lg border border-dashed border-brand-secondary/25 bg-brand-neutral/30 px-6 py-12 text-center"
      data-testid="case-catalog-empty"
    >
      <h2 className="font-display text-xl font-semibold text-brand-on-surface">
        {hasActiveFilters
          ? 'Ningún caso coincide con los filtros'
          : 'Aún no hay casos publicados'}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted">
        {hasActiveFilters
          ? 'Prueba a ampliar criterios o restablece los filtros para ver todo el catálogo.'
          : 'Vuelve pronto o contáctanos para conocer proyectos recientes.'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {hasActiveFilters ? (
          <LinkButton href={CASE_CATALOG_BASE_PATH} variant="outline">
            Limpiar filtros
          </LinkButton>
        ) : null}
        <LinkButton href="/contacto" variant="primary">
          Contactar
        </LinkButton>
      </div>
      {hasActiveFilters ? (
        <p className="mt-4 text-xs text-muted">
          ¿Necesitas un estudio similar?{' '}
          <Link href="/contacto" className="font-medium text-brand-accent hover:underline">
            Solicita presupuesto
          </Link>
        </p>
      ) : null}
    </div>
  );
}
