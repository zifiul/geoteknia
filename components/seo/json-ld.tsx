import { escapeJsonLdScriptContent } from '@/lib/seo/json-ld-escape';

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * RSC: un único `<script type="application/ld+json">` por instancia (GTK-45).
 */
export function JsonLd({ data }: JsonLdProps) {
  const serialized = JSON.stringify(data);
  const safe = escapeJsonLdScriptContent(serialized);
  return <script type="application/ld+json">{safe}</script>;
}
