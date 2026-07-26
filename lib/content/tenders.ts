import 'server-only';

import { WorkflowStatus, type OrganismType } from '@prisma/client';

import { db } from '@/lib/db';

export type ContractorClassificationListItem = {
  id: string;
  groupCode: string;
  subgroupCode: string;
  category: string | null;
  description: string | null;
  order: number | null;
};

export type PublicOrganismExperienceListItem = {
  id: string;
  organismName: string;
  organismType: OrganismType | null;
  description: string | null;
  wasUte: boolean | null;
  relatedCase: { title: string; slug: string } | null;
};

export async function listContractorClassifications(): Promise<
  ContractorClassificationListItem[]
> {
  return db.contractorClassification.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: 'asc' }, { groupCode: 'asc' }, { subgroupCode: 'asc' }],
    select: {
      id: true,
      groupCode: true,
      subgroupCode: true,
      category: true,
      description: true,
      order: true,
    },
  });
}

function resolvePublishedRelatedCase(
  relatedCase: {
    title: string;
    slug: string;
    workflowStatus: WorkflowStatus;
    deletedAt: Date | null;
  } | null,
): { title: string; slug: string } | null {
  if (!relatedCase) return null;
  if (relatedCase.deletedAt !== null) return null;
  if (relatedCase.workflowStatus !== WorkflowStatus.publicado) return null;
  return { title: relatedCase.title, slug: relatedCase.slug };
}

export async function listPublicOrganismExperience(): Promise<
  PublicOrganismExperienceListItem[]
> {
  const rows = await db.publicOrganismExperience.findMany({
    where: { deletedAt: null },
    orderBy: { organismName: 'asc' },
    select: {
      id: true,
      organismName: true,
      organismType: true,
      description: true,
      wasUte: true,
      relatedCase: {
        select: {
          title: true,
          slug: true,
          workflowStatus: true,
          deletedAt: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    organismName: row.organismName,
    organismType: row.organismType,
    description: row.description,
    wasUte: row.wasUte,
    relatedCase: resolvePublishedRelatedCase(row.relatedCase),
  }));
}

/** Experiencias con caso de estudio publicado enlazado. */
export async function listPublicTenderProjects(): Promise<
  Array<
    PublicOrganismExperienceListItem & {
      relatedCase: { title: string; slug: string };
    }
  >
> {
  const all = await listPublicOrganismExperience();
  return all.filter(
    (
      row,
    ): row is PublicOrganismExperienceListItem & {
      relatedCase: { title: string; slug: string };
    } => row.relatedCase !== null,
  );
}
