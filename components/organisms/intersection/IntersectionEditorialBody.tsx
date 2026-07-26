export type IntersectionEditorialBodyProps = {
  body: string;
};

export function IntersectionEditorialBody({ body }: IntersectionEditorialBodyProps) {
  if (!body.trim()) {
    return null;
  }

  return (
    <section
      className="bg-brand-surface py-12 md:py-16"
      aria-labelledby="intersection-body-heading"
    >
      <div className="mx-auto max-w-[1200px] px-4">
        <h2
          id="intersection-body-heading"
          className="font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
        >
          Contexto geológico y alcance del servicio
        </h2>
        <div className="mt-6 max-w-3xl whitespace-pre-line text-base leading-relaxed text-muted">
          {body}
        </div>
      </div>
    </section>
  );
}
