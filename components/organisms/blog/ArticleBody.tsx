export type ArticleBodyProps = {
  html: string;
};

export function ArticleBody({ html }: ArticleBodyProps) {
  return (
    <div
      className="article-body space-y-4 text-base leading-relaxed text-brand-on-surface/90 [&_a]:font-medium [&_a]:text-brand-accent [&_a]:underline-offset-2 hover:[&_a]:underline [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-brand-on-surface [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-brand-on-surface [&_img]:max-w-full [&_img]:rounded-lg [&_li]:ml-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:text-pretty [&_ul]:list-disc [&_ul]:pl-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
