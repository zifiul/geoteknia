import { FaqAccordion } from '@/components/organisms/faq/FaqAccordion';
import type { PublishedFaqItem } from '@/lib/content/blog-faqs';

export type ServiceFaqsProps = {
  faqs: PublishedFaqItem[];
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
        <div className="mt-8">
          <FaqAccordion items={faqs} />
        </div>
      </div>
    </section>
  );
}
