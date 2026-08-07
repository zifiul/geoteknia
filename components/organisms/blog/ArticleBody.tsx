import { RichTextContent } from '@/components/molecules/RichTextContent';

export type ArticleBodyProps = {
  html: string;
};

export function ArticleBody({ html }: ArticleBodyProps) {
  return <RichTextContent html={html} />;
}
