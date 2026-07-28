export default function AdminProyectoDetalleLoading() {
  return (
    <div
      className="mx-auto max-w-[1200px] animate-pulse space-y-6 px-4 py-6 lg:px-6"
      data-testid="crm-project-detail-skeleton"
      aria-busy="true"
      aria-label="Cargando ficha de proyecto"
    >
      <div className="h-4 w-40 rounded bg-brand-neutral/50" />
      <div className="h-48 rounded-xl bg-brand-neutral/50" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-36 rounded-xl bg-brand-neutral/50" />
        <div className="h-36 rounded-xl bg-brand-neutral/50" />
      </div>
      <div className="h-56 rounded-xl bg-brand-neutral/50" />
      <div className="h-48 rounded-xl bg-brand-neutral/50" />
      <div className="h-48 rounded-xl bg-brand-neutral/50" />
    </div>
  );
}
