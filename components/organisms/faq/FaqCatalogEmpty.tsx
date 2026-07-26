export function FaqCatalogEmpty() {
  return (
    <div
      className="rounded-lg border border-dashed border-brand-secondary/20 bg-brand-neutral/30 px-6 py-12 text-center"
      data-testid="faq-catalog-empty"
    >
      <p className="font-display text-lg font-semibold text-brand-on-surface">
        Aún no hay preguntas publicadas
      </p>
      <p className="mt-2 text-sm text-muted">
        Estamos preparando contenido técnico. Mientras tanto, puedes contactarnos para resolver tu
        consulta.
      </p>
    </div>
  );
}
