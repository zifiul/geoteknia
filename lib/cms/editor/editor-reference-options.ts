import 'server-only';

import type { EditorialContentType } from '@/lib/content/schemas/workflow';
import { db } from '@/lib/db';

export type CmsReferenceOption = { id: string; label: string };

export type CmsEditorReferenceOptions = {
  provinces: CmsReferenceOption[];
  services: CmsReferenceOption[];
  geoZones: { id: string; name: string; slug: string }[];
  blogCategories: CmsReferenceOption[];
  faqGroups: CmsReferenceOption[];
  teamMembers: CmsReferenceOption[];
  workTypologies: CmsReferenceOption[];
};

const EMPTY: CmsEditorReferenceOptions = {
  provinces: [],
  services: [],
  geoZones: [],
  blogCategories: [],
  faqGroups: [],
  teamMembers: [],
  workTypologies: [],
};

function needs(
  contentType: EditorialContentType,
  field: keyof CmsEditorReferenceOptions,
): boolean {
  switch (field) {
    case 'provinces':
      return contentType === 'geo_zone' || contentType === 'case_study';
    case 'services':
      return (
        contentType === 'service' ||
        contentType === 'service_zone_page' ||
        contentType === 'case_study' ||
        contentType === 'blog_post' ||
        contentType === 'machinery'
      );
    case 'geoZones':
      return contentType === 'service' || contentType === 'service_zone_page';
    case 'blogCategories':
      return contentType === 'blog_post';
    case 'faqGroups':
      return contentType === 'faq';
    case 'teamMembers':
      return contentType === 'blog_post' || contentType === 'case_study';
    case 'workTypologies':
      return contentType === 'case_study';
    default:
      return false;
  }
}

export async function loadEditorReferenceOptions(
  contentType: EditorialContentType,
): Promise<CmsEditorReferenceOptions> {
  const [provinces, services, geoZones, blogCategories, faqGroups, teamMembers, workTypologies] =
    await Promise.all([
      needs(contentType, 'provinces')
        ? db.province.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
      needs(contentType, 'services')
        ? db.service.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
      needs(contentType, 'geoZones')
        ? db.geoZone.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
            select: { id: true, name: true, slug: true },
          })
        : Promise.resolve([]),
      needs(contentType, 'blogCategories')
        ? db.blogCategory.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
      needs(contentType, 'faqGroups')
        ? db.faqGroup.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
      needs(contentType, 'teamMembers')
        ? db.teamMember.findMany({
            where: { deletedAt: null },
            orderBy: { fullName: 'asc' },
            select: { id: true, fullName: true },
          })
        : Promise.resolve([]),
      needs(contentType, 'workTypologies')
        ? db.workTypology.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
    ]);

  if (
    provinces.length === 0 &&
    services.length === 0 &&
    geoZones.length === 0 &&
    blogCategories.length === 0 &&
    faqGroups.length === 0 &&
    teamMembers.length === 0 &&
    workTypologies.length === 0
  ) {
    return EMPTY;
  }

  return {
    provinces: provinces.map((row) => ({ id: row.id, label: row.name })),
    services: services.map((row) => ({ id: row.id, label: row.name })),
    geoZones,
    blogCategories: blogCategories.map((row) => ({
      id: row.id,
      label: row.name,
    })),
    faqGroups: faqGroups.map((row) => ({ id: row.id, label: row.name })),
    teamMembers: teamMembers.map((row) => ({
      id: row.id,
      label: row.fullName,
    })),
    workTypologies: workTypologies.map((row) => ({
      id: row.id,
      label: row.name,
    })),
  };
}
