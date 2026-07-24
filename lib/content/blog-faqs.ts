import 'server-only';

import { FaqScope, WorkflowStatus, type Prisma } from '@prisma/client';
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
import { ensureUniqueSlug } from '@/lib/content/slug';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { db } from '@/lib/db';

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
  toc: z.unknown().optional(),
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
