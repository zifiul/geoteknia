import 'server-only';

import { WorkflowStatus } from '@prisma/client';

import type { PortalSessionPayload } from '@/lib/auth/session';
import { can } from '@/lib/auth/rbac';
import { ContentNotFoundError } from '@/lib/content/errors';
import { getServiceById } from '@/lib/content/services';
import type { EditorialContentType } from '@/lib/content/schemas/workflow';
import { listContentRevisions } from '@/lib/content/revisions';
import { parseStoredMachineryInSituTests } from '@/lib/content/schemas/machinery-in-situ-tests';
import { env } from '@/lib/env';
import { db } from '@/lib/db';
import { resolveNextImageMediaSrc } from '@/lib/content/slug';
import { buildSiloPath } from '@/lib/seo/silo-urls';

import type { CmsEditorRevisionItem } from './load-cms-editor-page';

export type LoadedEditorEntity = {
  entityId: string;
  initial: Record<string, unknown>;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  editorial: {
    workflowStatus: WorkflowStatus;
    scheduledPublishAt: string | null;
    publicPath: string | null;
    canUpdate: boolean;
    canPublish: boolean;
    revisions: CmsEditorRevisionItem[];
  };
};

async function resolveHero(heroImageId: string | null | undefined) {
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
    heroImageUrl: resolveNextImageMediaSrc(
      asset.fileUrl,
      env.MEDIA_STORAGE_BASE_URL,
      env.NEXT_PUBLIC_SITE_URL,
    ),
    heroImageAlt: asset.altText,
  };
}

async function resolvePhoto(photoId: string | null | undefined) {
  return resolveHero(photoId);
}

