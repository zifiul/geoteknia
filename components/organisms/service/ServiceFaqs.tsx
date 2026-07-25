import type { PublishedServiceFaqItem } from '@/lib/content/blog-faqs';

export type ServiceFaqsProps = {
  faqs: PublishedServiceFaqItem[];
};

export function ServiceFaqs({ faqs }: ServiceFaqsProps) {
  if (faqs.length === 0) {
    return null;
  }

  return (
    <section className="bg-brand-neutral/50 py-12 md:py-16" aria-labelledby="service-faqs-heading">
      <div className="mx-auto max-w-[1200px] px-4">
        <h2
          id="service-faqs-heading"
          className="font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
        >
          Preguntas frecuentes
        </h2>
        <dl className="mt-8 space-y-6">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="rounded-lg border border-brand-secondary/10 bg-brand-surface p-5"
            >
              <dt className="font-display text-lg font-semibold text-brand-on-surface">
                {faq.question}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted md:text-base">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
