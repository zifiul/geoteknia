export default function LicitacionesLoading() {
  return (
    <div className="mx-auto max-w-[1200px] animate-pulse px-4 py-14">
      <div className="h-8 w-2/3 rounded bg-brand-neutral/60" />
      <div className="mt-4 h-4 w-full max-w-xl rounded bg-brand-neutral/40" />
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="h-48 rounded bg-brand-neutral/40" />
          <div className="h-48 rounded bg-brand-neutral/40" />
        </div>
        <div className="h-96 rounded bg-brand-neutral/50" />
      </div>
    </div>
  );
}
