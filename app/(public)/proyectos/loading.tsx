export default function CaseCatalogLoading() {
  return (
    <div className="mx-auto max-w-[1200px] animate-pulse px-4 py-10">
      <div className="h-10 w-2/3 max-w-lg rounded bg-brand-neutral/60" />
      <div className="mt-4 h-4 w-full max-w-xl rounded bg-brand-neutral/40" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-72 rounded-lg border border-brand-secondary/10 bg-brand-neutral/30"
          />
        ))}
      </div>
    </div>
  );
}
