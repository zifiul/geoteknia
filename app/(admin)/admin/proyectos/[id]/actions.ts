'use server';

import { revalidatePath } from 'next/cache';

import { withPermission } from '@/lib/auth/rbac';
import { assignProjectTechnician } from '@/lib/projects/assign';
import {
  attachProjectDocument,
  deleteProjectDocument,
} from '@/lib/projects/documents';
import {
  completeProjectMilestone,
  createProjectMilestone,
} from '@/lib/projects/milestones';
import { createProjectNote, deleteProjectNote } from '@/lib/projects/notes';
import {
  assignTechnicianSchema,
  attachDocumentSchema,
  changeStateSchema,
  createMilestoneSchema,
  createNoteSchema,
} from '@/lib/projects/project-mutation-schemas';
import {
  runProjectAction,
  type ProjectActionResult,
} from '@/lib/projects/project-action-result';
import { changeProjectState } from '@/lib/projects/transitions';

function revalidateProjectDetail(projectId: string) {
  revalidatePath(`/admin/proyectos/${projectId}`);
}

export const changeStateAction = withPermission(
  'projects.update',
  async (user, projectId: string, raw: unknown): Promise<ProjectActionResult> => {
    return runProjectAction(async () => {
      const input = changeStateSchema.parse(raw);
      await changeProjectState(user, projectId, input);
      revalidateProjectDetail(projectId);
    });
  },
);

export const assignTechnicianAction = withPermission(
  'projects.assign',
  async (user, projectId: string, raw: unknown): Promise<ProjectActionResult> => {
    return runProjectAction(async () => {
      const input = assignTechnicianSchema.parse(raw);
      await assignProjectTechnician(user, projectId, input);
      revalidateProjectDetail(projectId);
    });
  },
);

export const createMilestoneAction = withPermission(
  'projects.update',
  async (
    user,
    projectId: string,
    raw: unknown,
  ): Promise<ProjectActionResult<{ id: string }>> => {
    return runProjectAction(async () => {
      const input = createMilestoneSchema.parse(raw);
      const milestone = await createProjectMilestone(user, projectId, input);
      revalidateProjectDetail(projectId);
      return milestone;
    });
  },
);

export const completeMilestoneAction = withPermission(
  'projects.update',
  async (user, milestoneId: string): Promise<ProjectActionResult> => {
    return runProjectAction(async () => {
      await completeProjectMilestone(user, milestoneId);
    });
  },
);

export const createNoteAction = withPermission(
  'projects.update',
  async (
    user,
    projectId: string,
    raw: unknown,
  ): Promise<ProjectActionResult<{ id: string }>> => {
    return runProjectAction(async () => {
      const input = createNoteSchema.parse(raw);
      const note = await createProjectNote(user, projectId, input);
      revalidateProjectDetail(projectId);
      return note;
    });
  },
);

export const attachDocumentAction = withPermission(
  'projects.update',
  async (
    user,
    projectId: string,
    raw: unknown,
  ): Promise<ProjectActionResult<{ id: string }>> => {
    return runProjectAction(async () => {
      const input = attachDocumentSchema.parse(raw);
      const doc = await attachProjectDocument(user, projectId, input);
      revalidateProjectDetail(projectId);
      return doc;
    });
  },
);

export const deleteNoteAction = withPermission(
  'projects.delete',
  async (user, noteId: string): Promise<ProjectActionResult> => {
    return runProjectAction(async () => {
      await deleteProjectNote(user, noteId);
    });
  },
);

export const deleteDocumentAction = withPermission(
  'projects.delete',
  async (user, documentId: string): Promise<ProjectActionResult> => {
    return runProjectAction(async () => {
      await deleteProjectDocument(user, documentId);
    });
  },
);
