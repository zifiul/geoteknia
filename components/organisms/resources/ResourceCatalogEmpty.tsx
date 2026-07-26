export function ResourceCatalogEmpty() {
  return (
    <div
      className="rounded-xl border border-dashed border-brand-secondary/25 bg-brand-neutral/30 px-6 py-12 text-center"
      data-testid="resource-catalog-empty"
    >
      <p className="font-display text-lg font-semibold text-brand-on-surface">
        Próximamente nuevos recursos
      </p>
      <p className="mt-2 text-sm text-muted">
        Estamos preparando guías y checklists técnicos. Mientras tanto, puede contactarnos para
        resolver dudas sobre su proyecto geotécnico.
      </p>
    </div>
  );
}