async function buildEditorial(
  contentType: EditorialContentType,
  row: {
    id: string;
    workflowStatus: WorkflowStatus;
    scheduledPublishAt: Date | null;
  },
  session: PortalSessionPayload,
  publicPath: string | null,
): Promise<LoadedEditorEntity['editorial']> {
  const revisions = await listContentRevisions(contentType, row.id);
  return {
    workflowStatus: row.workflowStatus,
    scheduledPublishAt: row.scheduledPublishAt?.toISOString() ?? null,
    publicPath,
    canUpdate: can(session, 'content.update'),
    canPublish: can(session, 'content.publish'),
    revisions: revisions.map((r) => ({
      versionNumber: r.versionNumber,
      workflowStatusAt: r.workflowStatusAt,
      editorName: r.editorName,
      changeSummary: r.changeSummary,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

export async function loadEditorEntity(
  contentType: EditorialContentType,
  entityId: string,
  session: PortalSessionPayload,
): Promise<LoadedEditorEntity | null> {
  try {
    switch (contentType) {
      case 'service': {
        const row = await getServiceById(entityId);
        const hero = await resolveHero(row.heroImageId);
        const publicPath =
          row.workflowStatus === WorkflowStatus.publicado
            ? buildSiloPath('service', { slug: row.slug })
            : null;
        return {
          entityId: row.id,
          heroImageUrl: hero.heroImageUrl,
          heroImageAlt: hero.heroImageAlt,
          editorial: await buildEditorial(contentType, row, session, publicPath),
          initial: {
            name: row.name,
            summary: row.summary,
            body: row.body,
            methodology: row.methodology,
            applicableNorms: row.applicableNorms,
            deliverables: row.deliverables,
            heroImageId: row.heroImageId,
            order: row.order,
            isPillar: row.isPillar,
            slug: row.slug,
            metaTitle: row.metaTitle,
            metaDescription: row.metaDescription,
            canonicalUrl: row.canonicalUrl,
            schemaType: row.schemaType,
            noindex: row.noindex,
            ogImageId: row.ogImageId,
            h1: row.h1,
            zoneIds: row.zoneCoverage.map((z) => z.zoneId),
          },
        };
      }
      case 'geo_zone': {
        const row = await db.geoZone.findFirst({
          where: { id: entityId, deletedAt: null },
          include: {
            province: { select: { name: true, slug: true, ccaa: true } },
          },
        });
        if (!row) throw new ContentNotFoundError();
        const hero = await resolveHero(row.heroImageId);
        const publicPath =
          row.workflowStatus === WorkflowStatus.publicado
            ? buildSiloPath('geo_zone', { slug: row.slug })
            : null;
        return {
          entityId: row.id,
          heroImageUrl: hero.heroImageUrl,
          heroImageAlt: hero.heroImageAlt,
          editorial: await buildEditorial(contentType, row, session, publicPath),
          initial: {
            provinceId: row.provinceId,
            name: row.name,
            localGeology: row.localGeology,
            operationalBase: row.operationalBase,
            body: row.body,
            heroImageId: row.heroImageId,
            slug: row.slug,
            metaTitle: row.metaTitle,
            metaDescription: row.metaDescription,
            canonicalUrl: row.canonicalUrl,
            schemaType: row.schemaType,
            noindex: row.noindex,
            ogImageId: row.ogImageId,
            h1: row.h1,
            provinceName: row.province.name,
            provinceSlug: row.province.slug,
            provinceCcaa: row.province.ccaa,
          },
        };
      }
      case 'service_zone_page': {
        const row = await db.serviceZonePage.findFirst({
          where: { id: entityId, deletedAt: null },
          include: {
            service: { select: { slug: true } },
            zone: { select: { slug: true } },
          },
        });
        if (!row) throw new ContentNotFoundError();
        const publicPath =
          row.workflowStatus === WorkflowStatus.publicado
            ? buildSiloPath('service_zone_page', {
                slug: row.slug,
                serviceSlug: row.service.slug,
                zoneSlug: row.zone.slug,
              })
            : null;
        return {
          entityId: row.id,
          heroImageUrl: null,
          heroImageAlt: null,
          editorial: await buildEditorial(contentType, row, session, publicPath),
          initial: {
            serviceId: row.serviceId,
            zoneId: row.zoneId,
            targetKeyword: row.targetKeyword,
            body: row.body,
            slug: row.slug,
            metaTitle: row.metaTitle,
            metaDescription: row.metaDescription,
            canonicalUrl: row.canonicalUrl,
            schemaType: row.schemaType,
            noindex: row.noindex,
            ogImageId: row.ogImageId,
            h1: row.h1,
          },
        };
      }
      case 'case_study': {
        const row = await db.caseStudy.findFirst({
          where: { id: entityId, deletedAt: null },
          include: {
            service: { select: { id: true, name: true, slug: true } },
            province: { select: { name: true, slug: true, ccaa: true } },
            workTypology: { select: { name: true, slug: true } },
            teamMembers: { select: { teamMemberId: true } },
          },
        });
        if (!row) throw new ContentNotFoundError();
        const publicPath =
          row.workflowStatus === WorkflowStatus.publicado
            ? buildSiloPath('case_study', { slug: row.slug })
            : null;
        return {
          entityId: row.id,
          heroImageUrl: null,
          heroImageAlt: null,
          editorial: await buildEditorial(contentType, row, session, publicPath),
          initial: {
            title: row.title,
            serviceId: row.serviceId,
            provinceId: row.provinceId,
            workTypologyId: row.workTypologyId,
            clientName: row.clientName,
            clientIsPublic: row.clientIsPublic,
            problem: row.problem,
            solution: row.solution,
            boreholesCount: row.boreholesCount,
            metersDrilled: row.metersDrilled,
            testsSummary: row.testsSummary,
            result: row.result,
            projectYear: row.projectYear,
            teamMemberIds: row.teamMembers.map((m) => m.teamMemberId),
            slug: row.slug,
            metaTitle: row.metaTitle,
            metaDescription: row.metaDescription,
            canonicalUrl: row.canonicalUrl,
            schemaType: row.schemaType,
            noindex: row.noindex,
            ogImageId: row.ogImageId,
            h1: row.h1,
            serviceName: row.service.name,
            serviceSlug: row.service.slug,
            provinceName: row.province.name,
            provinceSlug: row.province.slug,
            provinceCcaa: row.province.ccaa,
            workTypologyName: row.workTypology.name,
            workTypologySlug: row.workTypology.slug,
          },
        };
      }
      case 'blog_post': {
        const row = await db.blogPost.findFirst({
          where: { id: entityId, deletedAt: null },
          include: {
            category: { select: { id: true, name: true, slug: true } },
            teamAuthor: { select: { slug: true } },
            services: { select: { serviceId: true } },
          },
        });
        if (!row) throw new ContentNotFoundError();
        const hero = await resolveHero(row.heroImageId);
        const publicPath =
          row.workflowStatus === WorkflowStatus.publicado
            ? buildSiloPath('blog_post', {
                slug: row.slug,
                categorySlug: row.category.slug,
              })
            : null;
        return {
          entityId: row.id,
          heroImageUrl: hero.heroImageUrl,
          heroImageAlt: hero.heroImageAlt,
          editorial: await buildEditorial(contentType, row, session, publicPath),
          initial: {
            title: row.title,
            categoryId: row.categoryId,
            teamAuthorId: row.teamAuthorId,
            body: row.body,
            toc: row.toc,
            readingMinutes: row.readingMinutes,
            excerpt: row.excerpt,
            heroImageId: row.heroImageId,
            serviceIds: row.services.map((s) => s.serviceId),
            slug: row.slug,
            metaTitle: row.metaTitle,
            metaDescription: row.metaDescription,
            canonicalUrl: row.canonicalUrl,
            schemaType: row.schemaType,
            noindex: row.noindex,
            ogImageId: row.ogImageId,
            h1: row.h1,
            categoryName: row.category.name,
            categorySlug: row.category.slug,
            teamAuthorSlug: row.teamAuthor.slug,
          },
        };
      }
      case 'faq': {
        const row = await db.faq.findFirst({
          where: { id: entityId, deletedAt: null },
        });
        if (!row) throw new ContentNotFoundError();
        return {
          entityId: row.id,
          heroImageUrl: null,
          heroImageAlt: null,
          editorial: await buildEditorial(contentType, row, session, null),
          initial: {
            faqGroupId: row.faqGroupId,
            question: row.question,
            answer: row.answer,
            internalLinkUrl: row.internalLinkUrl,
            order: row.order,
          },
        };
      }
      case 'team_member': {
        const row = await db.teamMember.findFirst({
          where: { id: entityId, deletedAt: null },
        });
        if (!row) throw new ContentNotFoundError();
        const photo = await resolvePhoto(row.photoId);
        const publicPath =
          row.workflowStatus === WorkflowStatus.publicado
            ? buildSiloPath('team_member', { slug: row.slug })
            : null;
        return {
          entityId: row.id,
          heroImageUrl: photo.heroImageUrl,
          heroImageAlt: photo.heroImageAlt,
          editorial: await buildEditorial(contentType, row, session, publicPath),
          initial: {
            fullName: row.fullName,
            jobTitle: row.jobTitle,
            qualification: row.qualification,
            collegeRegistrationNo: row.collegeRegistrationNo,
            yearsExperience: row.yearsExperience,
            specialization: row.specialization,
            bio: row.bio,
            publications: row.publications,
            worksFor: row.worksFor,
            alumniOf: row.alumniOf,
            photoId: row.photoId,
            userId: row.userId,
            slug: row.slug,
          },
        };
      }
      case 'machinery': {
        const row = await db.machinery.findFirst({
          where: { id: entityId, deletedAt: null },
          include: { services: { select: { serviceId: true } } },
        });
        if (!row) throw new ContentNotFoundError();
        const photo = await resolvePhoto(row.photoId);
        const publicPath =
          row.workflowStatus === WorkflowStatus.publicado
            ? buildSiloPath('machinery', { slug: row.slug })
            : null;
        return {
          entityId: row.id,
          heroImageUrl: photo.heroImageUrl,
          heroImageAlt: photo.heroImageAlt,
          editorial: await buildEditorial(contentType, row, session, publicPath),
          initial: {
            name: row.name,
            equipmentType: row.equipmentType,
            model: row.model,
            maxDepthM: row.maxDepthM != null ? Number(row.maxDepthM) : null,
            diameters: row.diameters,
            inSituTests: parseStoredMachineryInSituTests(row.inSituTests),
            hasEnacLab: row.hasEnacLab,
            photoId: row.photoId,
            serviceIds: row.services.map((s) => s.serviceId),
            slug: row.slug,
          },
        };
      }
      default: {
        const _exhaustive: never = contentType;
        return _exhaustive;
      }
    }
  } catch (error) {
    if (error instanceof ContentNotFoundError) {
      return null;
    }
    throw error;
  }
}
