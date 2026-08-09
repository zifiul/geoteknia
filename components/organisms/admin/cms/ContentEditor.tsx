'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

import { getCmsContentTypeMeta } from '@/lib/admin/cms-content-types';
import { getCmsEditorFormSchema } from '@/lib/cms/editor/cms-form-schemas';
import { EDITOR_MUTATIONS } from '@/lib/cms/editor/editor-mutations';
import type { CmsEditorPageData } from '@/lib/cms/editor/load-cms-editor-page';
import type { CmsServiceFormValues } from '@/lib/cms/editor/service-form-schema';

import { AiGeneratePanel } from './AiGeneratePanel';
import {
  CmsEditorFormFields,
  mapCmsFieldErrors,
} from './CmsEditorFormFields';
import { normalizeEditorPayload } from '@/lib/cms/editor/normalize-editor-payload';
import { EditorialWorkflowPanel } from './EditorialWorkflowPanel';
import { PreviewPane } from './PreviewPane';

type Props = {
  page: CmsEditorPageData;
};

export function ContentEditor({ page }: Props) {
  const router = useRouter();
  const entityKey = page.isNew ? 'nuevo' : page.entityId!;
  const syncedEntityKey = useRef(entityKey);
  const [pending, startTransition] = useTransition();
  const [photoUploadPending, setPhotoUploadPending] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [workspaceTab, setWorkspaceTab] = useState<'editor' | 'ai'>('editor');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, unknown>>(
    () => ({ ...page.initial }),
  );

  useEffect(() => {
    if (syncedEntityKey.current !== entityKey) {
      syncedEntityKey.current = entityKey;
      setValues({ ...page.initial });
      setFieldErrors({});
      setSaveError(null);
      setSaveSuccess(null);
    }
  }, [entityKey, page.initial]);

  const patch = useCallback((partial: Record<string, unknown>) => {
    setValues((prev) => ({ ...prev, ...partial }));
  }, []);

  const onPhotoIdChange = useCallback((photoId: string | null) => {
    setValues((prev) => ({ ...prev, photoId }));
  }, []);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!page.canSave) return;
      setSaveError(null);
      setSaveSuccess(null);

      const mutations = EDITOR_MUTATIONS[page.contentType];
      const schema = getCmsEditorFormSchema(page.contentType);
      const payload = normalizeEditorPayload(page.contentType, values);
      const parsed = schema.safeParse(payload);
      if (!parsed.success) {
        const errors = mapCmsFieldErrors(parsed.error);
        setFieldErrors(errors);
        const firstError = Object.values(errors)[0];
        setSaveError(
          firstError ?? 'Revise los campos del formulario antes de guardar.',
        );
        return;
      }
      setFieldErrors({});

      startTransition(async () => {
        if (page.isNew) {
          const result = await mutations.create(parsed.data);
          if (!result.ok) {
            setSaveError(result.error.message);
            return;
          }
          const newId = result.data?.id;
          if (!newId) {
            setSaveError('No se recibió el identificador del contenido.');
            return;
          }
          setSaveSuccess('Contenido creado correctamente.');
          router.replace(getCmsContentTypeMeta(page.contentType).editorPath(newId));
          router.refresh();
          return;
        }
        const result = await mutations.update(page.entityId!, parsed.data);
        if (!result.ok) {
          setSaveError(result.error.message);
          return;
        }
        setSaveSuccess('Cambios guardados.');
        setValues((prev) => ({
          ...prev,
          ...(parsed.data as Record<string, unknown>),
        }));
        router.refresh();
      });
    },
    [page.canSave, page.contentType, page.entityId, page.isNew, router, values],
  );

  return (
    <div data-testid="cms-content-editor" className="w-full max-w-full min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-brand-primary">
            {page.isNew ? 'Nuevo' : 'Editar'} {page.typeLabel}
          </h1>
          <p className="text-sm text-brand-secondary">
            Borrador editorial — los cambios no publican el contenido.
          </p>
        </div>
        <div className="flex gap-2 lg:hidden">
          <button
            type="button"
            className={`min-h-11 rounded-md px-3 py-2 text-sm font-medium ${
              mobileTab === 'edit'
                ? 'bg-brand-primary text-white'
                : 'border border-brand-primary/20 text-brand-accent'
            }`}
            onClick={() => setMobileTab('edit')}
          >
            Editar
          </button>
          <button
            type="button"
            className={`min-h-11 rounded-md px-3 py-2 text-sm font-medium ${
              mobileTab === 'preview'
                ? 'bg-brand-primary text-white'
                : 'border border-brand-primary/20 text-brand-accent'
            }`}
            onClick={() => setMobileTab('preview')}
          >
            Vista previa
          </button>
        </div>
      </div>

      {page.canUseAi && page.promptPageType && page.contentType === 'service' ? (
        <div className="mb-4 flex gap-2 border-b border-brand-primary/10 pb-2">
          <button
            type="button"
            className={`min-h-11 rounded-md px-4 py-2 text-sm font-medium ${
              workspaceTab === 'editor'
                ? 'bg-brand-primary text-white'
                : 'text-brand-accent hover:bg-brand-surface'
            }`}
            onClick={() => setWorkspaceTab('editor')}
          >
            Editor
          </button>
          <button
            type="button"
            className={`min-h-11 rounded-md px-4 py-2 text-sm font-medium ${
              workspaceTab === 'ai'
                ? 'bg-brand-primary text-white'
                : 'text-brand-accent hover:bg-brand-surface'
            }`}
            data-testid="cms-ai-tab"
            onClick={() => setWorkspaceTab('ai')}
          >
            Generar con IA
          </button>
        </div>
      ) : null}

      {page.editorial && page.entityId ? (
        <EditorialWorkflowPanel
          contentType={page.contentType}
          contentId={page.entityId}
          workflowStatus={page.editorial.workflowStatus}
          scheduledPublishAt={page.editorial.scheduledPublishAt}
          publicPath={page.editorial.publicPath}
          canUpdate={page.editorial.canUpdate}
          canPublish={page.editorial.canPublish}
          revisions={page.editorial.revisions}
        />
      ) : null}

      {saveError ? (
        <p role="alert" className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          {saveError}
        </p>
      ) : null}
      {saveSuccess ? (
        <p role="status" className="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-900">
          {saveSuccess}
        </p>
      ) : null}

      {workspaceTab === 'ai' &&
      page.canUseAi &&
      page.promptPageType &&
      page.contentType === 'service' ? (
        <AiGeneratePanel
          pageType={page.promptPageType}
          pageTypeLabel={page.typeLabel}
          targetContentType={page.contentType}
          targetContentId={page.entityId}
          formValues={values as CmsServiceFormValues}
          onApplyToForm={(partial) => patch(partial)}
        />
      ) : (
        <div className="grid w-full max-w-full min-w-0 gap-6 lg:grid-cols-2">
          <form
            className={`min-w-0 space-y-6 ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}
            onSubmit={onSubmit}
            noValidate
            aria-busy={pending}
          >
            <CmsEditorFormFields
              page={page}
              values={values}
              fieldErrors={fieldErrors}
              onChange={patch}
              onPhotoIdChange={onPhotoIdChange}
              onPhotoPendingChange={setPhotoUploadPending}
            />

            <div className="sticky bottom-4 flex justify-end rounded-lg border border-brand-primary/10 bg-brand-surface/95 p-3 shadow-md backdrop-blur">
              <button
                type="submit"
                disabled={!page.canSave || pending || photoUploadPending}
                className="min-h-11 rounded-md bg-brand-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 cursor-pointer"
              >
                {pending ? 'Guardando…' : page.isNew ? 'Crear borrador' : 'Guardar'}
              </button>
            </div>
          </form>

          <div className={`min-w-0 ${mobileTab === 'edit' ? 'hidden lg:block' : ''}`}>
            <PreviewPane
              contentType={page.contentType}
              formValues={values}
              referenceOptions={page.referenceOptions}
              heroImageUrl={page.heroImageUrl}
              heroImageAlt={page.heroImageAlt}
              entityId={page.entityId ?? undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}
