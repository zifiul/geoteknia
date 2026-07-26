export default function MachineryLoading() {
  return (
    <div className="bg-brand-surface">
      <div className="border-b border-brand-secondary/10 bg-brand-neutral/40 py-10 md:py-14">
        <div className="mx-auto max-w-[1200px] animate-pulse px-4">
          <div className="h-4 w-40 rounded bg-brand-neutral" />
          <div className="mt-4 h-10 w-3/4 max-w-lg rounded bg-brand-neutral" />
          <div className="mt-3 h-16 max-w-2xl rounded bg-brand-neutral" />
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <li key={index} className="animate-pulse rounded-lg border border-brand-secondary/10 p-4">
              <div className="aspect-[4/3] rounded bg-brand-neutral" />
              <div className="mt-4 h-6 w-2/3 rounded bg-brand-neutral" />
              <div className="mt-3 h-24 rounded bg-brand-neutral" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
