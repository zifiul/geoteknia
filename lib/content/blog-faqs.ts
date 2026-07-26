import 'server-only';

import { FaqScope, WorkflowStatus, type Prisma, SchemaType } from '@prisma/client';
import { z } from 'zod';

import {
  recordContentDeleteAudit,
  recordContentUpdateAudit,
} from '@/lib/content/content-audit';
import { ContentNotFoundError } from '@/lib/content/errors';
import {
  assertActiveBlogCategoryId,
  assertActiveFaqGroupId,
  assertActiveServiceIds,
} from '@/lib/content/references';
import { editorialCrudBlockSchema } from '@/lib/content/schemas/editorial';
import {
  blogCategorySeoSchema,
  faqGroupSeoSchema,
  seoBlockSchema,
} from '@/lib/content/schemas/seo';
import { blogTocSchema, parseStoredBlogToc, type BlogTocEntry } from '@/lib/content/schemas/blog-toc';
import { ensureUniqueSlug, resolveMediaFileUrl } from '@/lib/content/slug';
import { env } from '@/lib/env';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { PUBLISHED_EDITORIAL_WHERE } from '@/lib/content/published-filter';

export const createBlogCategorySchema = z
  .object({
    name: z.string().min(1),
    description: z.string().nullable().optional(),
  })
  .merge(blogCategorySeoSchema);

export const updateBlogCategorySchema = createBlogCategorySchema.partial();

const BLOG_CATEGORY_ENTITY = 'blog_category';

export async function createBlogCategory(
  user: PortalSessionPayload,
  raw: unknown,
): Promise<{ id: string }> {
  const input = createBlogCategorySchema.parse(raw);
  await ensureUniqueSlug(db.blogCategory, input.slug);
  return db.blogCategory.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      slug: input.slug,
      metaTitle: input.metaTitle ?? null,
      metaDescription: input.metaDescription ?? null,
      noindex: input.noindex ?? false,
      createdById: user.userId,
      updatedById: user.userId,
    },
    select: { id: true },
  });
}

export async function updateBlogCategory(
  user: PortalSessionPayload,
  categoryId: string,
  raw: unknown,
): Promise<void> {
  const input = updateBlogCategorySchema.parse(raw);
  const existing = await db.blogCategory.findFirst({
    where: { id: categoryId, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  if (input.slug) {
    await ensureUniqueSlug(db.blogCategory, input.slug, { excludeId: categoryId });
  }
  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.blogCategory.update({
      where: { id: categoryId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.metaTitle !== undefined ? { metaTitle: input.metaTitle } : {}),
        ...(input.metaDescription !== undefined
          ? { metaDescription: input.metaDescription }
          : {}),
        ...(input.noindex !== undefined ? { noindex: input.noindex } : {}),
        updatedById: user.userId,
      },
    });
    await recordContentUpdateAudit(tx, user, {
      entityType: BLOG_CATEGORY_ENTITY,
      entityId: categoryId,
      entitySlug: input.slug ?? existing.slug,
    });
  });
}

