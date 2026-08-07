import { EquipmentType } from '@prisma/client';
import { z } from 'zod';

import { blogTocSchema } from '@/lib/content/schemas/blog-toc';
import { editorialCrudBlockSchema } from '@/lib/content/schemas/editorial';
import { machineryInSituTestsSchema } from '@/lib/content/schemas/machinery-in-situ-tests';
import {
  teamMachinerySeoSchema,
} from '@/lib/content/schemas/seo';
import type { EditorialContentType } from '@/lib/content/schemas/workflow';

import { cmsServiceFormSchema, cmsSeoBlockSchema } from './service-form-schema';

const cmsTeamMachinerySeoSchema = teamMachinerySeoSchema.extend({
  slug: z
    .string()
    .min(1, 'El slug URL es obligatorio')
    .max(200, 'El slug URL no puede superar 200 caracteres'),
});

const geoZoneFormSchema = z
  .object({
    provinceId: z.uuid({ message: 'Seleccione una provincia válida' }),
    name: z.string().min(1, 'El nombre es obligatorio'),
    localGeology: z.string().min(1, 'La geología local es obligatoria'),
    operationalBase: z.string().nullable().optional(),
    body: z.string().min(1, 'El cuerpo es obligatorio'),
    heroImageId: z.uuid().nullable().optional(),
  })
  .merge(cmsSeoBlockSchema)
  .merge(editorialCrudBlockSchema);

const serviceZonePageFormSchema = z
  .object({
    serviceId: z.uuid({ message: 'Seleccione un servicio válido' }),
    zoneId: z.uuid({ message: 'Seleccione una zona geográfica válida' }),
    targetKeyword: z.string().nullable().optional(),
    body: z.string().min(1, 'El cuerpo es obligatorio'),
  })
  .merge(cmsSeoBlockSchema)
  .merge(editorialCrudBlockSchema);

const caseStudyFormSchema = z
  .object({
    title: z.string().min(1, 'El título es obligatorio'),
    serviceId: z.uuid({ message: 'Seleccione un servicio válido' }),
    provinceId: z.uuid({ message: 'Seleccione una provincia válida' }),
    workTypologyId: z.uuid({ message: 'Seleccione una tipología de obra válida' }),
    clientName: z.string().nullable().optional(),
    clientIsPublic: z.boolean().optional(),
    problem: z.string().min(1, 'El problema es obligatorio'),
    solution: z.string().min(1, 'La solución es obligatoria'),
    boreholesCount: z.number().int().nullable().optional(),
    metersDrilled: z.coerce.number().nullable().optional(),
    testsSummary: z.string().nullable().optional(),
    result: z.string().nullable().optional(),
    projectYear: z.number().int().nullable().optional(),
    latitude: z.coerce.number().nullable().optional(),
    longitude: z.coerce.number().nullable().optional(),
    sourceProjectId: z.uuid().nullable().optional(),
    teamMemberIds: z.array(z.uuid()).optional(),
  })
  .merge(cmsSeoBlockSchema)
  .merge(editorialCrudBlockSchema);

const blogPostFormSchema = z
  .object({
    title: z.string().min(1, 'El título es obligatorio'),
    categoryId: z.uuid({ message: 'Seleccione una categoría válida' }),
    teamAuthorId: z.uuid({ message: 'Seleccione un autor válido' }),
    body: z.string().min(1, 'El cuerpo es obligatorio'),
    toc: blogTocSchema.optional(),
    readingMinutes: z.number().int().nullable().optional(),
    excerpt: z.string().nullable().optional(),
    heroImageId: z.uuid().nullable().optional(),
    serviceIds: z.array(z.uuid()).optional(),
  })
  .merge(cmsSeoBlockSchema)
  .merge(editorialCrudBlockSchema);

const faqFormSchema = z
  .object({
    faqGroupId: z.uuid({ message: 'Seleccione un grupo de FAQ válido' }),
    question: z.string().min(1, 'La pregunta es obligatoria'),
    answer: z.string().min(1, 'La respuesta es obligatoria'),
    internalLinkUrl: z
      .url('El enlace interno debe ser una URL válida')
      .nullable()
      .optional(),
    order: z.number().int().nullable().optional(),
  })
  .merge(editorialCrudBlockSchema);

const teamMemberFormSchema = z
  .object({
    fullName: z.string().min(1, 'El nombre completo es obligatorio'),
    jobTitle: z.string().min(1, 'El cargo es obligatorio'),
    qualification: z.string().nullable().optional(),
    collegeRegistrationNo: z.string().nullable().optional(),
    yearsExperience: z.number().int().nullable().optional(),
    specialization: z.string().nullable().optional(),
    bio: z.string().nullable().optional(),
    publications: z.string().nullable().optional(),
    worksFor: z.string().nullable().optional(),
    alumniOf: z.string().nullable().optional(),
    photoId: z.uuid().nullable().optional(),
    userId: z.uuid().nullable().optional(),
  })
  .merge(cmsTeamMachinerySeoSchema)
  .merge(editorialCrudBlockSchema);

const machineryFormSchema = z
  .object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    equipmentType: z.nativeEnum(EquipmentType, {
      message: 'Seleccione un tipo de equipo válido',
    }),
    model: z.string().nullable().optional(),
    maxDepthM: z.coerce.number().nullable().optional(),
    diameters: z.string().nullable().optional(),
    inSituTests: machineryInSituTestsSchema.nullable().optional(),
    hasEnacLab: z.boolean().nullable().optional(),
    photoId: z.uuid().nullable().optional(),
    serviceIds: z.array(z.uuid()).optional(),
  })
  .merge(cmsTeamMachinerySeoSchema)
  .merge(editorialCrudBlockSchema);

export const CMS_EDITOR_FORM_SCHEMAS: Record<EditorialContentType, z.ZodType> =
  {
    service: cmsServiceFormSchema,
    geo_zone: geoZoneFormSchema,
    service_zone_page: serviceZonePageFormSchema,
    case_study: caseStudyFormSchema,
    blog_post: blogPostFormSchema,
    faq: faqFormSchema,
    team_member: teamMemberFormSchema,
    machinery: machineryFormSchema,
  };

export function getCmsEditorFormSchema(
  contentType: EditorialContentType,
): z.ZodType {
  return CMS_EDITOR_FORM_SCHEMAS[contentType];
}
