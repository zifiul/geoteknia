import { MilestoneStatus, ProjectDocType } from '@prisma/client';
import { z } from 'zod';

export const changeStateSchema = z
  .object({
    toStateSlug: z.string().min(1).max(100),
    note: z.string().max(5000).optional(),
  })
  .strict();

export type ChangeStateInput = z.infer<typeof changeStateSchema>;

export const assignTechnicianSchema = z
  .object({
    technicianId: z.uuid(),
  })
  .strict();

export type AssignTechnicianInput = z.infer<typeof assignTechnicianSchema>;

export const createMilestoneSchema = z
  .object({
    title: z.string().min(1).max(500),
    dueDate: z.coerce.date().optional(),
    status: z.nativeEnum(MilestoneStatus).optional(),
  })
  .strict();

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;

export const createNoteSchema = z
  .object({
    body: z.string().min(1).max(20000),
  })
  .strict();

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

export const attachDocumentSchema = z
  .object({
    mediaAssetId: z.uuid().optional(),
    fileUrl: z.string().url().max(2048).optional(),
    docType: z.nativeEnum(ProjectDocType),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (!data.mediaAssetId && !data.fileUrl) {
      ctx.addIssue({
        code: 'custom',
        message: 'Se requiere mediaAssetId o fileUrl',
        path: ['mediaAssetId'],
      });
    }
  });

export type AttachDocumentInput = z.infer<typeof attachDocumentSchema>;
