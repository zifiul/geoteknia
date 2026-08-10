export function AdminPortalLoading() {
  return (
    <div
      className="mx-auto max-w-[1600px] animate-pulse space-y-6"
      aria-busy="true"
      aria-live="polite"
      data-testid="admin-portal-loading"
    >
      <div className="h-10 w-48 rounded-lg bg-brand-neutral/50" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-20 rounded-xl bg-brand-neutral/50" />
        ))}
      </div>
      <div className="h-40 rounded-xl bg-brand-neutral/50" />
      <div className="h-64 rounded-xl bg-brand-neutral/50" />
      <p className="sr-only">Cargando página…</p>
    </div>
  );
}
