'use client';

import type { ZodError } from 'zod';
import { EquipmentType } from '@prisma/client';

import type { CmsEditorPageData } from '@/lib/cms/editor/load-cms-editor-page';
import type { CmsEditorReferenceOptions } from '@/lib/cms/editor/editor-reference-options';

import { BodyEditor } from './BodyEditor';
import { CmsPhotoField } from './CmsPhotoField';
import { RelationsPicker } from './RelationsPicker';
import { SeoBlock } from './SeoBlock';

const CMS_FIELD_LABELS: Record<string, string> = {
  slug: 'Slug URL',
  name: 'Nombre',
  equipmentType: 'Tipo de equipo',
  title: 'Título',
  body: 'Cuerpo',
  summary: 'Resumen',
  localGeology: 'Geología local',
  operationalBase: 'Base operativa',
  applicableNorms: 'Normativa aplicable',
  provinceId: 'Provincia',
  serviceId: 'Servicio',
  zoneId: 'Zona geográfica',
  workTypologyId: 'Tipología de obra',
  categoryId: 'Categoría',
  teamAuthorId: 'Autor (equipo)',
  faqGroupId: 'Grupo de FAQ',
  question: 'Pregunta',
  answer: 'Respuesta',
  internalLinkUrl: 'Enlace interno (URL)',
  fullName: 'Nombre completo',
  jobTitle: 'Cargo',
  bio: 'Biografía',
  photoId: 'Foto',
  problem: 'Problema',
  solution: 'Solución',
  result: 'Resultado',
  excerpt: 'Extracto',
  metaTitle: 'Meta título',
  metaDescription: 'Meta descripción',
  canonicalUrl: 'URL canónica',
  targetKeyword: 'Palabra clave objetivo',
};

/** Traduce mensajes Zod al español para el editor CMS. */
export function formatCmsFieldError(field: string, message: string): string {
  if (!message || !/invalid|required|expected|too small|too big|too large/i.test(message)) {
    return message;
  }

  const label = CMS_FIELD_LABELS[field] ?? field;
  const lower = message.toLowerCase();

  if (lower.includes('invalid uuid') || lower.includes('invalid input')) {
    return `Seleccione un valor válido para «${label}».`;
  }
  if (lower.includes('invalid url')) {
    return `«${label}» debe ser una URL válida.`;
  }
  if (
    lower.includes('required') ||
    lower.includes('expected string, received') ||
    (lower.includes('too small') && lower.includes('1 character'))
  ) {
    return `«${label}» es obligatorio.`;
  }
  if (lower.includes('too big') || lower.includes('too large')) {
    return `«${label}» supera la longitud máxima permitida.`;
  }

  return message;
}

export function mapCmsFieldErrors(error: ZodError): Record<string, string> {
  const next: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !next[key]) {
      next[key] = formatCmsFieldError(key, issue.message);
    }
  }
  return next;
}

function formatFieldErrorsRecord(
  fieldErrors: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([key, message]) => [
      key,
      formatCmsFieldError(key, message),
    ]),
  );
}

function RequiredMark() {
  return (
    <>
      <span className="text-red-700" aria-hidden="true">
        {' '}
        *
      </span>
      <span className="sr-only"> (obligatorio)</span>
    </>
  );
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <>
      {children}
      {required ? <RequiredMark /> : null}
    </>
  );
}

type Props = {
  page: CmsEditorPageData;
  values: Record<string, unknown>;
  fieldErrors: Record<string, string>;
  onChange: (partial: Record<string, unknown>) => void;
  onPhotoIdChange?: (photoId: string | null) => void;
  onPhotoPendingChange?: (pending: boolean) => void;
};