export async function softDeleteBlogCategory(
  user: PortalSessionPayload,
  categoryId: string,
): Promise<void> {
  const existing = await db.blogCategory.findFirst({
    where: { id: categoryId, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  await db.$transaction(async (tx) => {
    await tx.blogCategory.update({
      where: { id: categoryId },
      data: { deletedAt: new Date(), updatedById: user.userId },
    });
    await recordContentDeleteAudit(tx, user, {
      entityType: BLOG_CATEGORY_ENTITY,
      entityId: categoryId,
      entitySlug: existing.slug,
    });
  });
}

const blogPostBodySchema = z.object({
  title: z.string().min(1),
  categoryId: z.uuid(),
  teamAuthorId: z.uuid(),
  body: z.string().min(1),
  toc: blogTocSchema.optional(),
  readingMinutes: z.number().int().nullable().optional(),
  excerpt: z.string().nullable().optional(),
  heroImageId: z.uuid().nullable().optional(),
  serviceIds: z.array(z.uuid()).optional(),
});

export const createBlogPostSchema = blogPostBodySchema
  .merge(seoBlockSchema)
  .merge(editorialCrudBlockSchema);

export const updateBlogPostSchema = blogPostBodySchema
  .partial()
  .merge(seoBlockSchema.partial())
  .merge(editorialCrudBlockSchema.partial());

const BLOG_POST_ENTITY = 'blog_post';

async function syncBlogPostServices(
  tx: Prisma.TransactionClient,
  blogPostId: string,
  serviceIds: string[],
): Promise<void> {
  await assertActiveServiceIds(tx, serviceIds);
  await tx.blogPostService.deleteMany({ where: { blogPostId } });
  if (serviceIds.length > 0) {
    await tx.blogPostService.createMany({
      data: serviceIds.map((serviceId) => ({ blogPostId, serviceId })),
    });
  }
}

export async function createBlogPost(
  user: PortalSessionPayload,
  raw: unknown,
): Promise<{ id: string }> {
  const input = createBlogPostSchema.parse(raw);
  await assertActiveBlogCategoryId(db, input.categoryId);
  await ensureUniqueSlug(db.blogPost, input.slug);

  return db.$transaction(async (tx) => {
    const row = await tx.blogPost.create({
      data: {
        title: input.title,
        categoryId: input.categoryId,
        teamAuthorId: input.teamAuthorId,
        body: input.body,
        toc: input.toc ?? undefined,
        readingMinutes: input.readingMinutes ?? null,
        excerpt: input.excerpt ?? null,
        heroImageId: input.heroImageId ?? null,
        slug: input.slug,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        canonicalUrl: input.canonicalUrl ?? null,
        schemaType: input.schemaType,
        noindex: input.noindex ?? false,
        ogImageId: input.ogImageId ?? null,
        h1: input.h1 ?? null,
        workflowStatus: WorkflowStatus.borrador_ia,
        isAiAssisted: input.isAiAssisted ?? false,
        authorId: input.authorId ?? user.userId,
        createdById: user.userId,
        updatedById: user.userId,
      },
      select: { id: true },
    });
    if (input.serviceIds) {
      await syncBlogPostServices(tx, row.id, input.serviceIds);
    }
    return row;
  });
}

export async function updateBlogPost(
  user: PortalSessionPayload,
  blogPostId: string,
  raw: unknown,
): Promise<void> {
  const input = updateBlogPostSchema.parse(raw);
  const existing = await db.blogPost.findFirst({
    where: { id: blogPostId, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  if (input.categoryId) {
    await assertActiveBlogCategoryId(db, input.categoryId);
  }
  if (input.slug) {
    await ensureUniqueSlug(db.blogPost, input.slug, { excludeId: blogPostId });
  }

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.blogPost.update({
      where: { id: blogPostId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
        ...(input.teamAuthorId !== undefined
          ? { teamAuthorId: input.teamAuthorId }
          : {}),
        ...(input.body !== undefined ? { body: input.body } : {}),
        ...(input.toc !== undefined ? { toc: input.toc ?? undefined } : {}),
        ...(input.readingMinutes !== undefined
          ? { readingMinutes: input.readingMinutes }
          : {}),
        ...(input.excerpt !== undefined ? { excerpt: input.excerpt } : {}),
        ...(input.heroImageId !== undefined
          ? { heroImageId: input.heroImageId }
          : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.metaTitle !== undefined ? { metaTitle: input.metaTitle } : {}),
        ...(input.metaDescription !== undefined
          ? { metaDescription: input.metaDescription }
          : {}),
        ...(input.canonicalUrl !== undefined
          ? { canonicalUrl: input.canonicalUrl }
          : {}),
        ...(input.schemaType !== undefined ? { schemaType: input.schemaType } : {}),
        ...(input.noindex !== undefined ? { noindex: input.noindex } : {}),
        ...(input.ogImageId !== undefined ? { ogImageId: input.ogImageId } : {}),
        ...(input.h1 !== undefined ? { h1: input.h1 } : {}),
        ...(input.workflowStatus !== undefined
          ? { workflowStatus: input.workflowStatus }
          : {}),
        ...(input.isAiAssisted !== undefined
          ? { isAiAssisted: input.isAiAssisted }
          : {}),
        ...(input.authorId !== undefined ? { authorId: input.authorId } : {}),
        updatedById: user.userId,
      },
    });
    if (input.serviceIds) {
      await syncBlogPostServices(tx, blogPostId, input.serviceIds);
    }
    await recordContentUpdateAudit(tx, user, {
      entityType: BLOG_POST_ENTITY,
      entityId: blogPostId,
      entitySlug: input.slug ?? existing.slug,
    });
  });
}

export async function softDeleteBlogPost(
  user: PortalSessionPayload,
  blogPostId: string,
): Promise<void> {
  const existing = await db.blogPost.findFirst({
    where: { id: blogPostId, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  await db.$transaction(async (tx) => {
    await tx.blogPost.update({
      where: { id: blogPostId },
      data: { deletedAt: new Date(), updatedById: user.userId },
    });
    await recordContentDeleteAudit(tx, user, {
      entityType: BLOG_POST_ENTITY,
      entityId: blogPostId,
      entitySlug: existing.slug,
    });
  });
}

export const createFaqGroupSchema = z
  .object({
    name: z.string().min(1),
    scope: z.nativeEnum(FaqScope),
    serviceId: z.uuid().nullable().optional(),
  })
  .merge(faqGroupSeoSchema);

export const updateFaqGroupSchema = createFaqGroupSchema.partial();

const FAQ_GROUP_ENTITY = 'faq_group';

export async function createFaqGroup(
  user: PortalSessionPayload,
  raw: unknown,
): Promise<{ id: string }> {
  const input = createFaqGroupSchema.parse(raw);
  if (input.serviceId) {
    await assertActiveServiceIds(db, [input.serviceId]);
  }
  await ensureUniqueSlug(db.faqGroup, input.slug);
  return db.faqGroup.create({
    data: {
      name: input.name,
      scope: input.scope,
      serviceId: input.serviceId ?? null,
      slug: input.slug,
      schemaType: input.schemaType,
      createdById: user.userId,
      updatedById: user.userId,
    },
    select: { id: true },
  });
}

export async function updateFaqGroup(
  user: PortalSessionPayload,
  faqGroupId: string,
  raw: unknown,
): Promise<void> {
  const input = updateFaqGroupSchema.parse(raw);
  const existing = await db.faqGroup.findFirst({
    where: { id: faqGroupId, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  if (input.serviceId) {
    await assertActiveServiceIds(db, [input.serviceId]);
  }
  if (input.slug) {
    await ensureUniqueSlug(db.faqGroup, input.slug, { excludeId: faqGroupId });
  }
  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.faqGroup.update({
      where: { id: faqGroupId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.scope !== undefined ? { scope: input.scope } : {}),
        ...(input.serviceId !== undefined ? { serviceId: input.serviceId } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.schemaType !== undefined ? { schemaType: input.schemaType } : {}),
        updatedById: user.userId,
      },
    });
    await recordContentUpdateAudit(tx, user, {
      entityType: FAQ_GROUP_ENTITY,
      entityId: faqGroupId,
      entitySlug: input.slug ?? existing.slug,
    });
  });
}

export async function softDeleteFaqGroup(
  user: PortalSessionPayload,
  faqGroupId: string,
): Promise<void> {
  const existing = await db.faqGroup.findFirst({
    where: { id: faqGroupId, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  await db.$transaction(async (tx) => {
    await tx.faqGroup.update({
      where: { id: faqGroupId },
      data: { deletedAt: new Date(), updatedById: user.userId },
    });
    await recordContentDeleteAudit(tx, user, {
      entityType: FAQ_GROUP_ENTITY,
      entityId: faqGroupId,
      entitySlug: existing.slug,
    });
  });
}

const faqBodySchema = z.object({
  faqGroupId: z.uuid(),
  question: z.string().min(1),
  answer: z.string().min(1),
  internalLinkUrl: z.url().nullable().optional(),
  order: z.number().int().nullable().optional(),
});

export const createFaqSchema = faqBodySchema.merge(editorialCrudBlockSchema);
export const updateFaqSchema = faqBodySchema
  .partial()
  .merge(editorialCrudBlockSchema.partial());

const FAQ_ENTITY = 'faq';

export async function createFaq(
  user: PortalSessionPayload,
  raw: unknown,
): Promise<{ id: string }> {
  const input = createFaqSchema.parse(raw);
  await assertActiveFaqGroupId(db, input.faqGroupId);
  return db.faq.create({
    data: {
      faqGroupId: input.faqGroupId,
      question: input.question,
      answer: input.answer,
      internalLinkUrl: input.internalLinkUrl ?? null,
      order: input.order ?? null,
      workflowStatus: WorkflowStatus.borrador_ia,
      isAiAssisted: input.isAiAssisted ?? false,
      authorId: input.authorId ?? user.userId,
      createdById: user.userId,
      updatedById: user.userId,
    },
    select: { id: true },
  });
}

export async function updateFaq(
  user: PortalSessionPayload,
  faqId: string,
  raw: unknown,
): Promise<void> {
  const input = updateFaqSchema.parse(raw);
  const existing = await db.faq.findFirst({
    where: { id: faqId, deletedAt: null },
    select: { id: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  if (input.faqGroupId) {
    await assertActiveFaqGroupId(db, input.faqGroupId);
  }
  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.faq.update({
      where: { id: faqId },
      data: {
        ...(input.faqGroupId !== undefined ? { faqGroupId: input.faqGroupId } : {}),
        ...(input.question !== undefined ? { question: input.question } : {}),
        ...(input.answer !== undefined ? { answer: input.answer } : {}),
        ...(input.internalLinkUrl !== undefined
          ? { internalLinkUrl: input.internalLinkUrl }
          : {}),
        ...(input.order !== undefined ? { order: input.order } : {}),
        ...(input.workflowStatus !== undefined
          ? { workflowStatus: input.workflowStatus }
          : {}),
        ...(input.isAiAssisted !== undefined
          ? { isAiAssisted: input.isAiAssisted }
          : {}),
        ...(input.authorId !== undefined ? { authorId: input.authorId } : {}),
        updatedById: user.userId,
      },
    });
    await recordContentUpdateAudit(tx, user, {
      entityType: FAQ_ENTITY,
      entityId: faqId,
    });
  });
}

export async function softDeleteFaq(
  user: PortalSessionPayload,
  faqId: string,
): Promise<void> {
  const existing = await db.faq.findFirst({
    where: { id: faqId, deletedAt: null },
    select: { id: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  await db.$transaction(async (tx) => {
    await tx.faq.update({
      where: { id: faqId },
      data: { deletedAt: new Date(), updatedById: user.userId },
    });
    await recordContentDeleteAudit(tx, user, {
      entityType: FAQ_ENTITY,
      entityId: faqId,
    });
  });
}

export type PublishedServiceFaqItem = {
  id: string;
  question: string;
  answer: string;
  order: number | null;
};

export async function listPublishedFaqsByService(
  serviceId: string,
): Promise<PublishedServiceFaqItem[]> {
  return db.faq.findMany({
    where: {
      ...PUBLISHED_EDITORIAL_WHERE,
      faqGroup: {
        serviceId,
        deletedAt: null,
      },
    },
    orderBy: [{ order: 'asc' }, { question: 'asc' }],
    select: {
      id: true,
      question: true,
      answer: true,
      order: true,
    },
  });
}

export type PublishedBlogPostParam = {
  categoria: string;
  slug: string;
};

export type PublishedBlogPostRelatedService = {
  id: string;
  name: string;
  slug: string;
};

export type PublishedBlogPostDetail = {
  id: string;
  title: string;
  slug: string;
  h1: string | null;
  excerpt: string | null;
  body: string;
  toc: BlogTocEntry[] | null;
  readingMinutes: number | null;
  publishedAt: Date | null;
  updatedAt: Date;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  schemaType: SchemaType;
  noindex: boolean;
  ogImageId: string | null;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  category: { id: string; name: string; slug: string };
  teamAuthorSlug: string;
};

async function resolveHeroImage(
  heroImageId: string | null,
): Promise<{ heroImageUrl: string | null; heroImageAlt: string | null }> {
  if (!heroImageId) {
    return { heroImageUrl: null, heroImageAlt: null };
  }
  const asset = await db.mediaAsset.findFirst({
    where: { id: heroImageId, deletedAt: null },
    select: { fileUrl: true, altText: true },
  });
  if (!asset) {
    return { heroImageUrl: null, heroImageAlt: null };
  }
  return {
    heroImageUrl: resolveMediaFileUrl(asset.fileUrl, env.MEDIA_STORAGE_BASE_URL),
    heroImageAlt: asset.altText,
  };
}

export type PublishedBlogCategorySummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  noindex: boolean;
};

export type PublishedBlogCatalogItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: Date | null;
  readingMinutes: number | null;
  category: { name: string; slug: string };
  teamAuthorSlug: string;
  teamAuthorName: string;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
};

export type BlogCatalogPageResult = {
  items: PublishedBlogCatalogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const blogCatalogItemSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  publishedAt: true,
  readingMinutes: true,
  heroImageId: true,
  category: { select: { name: true, slug: true } },
  teamAuthor: { select: { slug: true, fullName: true } },
} as const;

export async function listPublishedBlogCategories(): Promise<
  Array<Pick<PublishedBlogCategorySummary, 'id' | 'name' | 'slug' | 'noindex'>>
> {
  return db.blogCategory.findMany({
    where: { deletedAt: null },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true, noindex: true },
  });
}

export async function getPublishedBlogCategoryBySlug(
  slug: string,
): Promise<PublishedBlogCategorySummary | null> {
  return db.blogCategory.findFirst({
    where: { slug, deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      metaTitle: true,
      metaDescription: true,
      noindex: true,
    },
  });
}

async function attachBlogCatalogHeroImages(
  rows: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    publishedAt: Date | null;
    readingMinutes: number | null;
    heroImageId: string | null;
    category: { name: string; slug: string };
    teamAuthor: { slug: string; fullName: string };
  }>,
): Promise<PublishedBlogCatalogItem[]> {
  const imageIds = [
    ...new Set(rows.map((row) => row.heroImageId).filter((id): id is string => Boolean(id))),
  ];
  const assets =
    imageIds.length > 0
      ? await db.mediaAsset.findMany({
          where: { id: { in: imageIds }, deletedAt: null },
          select: { id: true, fileUrl: true, altText: true },
        })
      : [];
  const assetById = new Map(assets.map((asset) => [asset.id, asset]));
  const mediaBase = env.MEDIA_STORAGE_BASE_URL;

  return rows.map((row) => {
    const asset = row.heroImageId ? assetById.get(row.heroImageId) : undefined;
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      publishedAt: row.publishedAt,
      readingMinutes: row.readingMinutes,
      category: row.category,
      teamAuthorSlug: row.teamAuthor.slug,
      teamAuthorName: row.teamAuthor.fullName,
      heroImageUrl: asset ? resolveMediaFileUrl(asset.fileUrl, mediaBase) : null,
      heroImageAlt: asset?.altText ?? row.title,
    };
  });
}

export async function listPublishedBlogPostsByCategory(input: {
  categorySlug?: string | null;
  page: number;
  pageSize: number;
}): Promise<BlogCatalogPageResult> {
  const page = input.page < 1 ? 1 : input.page;
  const pageSize = input.pageSize < 1 ? 1 : input.pageSize;
  const clauses: Prisma.BlogPostWhereInput[] = [PUBLISHED_EDITORIAL_WHERE];
  const categorySlug = input.categorySlug?.trim();
  if (categorySlug) {
    clauses.push({ category: { slug: categorySlug, deletedAt: null } });
  }
  const where = clauses.length === 1 ? clauses[0]! : { AND: clauses };
  const skip = (page - 1) * pageSize;

  const [total, rows] = await Promise.all([
    db.blogPost.count({ where }),
    db.blogPost.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
      skip,
      take: pageSize,
      select: blogCatalogItemSelect,
    }),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const safePage = totalPages > 0 && page > totalPages ? totalPages : page;

  if (safePage !== page && total > 0) {
    return listPublishedBlogPostsByCategory({
      categorySlug: input.categorySlug,
      page: safePage,
      pageSize,
    });
  }

  const items = await attachBlogCatalogHeroImages(rows);

  return {
    items,
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export async function listPublishedBlogPostParams(): Promise<PublishedBlogPostParam[]> {
  const rows = await db.blogPost.findMany({
    where: PUBLISHED_EDITORIAL_WHERE,
    select: {
      slug: true,
      category: { select: { slug: true } },
    },
  });
  return rows.map((row) => ({
    categoria: row.category.slug,
    slug: row.slug,
  }));
}

export async function getPublishedBlogPostBySlug(
  categorySlug: string,
  slug: string,
): Promise<PublishedBlogPostDetail | null> {
  const row = await db.blogPost.findFirst({
    where: {
      ...PUBLISHED_EDITORIAL_WHERE,
      slug,
      category: { slug: categorySlug, deletedAt: null },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      h1: true,
      excerpt: true,
      body: true,
      toc: true,
      readingMinutes: true,
      publishedAt: true,
      updatedAt: true,
      metaTitle: true,
      metaDescription: true,
      canonicalUrl: true,
      schemaType: true,
      noindex: true,
      ogImageId: true,
      heroImageId: true,
      category: { select: { id: true, name: true, slug: true } },
      teamAuthor: { select: { slug: true } },
    },
  });
  if (!row) {
    return null;
  }
  const { heroImageUrl, heroImageAlt } = await resolveHeroImage(row.heroImageId);
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    h1: row.h1,
    excerpt: row.excerpt,
    body: row.body,
    toc: parseStoredBlogToc(row.toc),
    readingMinutes: row.readingMinutes,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    canonicalUrl: row.canonicalUrl,
    schemaType: row.schemaType,
    noindex: row.noindex,
    ogImageId: row.ogImageId,
    heroImageUrl,
    heroImageAlt,
    category: row.category,
    teamAuthorSlug: row.teamAuthor.slug,
  };
}

export async function listRelatedServicesByBlogPost(
  blogPostId: string,
): Promise<PublishedBlogPostRelatedService[]> {
  const links = await db.blogPostService.findMany({
    where: { blogPostId },
    select: { serviceId: true },
  });
  const serviceIds = links.map((link) => link.serviceId);
  if (serviceIds.length === 0) {
    return [];
  }
  return db.service.findMany({
    where: {
      id: { in: serviceIds },
      ...PUBLISHED_EDITORIAL_WHERE,
    },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}
