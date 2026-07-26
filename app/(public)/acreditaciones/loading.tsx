export default function AcreditacionesLoading() {
  return (
    <div className="mx-auto max-w-[1200px] animate-pulse px-4 py-16">
      <div className="h-8 w-2/3 rounded bg-brand-neutral/60" />
      <div className="mt-4 h-4 w-full max-w-xl rounded bg-brand-neutral/40" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="h-40 rounded-lg bg-brand-neutral/50" />
        <div className="h-40 rounded-lg bg-brand-neutral/50" />
      </div>
    </div>
  );
}