function SelectField({
  label,
  value,
  options,
  onChange,
  error,
  required,
}: {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}) {
  const errorId = error ? `${label}-error` : undefined;
  return (
    <label className="mt-3 block text-sm text-brand-secondary">
      <FieldLabel required={required}>{label}</FieldLabel>
      <select
        className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
        value={value}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Seleccionar…</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  error,
  multiline,
  rows = 3,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
}) {
  const errorId = error ? `${label}-error` : undefined;
  return (
    <label className="mt-3 block text-sm text-brand-secondary">
      <FieldLabel required={required}>{label}</FieldLabel>
      {multiline ? (
        <textarea
          rows={rows}
          className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          value={value}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          value={value}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </label>
  );
}

function str(values: Record<string, unknown>, key: string): string {
  const v = values[key];
  return typeof v === 'string' ? v : v == null ? '' : String(v);
}

function strArray(values: Record<string, unknown>, key: string): string[] {
  const v = values[key];
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  sonda_rotacion: 'Sonda rotación',
  sonda_percusion: 'Sonda percusión',
  mixta: 'Mixta',
  ensayo_in_situ: 'Ensayo in situ',
  laboratorio: 'Laboratorio',
  vehiculo_especial: 'Vehículo especial',
};

function fieldError(
  fieldErrors: Record<string, string>,
  key: string,
): string | undefined {
  const message = fieldErrors[key];
  return message ? formatCmsFieldError(key, message) : undefined;
}

function renderTypeFields(
  page: CmsEditorPageData,
  values: Record<string, unknown>,
  refs: CmsEditorReferenceOptions,
  fieldErrors: Record<string, string>,
  onChange: (partial: Record<string, unknown>) => void,
  onPhotoIdChange?: (photoId: string | null) => void,
  onPhotoPendingChange?: (pending: boolean) => void,
) {
  const contentType = page.contentType;
  switch (contentType) {
    case 'service':
      return (
        <>
          <TextField
            label="Nombre del servicio"
            value={str(values, 'name')}
            onChange={(v) => onChange({ name: v })}
            error={fieldError(fieldErrors, 'name')}
          />
          <TextField
            label="Resumen"
            value={str(values, 'summary')}
            onChange={(v) => onChange({ summary: v })}
            multiline
          />
          <BodyEditor
            label="Cuerpo (HTML)"
            value={str(values, 'body')}
            onChange={(v) => onChange({ body: v })}
            error={fieldError(fieldErrors, 'body')}
          />
          <TextField
            label="Normativa aplicable"
            value={str(values, 'applicableNorms')}
            onChange={(v) => onChange({ applicableNorms: v })}
            multiline
            rows={4}
          />
          <RelationsPicker
            zoneOptions={refs.geoZones}
            selectedIds={strArray(values, 'zoneIds')}
            onChange={(ids) => onChange({ zoneIds: ids })}
          />
        </>
      );
    case 'geo_zone':
      return (
        <>
          <SelectField
            label="Provincia"
            value={str(values, 'provinceId')}
            options={refs.provinces}
            onChange={(v) => onChange({ provinceId: v })}
            error={fieldError(fieldErrors, 'provinceId')}
            required
          />
          <TextField
            label="Nombre de la zona"
            value={str(values, 'name')}
            onChange={(v) => onChange({ name: v })}
            error={fieldError(fieldErrors, 'name')}
          />
          <TextField
            label="Geología local"
            value={str(values, 'localGeology')}
            onChange={(v) => onChange({ localGeology: v })}
            error={fieldError(fieldErrors, 'localGeology')}
            multiline
          />
          <TextField
            label="Base operativa"
            value={str(values, 'operationalBase')}
            onChange={(v) => onChange({ operationalBase: v })}
            multiline
          />
          <BodyEditor
            label="Cuerpo (HTML)"
            value={str(values, 'body')}
            onChange={(v) => onChange({ body: v })}
            error={fieldError(fieldErrors, 'body')}
          />
        </>
      );
    case 'service_zone_page':
      return (
        <>
          <SelectField
            label="Servicio"
            value={str(values, 'serviceId')}
            options={refs.services}
            onChange={(v) => onChange({ serviceId: v })}
            error={fieldError(fieldErrors, 'serviceId')}
            required
          />
          <SelectField
            label="Zona geográfica"
            value={str(values, 'zoneId')}
            options={refs.geoZones.map((z) => ({ id: z.id, label: z.name }))}
            onChange={(v) => onChange({ zoneId: v })}
            error={fieldError(fieldErrors, 'zoneId')}
            required
          />
          <TextField
            label="Palabra clave objetivo"
            value={str(values, 'targetKeyword')}
            onChange={(v) => onChange({ targetKeyword: v })}
          />
          <BodyEditor
            label="Cuerpo (HTML)"
            value={str(values, 'body')}
            onChange={(v) => onChange({ body: v })}
            error={fieldError(fieldErrors, 'body')}
          />
        </>
      );
    case 'case_study':
      return (
        <>
          <TextField
            label="Título"
            value={str(values, 'title')}
            onChange={(v) => onChange({ title: v })}
            error={fieldError(fieldErrors, 'title')}
          />
          <SelectField
            label="Servicio"
            value={str(values, 'serviceId')}
            options={refs.services}
            onChange={(v) => onChange({ serviceId: v })}
            error={fieldError(fieldErrors, 'serviceId')}
            required
          />
          <SelectField
            label="Provincia"
            value={str(values, 'provinceId')}
            options={refs.provinces}
            onChange={(v) => onChange({ provinceId: v })}
            error={fieldError(fieldErrors, 'provinceId')}
            required
          />
          <SelectField
            label="Tipología de obra"
            value={str(values, 'workTypologyId')}
            options={refs.workTypologies}
            onChange={(v) => onChange({ workTypologyId: v })}
            error={fieldError(fieldErrors, 'workTypologyId')}
            required
          />
          <TextField
            label="Problema"
            value={str(values, 'problem')}
            onChange={(v) => onChange({ problem: v })}
            error={fieldError(fieldErrors, 'problem')}
            multiline
          />
          <TextField
            label="Solución"
            value={str(values, 'solution')}
            onChange={(v) => onChange({ solution: v })}
            error={fieldError(fieldErrors, 'solution')}
            multiline
          />
          <TextField
            label="Resultado"
            value={str(values, 'result')}
            onChange={(v) => onChange({ result: v })}
            multiline
          />
        </>
      );
    case 'blog_post':
      return (
        <>
          <TextField
            label="Título"
            value={str(values, 'title')}
            onChange={(v) => onChange({ title: v })}
            error={fieldError(fieldErrors, 'title')}
          />
          <SelectField
            label="Categoría"
            value={str(values, 'categoryId')}
            options={refs.blogCategories}
            onChange={(v) => onChange({ categoryId: v })}
            error={fieldError(fieldErrors, 'categoryId')}
            required
          />
          <SelectField
            label="Autor (equipo)"
            value={str(values, 'teamAuthorId')}
            options={refs.teamMembers}
            onChange={(v) => onChange({ teamAuthorId: v })}
            error={fieldError(fieldErrors, 'teamAuthorId')}
            required
          />
          <TextField
            label="Extracto"
            value={str(values, 'excerpt')}
            onChange={(v) => onChange({ excerpt: v })}
            multiline
          />
          <BodyEditor
            label="Cuerpo (HTML)"
            value={str(values, 'body')}
            onChange={(v) => onChange({ body: v })}
            error={fieldError(fieldErrors, 'body')}
          />
        </>
      );
    case 'faq':
      return (
        <>
          <SelectField
            label="Grupo de FAQ"
            value={str(values, 'faqGroupId')}
            options={refs.faqGroups}
            onChange={(v) => onChange({ faqGroupId: v })}
            error={fieldError(fieldErrors, 'faqGroupId')}
            required
          />
          <TextField
            label="Pregunta"
            value={str(values, 'question')}
            onChange={(v) => onChange({ question: v })}
            error={fieldError(fieldErrors, 'question')}
          />
          <BodyEditor
            label="Respuesta"
            value={str(values, 'answer')}
            onChange={(v) => onChange({ answer: v })}
            error={fieldError(fieldErrors, 'answer')}
          />
          <TextField
            label="Enlace interno (URL)"
            value={str(values, 'internalLinkUrl')}
            onChange={(v) => onChange({ internalLinkUrl: v })}
            error={fieldError(fieldErrors, 'internalLinkUrl')}
          />
        </>
      );
    case 'team_member':
      return (
        <>
          <TextField
            label="Nombre completo"
            value={str(values, 'fullName')}
            onChange={(v) => onChange({ fullName: v })}
            error={fieldError(fieldErrors, 'fullName')}
          />
          <TextField
            label="Cargo"
            value={str(values, 'jobTitle')}
            onChange={(v) => onChange({ jobTitle: v })}
            error={fieldError(fieldErrors, 'jobTitle')}
          />
          <TextField
            label="Slug URL"
            value={str(values, 'slug')}
            onChange={(v) => onChange({ slug: v })}
            error={fieldError(fieldErrors, 'slug')}
            required
          />
          <TextField
            label="Biografía"
            value={str(values, 'bio')}
            onChange={(v) => onChange({ bio: v })}
            multiline
            rows={6}
          />
        </>
      );
    case 'machinery':
      return (
        <>
          <TextField
            label="Nombre"
            value={str(values, 'name')}
            onChange={(v) => onChange({ name: v })}
            error={fieldError(fieldErrors, 'name')}
            required
          />
          <label className="mt-3 block text-sm text-brand-secondary">
            <FieldLabel required>Tipo de equipo</FieldLabel>
            <select
              className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
              value={str(values, 'equipmentType')}
              required
              aria-required
              aria-invalid={fieldErrors.equipmentType ? true : undefined}
              aria-describedby={
                fieldErrors.equipmentType ? 'machinery-equipment-type-error' : undefined
              }
              onChange={(e) => onChange({ equipmentType: e.target.value })}
            >
              {(Object.keys(EQUIPMENT_LABELS) as EquipmentType[]).map((key) => (
                <option key={key} value={key}>
                  {EQUIPMENT_LABELS[key]}
                </option>
              ))}
            </select>
            {fieldErrors.equipmentType ? (
              <p
                id="machinery-equipment-type-error"
                role="alert"
                className="mt-1 text-sm text-red-700"
              >
                {fieldError(fieldErrors, 'equipmentType')}
              </p>
            ) : null}
          </label>
          <TextField
            label="Modelo"
            value={str(values, 'model')}
            onChange={(v) => onChange({ model: v })}
          />
          <TextField
            label="Slug URL"
            value={str(values, 'slug')}
            onChange={(v) => onChange({ slug: v })}
            error={fieldError(fieldErrors, 'slug')}
            required
          />
          {onPhotoIdChange ? (
            <CmsPhotoField
              uploadCategory="maquinaria"
              photoId={
                typeof values.photoId === 'string' && values.photoId
                  ? values.photoId
                  : null
              }
              initialPreviewUrl={page.heroImageUrl}
              initialAltText={page.heroImageAlt}
              mediaStorageBaseUrl={page.mediaStorageBaseUrl}
              siteUrl={page.siteUrl}
              onPhotoIdChange={onPhotoIdChange}
              onPendingChange={onPhotoPendingChange}
              error={fieldError(fieldErrors, 'photoId')}
            />
          ) : null}
        </>
      );
    default: {
      const _exhaustive: never = contentType;
      return _exhaustive;
    }
  }
}

function hasSeoBlock(contentType: CmsEditorPageData['contentType']): boolean {
  return (
    contentType !== 'faq' &&
    contentType !== 'team_member' &&
    contentType !== 'machinery'
  );
}

export function CmsEditorFormFields({
  page,
  values,
  fieldErrors,
  onChange,
  onPhotoIdChange,
  onPhotoPendingChange,
}: Props) {
  return (
    <>
      <section className="min-w-0 max-w-full rounded-xl border border-brand-primary/10 bg-brand-surface p-4 shadow-sm">
        <h2 className="font-semibold text-brand-primary">Contenido</h2>
        {renderTypeFields(
          page,
          values,
          page.referenceOptions,
          fieldErrors,
          onChange,
          onPhotoIdChange,
          onPhotoPendingChange,
        )}
      </section>
      {hasSeoBlock(page.contentType) ? (
        <SeoBlock
          values={values as Parameters<typeof SeoBlock>[0]['values']}
          onChange={onChange}
          errors={formatFieldErrorsRecord(fieldErrors)}
        />
      ) : null}
    </>
  );
}
