'use client';

import type { CmsServiceFormValues } from '@/lib/cms/editor/service-form-schema';

const META_TITLE_MAX = 60;
const META_DESC_MAX = 155;

type Props = {
  values: CmsServiceFormValues;
  onChange: (partial: Partial<CmsServiceFormValues>) => void;
  errors: Record<string, string>;
};

export function SeoBlock({ values, onChange, errors }: Props) {
  const metaTitle = values.metaTitle ?? '';
  const metaDescription = values.metaDescription ?? '';
  const titleLen = metaTitle.length;
  const descLen = metaDescription.length;

  return (
    <section
      className="rounded-xl border border-brand-primary/10 bg-brand-surface p-4 shadow-sm"
      aria-labelledby="cms-seo-heading"
    >
      <h2 id="cms-seo-heading" className="font-semibold text-brand-primary">
        SEO
      </h2>
      <label className="mt-3 block text-sm text-brand-secondary">
        Slug URL
        <input
          className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          value={values.slug}
          onChange={(e) => onChange({ slug: e.target.value })}
        />
      </label>
      {errors.slug ? (
        <p role="alert" className="mt-1 text-sm text-red-700">
          {errors.slug}
        </p>
      ) : null}
      <label className="mt-3 block text-sm text-brand-secondary">
        H1 visible
        <input
          className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          value={values.h1 ?? ''}
          onChange={(e) => onChange({ h1: e.target.value })}
        />
      </label>
      <label className="mt-3 block text-sm text-brand-secondary">
        Meta título
        <input
          className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          maxLength={META_TITLE_MAX}
          value={metaTitle}
          onChange={(e) => onChange({ metaTitle: e.target.value })}
        />
        <span className="mt-1 block text-xs text-brand-secondary" aria-live="polite">
          {titleLen}/{META_TITLE_MAX} caracteres
        </span>
      </label>
      {errors.metaTitle ? (
        <p role="alert" className="mt-1 text-sm text-red-700">
          {errors.metaTitle}
        </p>
      ) : null}
      <label className="mt-3 block text-sm text-brand-secondary">
        Meta descripción
        <textarea
          rows={3}
          className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          maxLength={META_DESC_MAX}
          value={metaDescription}
          onChange={(e) => onChange({ metaDescription: e.target.value })}
        />
        <span className="mt-1 block text-xs text-brand-secondary" aria-live="polite">
          {descLen}/{META_DESC_MAX} caracteres
        </span>
      </label>
      {errors.metaDescription ? (
        <p role="alert" className="mt-1 text-sm text-red-700">
          {errors.metaDescription}
        </p>
      ) : null}
      <label className="mt-3 flex items-center gap-2 text-sm text-brand-secondary">
        <input
          type="checkbox"
          checked={values.noindex ?? false}
          onChange={(e) => onChange({ noindex: e.target.checked })}
        />
        No indexar (noindex)
      </label>
    </section>
  );
}
