import type { ServiceMethodologyStep } from '@/lib/service/parse-service-content';

export type ServiceMethodologyProps = {
  steps: ServiceMethodologyStep[];
};

export function ServiceMethodology({ steps }: ServiceMethodologyProps) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <section className="bg-brand-surface py-12 md:py-16" aria-labelledby="service-methodology-heading">
      <div className="mx-auto max-w-[1200px] px-4">
        <h2
          id="service-methodology-heading"
          className="font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
        >
          Metodología paso a paso
        </h2>
        <ol className="mt-8 space-y-6">
          {steps.map((step, index) => (
            <li
              key={`${step.title}-${index}`}
              className="flex gap-4 rounded-lg border border-brand-secondary/10 bg-brand-neutral/40 p-5"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white"
                aria-hidden
              >
                {index + 1}
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-brand-on-surface">
                  {step.title}
                </h3>
                {step.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted md:text-base">
                    {step.description}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
