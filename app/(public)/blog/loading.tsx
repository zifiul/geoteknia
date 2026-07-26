export default function BlogLoading() {
  return (
    <div className="bg-brand-surface" aria-busy="true" aria-label="Cargando blog">
      <div className="border-b border-brand-secondary/10 bg-brand-neutral/40 py-10 md:py-14">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="h-4 w-40 animate-pulse rounded bg-brand-neutral/60" />
          <div className="mt-4 h-10 w-2/3 max-w-lg animate-pulse rounded bg-brand-neutral/60" />
          <div className="mt-3 h-16 w-full max-w-2xl animate-pulse rounded bg-brand-neutral/40" />
          <div className="mt-8 flex gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-brand-neutral/50"
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        <div className="h-4 w-28 animate-pulse rounded bg-brand-neutral/50" />
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <li
              key={index}
              className="h-80 animate-pulse rounded-lg border border-brand-secondary/10 bg-brand-neutral/30"
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
