import 'server-only';

import { type Prisma, WorkflowStatus } from '@prisma/client';

import { ContentNotFoundError } from '@/lib/content/errors';
import type { EditorialContentType } from '@/lib/content/schemas/workflow';
import { db } from '@/lib/db';

const EDITORIAL_SELECT = {
  id: true,
  slug: true,
  workflowStatus: true,
  currentVersion: true,
  reviewedById: true,
  approvedById: true,
  approvedAt: true,
  publishedAt: true,
  metaTitle: true,
  metaDescription: true,
  canonicalUrl: true,
  schemaType: true,
  noindex: true,
  ogImageId: true,
  h1: true,
} as const;

type EditorialRowBase = {
  id: string;
  slug: string;
  workflowStatus: WorkflowStatus;
  currentVersion: number;
  reviewedById: string | null;
  approvedById: string | null;
  approvedAt: Date | null;
  publishedAt: Date | null;
};

export type EditorialRegistryEntry = {
  entityType: string;
  load: (id: string) => Promise<(EditorialRowBase & Record<string, unknown>) | null>;
  loadInTx: (
    tx: Prisma.TransactionClient,
    id: string,
  ) => Promise<(EditorialRowBase & Record<string, unknown>) | null>;
  applyWorkflowFields: (
    tx: Prisma.TransactionClient,
    id: string,
    userId: string,
    target: WorkflowStatus,
    extra?: { body?: string; answer?: string },
  ) => Promise<void>;
  setCurrentVersion: (
    tx: Prisma.TransactionClient,
    id: string,
    version: number,
    userId: string,
  ) => Promise<void>;
  extractBody: (row: Record<string, unknown>) => Record<string, unknown>;
  extractSeo: (row: Record<string, unknown>) => Record<string, unknown> | null;
};

function pickSeo(row: Record<string, unknown>): Record<string, unknown> {
  return {
    slug: row.slug,
    metaTitle: row.metaTitle ?? null,
    metaDescription: row.metaDescription ?? null,
    canonicalUrl: row.canonicalUrl ?? null,
    schemaType: row.schemaType ?? null,
    noindex: row.noindex ?? false,
    ogImageId: row.ogImageId ?? null,
    h1: row.h1 ?? null,
  };
}

function notDeletedWhere(id: string) {
  return { id, deletedAt: null };
}

const serviceEntry: EditorialRegistryEntry = {
  entityType: 'service',
  async load(id) {
    return db.service.findFirst({
      where: notDeletedWhere(id),
      select: {
        ...EDITORIAL_SELECT,
        name: true,
        summary: true,
        body: true,
        methodology: true,
        applicableNorms: true,
        deliverables: true,
      },
    });
  },
  async loadInTx(tx, id) {
    return tx.service.findFirst({
      where: notDeletedWhere(id),
      select: {
        ...EDITORIAL_SELECT,
        name: true,
        summary: true,
        body: true,
        methodology: true,
        applicableNorms: true,
        deliverables: true,
      },
    });
  },
  async applyWorkflowFields(tx, id, userId, target, extra) {
    const data = workflowPatch(target, userId, extra?.body ? { body: extra.body } : {});
    await tx.service.update({ where: { id }, data });
  },
  async setCurrentVersion(tx, id, version, userId) {
    await tx.service.update({
      where: { id },
      data: { currentVersion: version, updatedById: userId },
    });
  },
  extractBody(row) {
    return {
      name: row.name,
      summary: row.summary,
      body: row.body,
      methodology: row.methodology,
      applicableNorms: row.applicableNorms,
      deliverables: row.deliverables,
    };
  },
  extractSeo: pickSeo,
};

const geoZoneEntry: EditorialRegistryEntry = {
  entityType: 'geo_zone',
  async load(id) {
    return db.geoZone.findFirst({
      where: notDeletedWhere(id),
      select: {
        ...EDITORIAL_SELECT,
        name: true,
        localGeology: true,
        operationalBase: true,
        body: true,
        wordCount: true,
      },
    });
  },
  async loadInTx(tx, id) {
    return tx.geoZone.findFirst({
      where: notDeletedWhere(id),
      select: {
        ...EDITORIAL_SELECT,
        name: true,
        localGeology: true,
        operationalBase: true,
        body: true,
        wordCount: true,
      },
    });
  },
  async applyWorkflowFields(tx, id, userId, target, extra) {
    const data = workflowPatch(target, userId, extra?.body ? { body: extra.body } : {});
    await tx.geoZone.update({ where: { id }, data });
  },
  async setCurrentVersion(tx, id, version, userId) {
    await tx.geoZone.update({
      where: { id },
      data: { currentVersion: version, updatedById: userId },
    });
  },
  extractBody(row) {
    return {
      name: row.name,
      localGeology: row.localGeology,
      operationalBase: row.operationalBase,
      body: row.body,
      wordCount: row.wordCount,
    };
  },
  extractSeo: pickSeo,
};

const serviceZonePageEntry: EditorialRegistryEntry = {
  entityType: 'service_zone_page',
  async load(id) {
    return db.serviceZonePage.findFirst({
      where: notDeletedWhere(id),
      select: {
        ...EDITORIAL_SELECT,
        body: true,
        serviceId: true,
        zoneId: true,
      },
    });
  },
  async loadInTx(tx, id) {
    return tx.serviceZonePage.findFirst({
      where: notDeletedWhere(id),
      select: {
        ...EDITORIAL_SELECT,
        body: true,
        serviceId: true,
        zoneId: true,
      },
    });
  },
  async applyWorkflowFields(tx, id, userId, target, extra) {
    const data = workflowPatch(target, userId, extra?.body ? { body: extra.body } : {});
    await tx.serviceZonePage.update({ where: { id }, data });
  },
  async setCurrentVersion(tx, id, version, userId) {
    await tx.serviceZonePage.update({
      where: { id },
      data: { currentVersion: version, updatedById: userId },
    });
  },
  extractBody(row) {
    return {
      body: row.body,
      serviceId: row.serviceId,
      zoneId: row.zoneId,
    };
  },
  extractSeo: pickSeo,
};

