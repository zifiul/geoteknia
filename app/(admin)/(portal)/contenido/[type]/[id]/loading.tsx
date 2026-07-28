export default function CmsEditorLoading() {
  return (
    <div
      className="mx-auto max-w-[1600px] animate-pulse space-y-4 px-4 py-6"
      aria-busy="true"
      aria-label="Cargando editor"
      data-testid="cms-editor-skeleton"
    >
      <div className="h-8 w-1/3 rounded bg-brand-neutral/60" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="h-48 rounded-xl bg-brand-neutral/50" />
          <div className="h-64 rounded-xl bg-brand-neutral/50" />
        </div>
        <div className="h-[480px] rounded-xl bg-brand-neutral/50" />
      </div>
    </div>
  );
}
