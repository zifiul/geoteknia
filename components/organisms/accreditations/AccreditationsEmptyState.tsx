export function AccreditationsEmptyState() {
  return (
    <div
      className="rounded-lg border border-dashed border-brand-secondary/20 bg-brand-neutral/30 px-6 py-12 text-center"
      data-testid="accreditations-empty"
    >
      <p className="font-display text-lg font-semibold text-brand-on-surface">
        Acreditaciones en actualización
      </p>
      <p className="mt-2 text-sm text-muted">
        Estamos publicando nuestros certificados y registros oficiales. Si necesita documentación
        para una licitación, contacte con nosotros.
      </p>
    </div>
  );
}
