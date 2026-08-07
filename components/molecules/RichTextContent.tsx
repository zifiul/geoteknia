import { cn } from '@/lib/shared/cn';

export const RICH_TEXT_CONTENT_CLASS =
  'article-body space-y-4 text-base leading-relaxed text-brand-on-surface/90 [&_a]:font-medium [&_a]:text-brand-accent [&_a]:underline-offset-2 hover:[&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-brand-secondary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-brand-on-surface [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-brand-on-surface [&_h4]:mt-6 [&_h4]:font-display [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-brand-on-surface [&_img]:max-w-full [&_img]:rounded-lg [&_li]:ml-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:text-pretty [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-brand-secondary/20 [&_td]:p-2 [&_th]:border [&_th]:border-brand-secondary/20 [&_th]:bg-brand-neutral/50 [&_th]:p-2 [&_th]:text-left [&_ul]:list-disc [&_ul]:pl-4';

export type RichTextContentProps = {
  html: string;
  className?: string;
};

/**
 * Renderiza HTML editorial ya sanitizado.
 * Los llamadores deben pasar HTML procesado con sanitizeCmsHtml o sanitizeCmsHtmlClient.
 */
export function RichTextContent({ html, className }: RichTextContentProps) {
  if (!html.trim()) {
    return null;
  }

  return (
    <div
      className={cn(RICH_TEXT_CONTENT_CLASS, className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
