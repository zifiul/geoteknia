export type LocalGeologyProps = {
  geology: string;
  zoneName: string;
};

export function LocalGeology({ geology, zoneName }: LocalGeologyProps) {
  if (!geology.trim()) {
    return null;
  }

  return (
    <section
      className="bg-brand-surface py-12 md:py-16"
      aria-labelledby="geo-geology-heading"
    >
      <div className="mx-auto max-w-[1200px] px-4">
        <h2
          id="geo-geology-heading"
          className="font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
        >
          Geología local en {zoneName}
        </h2>
        <div className="mt-6 max-w-3xl whitespace-pre-line text-base leading-relaxed text-muted">
          {geology}
        </div>
      </div>
    </section>
  );
}
