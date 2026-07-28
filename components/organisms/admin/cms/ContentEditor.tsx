'use client';

import { SchemaType } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

import {
  createServiceAction,
  updateServiceAction,
} from '@/app/(admin)/(portal)/contenido/actions';
import { getCmsContentTypeMeta } from '@/lib/admin/cms-content-types';
import type { CmsEditorPageData } from '@/lib/cms/editor/load-cms-editor-page';
import {
  cmsServiceFormSchema,
  type CmsServiceFormValues,
} from '@/lib/cms/editor/service-form-schema';

import { BodyEditor } from './BodyEditor';
import { AiGeneratePanel } from './AiGeneratePanel';
import { EditorialWorkflowPanel } from './EditorialWorkflowPanel';
import { PreviewPane } from './PreviewPane';
import { RelationsPicker } from './RelationsPicker';
import { SeoBlock } from './SeoBlock';

type Props = {
  page: CmsEditorPageData;
};

export function ContentEditor({ page }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [workspaceTab, setWorkspaceTab] = useState<'editor' | 'ai'>('editor');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState<CmsServiceFormValues>(() => ({
    ...(page.initial as CmsServiceFormValues),
    schemaType:
      (page.initial.schemaType as SchemaType) ?? SchemaType.Service,
  }));

  const patch = useCallback(
    (partial: Partial<CmsServiceFormValues>) => {
      setValues((prev) => ({ ...prev, ...partial }));
    },
    [],
  );

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!page.canSave) return;
      setSaveError(null);
      setSaveSuccess(null);
      const parsed = cmsServiceFormSchema.safeParse(values);
      if (!parsed.success) {
        const next: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path[0];
          if (typeof key === 'string' && !next[key]) {
            next[key] = issue.message;
          }
        }
        setFieldErrors(next);
        return;
      }
      setFieldErrors({});
      startTransition(async () => {
        const payload = parsed.data;
        if (page.isNew) {
          const result = await createServiceAction(payload);
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
          router.replace(getCmsContentTypeMeta('service').editorPath(newId));
          router.refresh();
          return;
        }
        const result = await updateServiceAction(page.entityId!, payload);
        if (!result.ok) {
          setSaveError(result.error.message);
          return;
        }
        setSaveSuccess('Cambios guardados.');
        router.refresh();
      });
    },
    [page.canSave, page.entityId, page.isNew, router, values],
  );

  if (page.contentType !== 'service') {
    return (
      <p className="rounded-lg border border-brand-primary/10 bg-brand-surface p-6 text-brand-secondary">
        El editor completo para «{page.typeLabel}» se entregará en una iteración
        posterior. Por ahora use el tipo servicio.
      </p>
    );
  }

  return (
    <div data-testid="cms-content-editor">
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

      {page.canUseAi && page.promptPageType ? (
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

      {workspaceTab === 'ai' && page.canUseAi && page.promptPageType ? (
        <AiGeneratePanel
          pageType={page.promptPageType}
          pageTypeLabel={page.typeLabel}
          targetContentType={page.contentType}
          targetContentId={page.entityId}
          formValues={values}
          onApplyToForm={(partial) => patch(partial)}
        />
      ) : (
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className={`space-y-6 ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}
          onSubmit={onSubmit}
          aria-busy={pending}
        >
          <section className="rounded-xl border border-brand-primary/10 bg-brand-surface p-4 shadow-sm">
            <h2 className="font-semibold text-brand-primary">Contenido</h2>
            <label className="mt-3 block text-sm text-brand-secondary">
              Nombre del servicio
              <input
                className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
                value={values.name}
                onChange={(e) => patch({ name: e.target.value })}
              />
            </label>
            {fieldErrors.name ? (
              <p role="alert" className="mt-1 text-sm text-red-700">
                {fieldErrors.name}
              </p>
            ) : null}
            <label className="mt-3 block text-sm text-brand-secondary">
              Resumen
              <textarea
                rows={3}
                className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
                value={values.summary ?? ''}
                onChange={(e) => patch({ summary: e.target.value })}
              />
            </label>
            <BodyEditor
              label="Cuerpo (HTML)"
              value={values.body}
              onChange={(v) => patch({ body: v })}
              error={fieldErrors.body}
            />
            <label className="mt-3 block text-sm text-brand-secondary">
              Normativa aplicable
              <textarea
                rows={4}
                className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 font-mono text-sm"
                value={values.applicableNorms ?? ''}
                onChange={(e) => patch({ applicableNorms: e.target.value })}
              />
            </label>
          </section>

          <SeoBlock values={values} onChange={patch} errors={fieldErrors} />

          <RelationsPicker
            zoneOptions={page.zoneOptions}
            selectedIds={values.zoneIds ?? []}
            onChange={(ids) => patch({ zoneIds: ids })}
          />

          <div className="sticky bottom-4 flex justify-end rounded-lg border border-brand-primary/10 bg-brand-surface/95 p-3 shadow-md backdrop-blur">
            <button
              type="submit"
              disabled={!page.canSave || pending}
              className="min-h-11 rounded-md bg-brand-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {pending ? 'Guardando…' : page.isNew ? 'Crear borrador' : 'Guardar'}
            </button>
          </div>
        </form>

        <div className={mobileTab === 'edit' ? 'hidden lg:block' : ''}>
          <PreviewPane
            contentType="service"
            formValues={values}
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