const caseStudyEntry: EditorialRegistryEntry = {
  entityType: 'case_study',
  async load(id) {
    return db.caseStudy.findFirst({
      where: notDeletedWhere(id),
      select: {
        ...EDITORIAL_SELECT,
        title: true,
        problem: true,
        solution: true,
        result: true,
        clientName: true,
      },
    });
  },
  async loadInTx(tx, id) {
    return tx.caseStudy.findFirst({
      where: notDeletedWhere(id),
      select: {
        ...EDITORIAL_SELECT,
        title: true,
        problem: true,
        solution: true,
        result: true,
        clientName: true,
      },
    });
  },
  async applyWorkflowFields(tx, id, userId, target, extra) {
    const data = workflowPatch(target, userId, extra?.body ? { body: extra.body } : {});
    await tx.caseStudy.update({ where: { id }, data });
  },
  async setCurrentVersion(tx, id, version, userId) {
    await tx.caseStudy.update({
      where: { id },
      data: { currentVersion: version, updatedById: userId },
    });
  },
  extractBody(row) {
    return {
      title: row.title,
      problem: row.problem,
      solution: row.solution,
      result: row.result,
      clientName: row.clientName,
    };
  },
  extractSeo: pickSeo,
};

const blogPostEntry: EditorialRegistryEntry = {
  entityType: 'blog_post',
  async load(id) {
    return db.blogPost.findFirst({
      where: notDeletedWhere(id),
      select: {
        ...EDITORIAL_SELECT,
        title: true,
        excerpt: true,
        body: true,
      },
    });
  },
  async loadInTx(tx, id) {
    return tx.blogPost.findFirst({
      where: notDeletedWhere(id),
      select: {
        ...EDITORIAL_SELECT,
        title: true,
        excerpt: true,
        body: true,
      },
    });
  },
  async applyWorkflowFields(tx, id, userId, target, extra) {
    const data = workflowPatch(target, userId, extra?.body ? { body: extra.body } : {});
    await tx.blogPost.update({ where: { id }, data });
  },
  async setCurrentVersion(tx, id, version, userId) {
    await tx.blogPost.update({
      where: { id },
      data: { currentVersion: version, updatedById: userId },
    });
  },
  extractBody(row) {
    return {
      title: row.title,
      excerpt: row.excerpt,
      body: row.body,
    };
  },
  extractSeo: pickSeo,
};

const faqEntry: EditorialRegistryEntry = {
  entityType: 'faq',
  async load(id) {
    const row = await db.faq.findFirst({
      where: notDeletedWhere(id),
      select: {
        id: true,
        workflowStatus: true,
        currentVersion: true,
        reviewedById: true,
        approvedById: true,
        approvedAt: true,
        publishedAt: true,
        question: true,
        answer: true,
        internalLinkUrl: true,
        order: true,
      },
    });
    return row ? { ...row, slug: row.id } : null;
  },
  async loadInTx(tx, id) {
    const row = await tx.faq.findFirst({
      where: notDeletedWhere(id),
      select: {
        id: true,
        workflowStatus: true,
        currentVersion: true,
        reviewedById: true,
        approvedById: true,
        approvedAt: true,
        publishedAt: true,
        question: true,
        answer: true,
        internalLinkUrl: true,
        order: true,
      },
    });
    return row ? { ...row, slug: row.id } : null;
  },
  async applyWorkflowFields(tx, id, userId, target, extra) {
    const bodyExtra = extra?.answer
      ? { answer: extra.answer }
      : extra?.body
        ? { answer: extra.body }
        : {};
    const data = workflowPatch(target, userId, bodyExtra);
    await tx.faq.update({ where: { id }, data });
  },
  async setCurrentVersion(tx, id, version, userId) {
    await tx.faq.update({
      where: { id },
      data: { currentVersion: version, updatedById: userId },
    });
  },
  extractBody(row) {
    return {
      question: row.question,
      answer: row.answer,
      internalLinkUrl: row.internalLinkUrl,
      order: row.order,
    };
  },
  extractSeo: () => null,
};

function workflowPatch(
  target: WorkflowStatus,
  userId: string,
  extra: Record<string, unknown>,
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    workflowStatus: target,
    updatedById: userId,
    ...extra,
  };

  if (target === WorkflowStatus.en_revision) {
    base.reviewedById = userId;
  }
  if (target === WorkflowStatus.aprobado) {
    base.approvedById = userId;
    base.approvedAt = new Date();
  }

  return base;
}

const REGISTRY: Record<EditorialContentType, EditorialRegistryEntry> = {
  service: serviceEntry,
  geo_zone: geoZoneEntry,
  service_zone_page: serviceZonePageEntry,
  case_study: caseStudyEntry,
  blog_post: blogPostEntry,
  faq: faqEntry,
};

export function getEditorialRegistryEntry(
  contentType: EditorialContentType,
): EditorialRegistryEntry {
  return REGISTRY[contentType];
}

export async function loadEditorialEntity(
  contentType: EditorialContentType,
  contentId: string,
) {
  const entry = getEditorialRegistryEntry(contentType);
  const row = await entry.load(contentId);
  if (!row) {
    throw new ContentNotFoundError();
  }
  return { entry, row };
}
