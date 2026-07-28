export default function AdminProyectosLoading() {
  return (
    <div className="mx-auto max-w-[1600px] animate-pulse space-y-6">
      <div className="h-24 rounded-xl bg-brand-neutral/50" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-brand-neutral/50" />
        ))}
      </div>
      <div className="h-40 rounded-xl bg-brand-neutral/50" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 w-72 shrink-0 rounded-xl bg-brand-neutral/50" />
        ))}
      </div>
    </div>
  );
}
