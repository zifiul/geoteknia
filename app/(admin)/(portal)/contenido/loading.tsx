export default function ContenidoListLoading() {
  return (
    <main className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="h-10 w-48 animate-pulse rounded-md bg-brand-neutral/60" />
        <div className="h-11 w-40 animate-pulse rounded-md bg-brand-neutral/60" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-xl border border-brand-primary/10 bg-brand-neutral/40"
          />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-xl border border-brand-primary/10 bg-brand-neutral/40" />
      <div className="h-64 animate-pulse rounded-xl border border-brand-primary/10 bg-brand-neutral/40" />
      <p className="sr-only">Cargando listado de contenido…</p>
    </main>
  );
}
