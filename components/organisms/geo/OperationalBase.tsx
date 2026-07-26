export type OperationalBaseProps = {
  operationalBase: string | null;
  zoneName: string;
};

export function OperationalBase({ operationalBase, zoneName }: OperationalBaseProps) {
  if (!operationalBase?.trim()) {
    return null;
  }

  return (
    <section
      className="bg-brand-surface py-12 md:py-16"
      aria-labelledby="geo-operational-heading"
    >
      <div className="mx-auto max-w-[1200px] px-4">
        <h2
          id="geo-operational-heading"
          className="font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
        >
          Base operativa y maquinaria en {zoneName}
        </h2>
        <div className="mt-6 max-w-3xl whitespace-pre-line text-base leading-relaxed text-muted">
          {operationalBase}
        </div>
      </div>
    </section>
  );
}
