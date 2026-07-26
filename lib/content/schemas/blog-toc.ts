import { z } from 'zod';

export const blogTocEntrySchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  level: z.union([z.literal(2), z.literal(3)]),
});

export const blogTocSchema = z.array(blogTocEntrySchema);

export type BlogTocEntry = z.infer<typeof blogTocEntrySchema>;

/** Parsea `blog_posts.toc` almacenado; devuelve null si vacío o inválido. */
export function parseStoredBlogToc(value: unknown): BlogTocEntry[] | null {
  if (value == null) {
    return null;
  }
  const parsed = blogTocSchema.safeParse(value);
  if (!parsed.success || parsed.data.length === 0) {
    return null;
  }
  return parsed.data;
}
