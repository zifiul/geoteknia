import { RichTextContent } from '@/components/molecules/RichTextContent';
import { sanitizeCmsHtmlClient } from '@/lib/content/sanitize-cms-html-client';

export type GeoEditorialBodyProps = {
  body: string;
};

export function GeoEditorialBody({ body }: GeoEditorialBodyProps) {
  if (!body.trim()) {
    return null;
  }

  const sanitized = sanitizeCmsHtmlClient(body);

  return (
    <section
      className="bg-brand-neutral/50 py-12 md:py-16"
      aria-labelledby="geo-body-heading"
    >
      <div className="mx-auto max-w-[1200px] px-4">
        <h2
          id="geo-body-heading"
          className="font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
        >
          Actividad y experiencia en la zona
        </h2>
        <RichTextContent html={sanitized} className="mt-6 max-w-3xl text-muted" />
      </div>
    </section>
  );
}
