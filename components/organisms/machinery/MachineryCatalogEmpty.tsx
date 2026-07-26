import { LinkButton } from '@/components/atoms/LinkButton';

export function MachineryCatalogEmpty() {
  return (
    <div
      className="rounded-lg border border-dashed border-brand-secondary/25 bg-brand-neutral/30 px-6 py-12 text-center"
      data-testid="machinery-catalog-empty"
    >
      <h2 className="font-display text-xl font-semibold text-brand-on-surface">
        Aún no hay equipamiento publicado
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted">
        Estamos actualizando el catálogo de maquinaria. Contacta con nuestro equipo para conocer la
        capacidad operativa disponible en tu proyecto.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <LinkButton href="/contacto" variant="primary">
          Contactar
        </LinkButton>
      </div>
    </div>
  );
}
