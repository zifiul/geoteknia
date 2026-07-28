'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { changeStateAction } from '@/app/(admin)/(portal)/admin/proyectos/[id]/actions';
import type { PipelineBoardColumn } from '@/lib/projects/board-utils';

import { ProjectCard } from './ProjectCard';

type StateOption = { slug: string; name: string };

type Props = {
  columns: PipelineBoardColumn[];
  allStates: StateOption[];
  canChangeState: boolean;
};

export function PipelineBoard({ columns, allStates, canChangeState }: Props) {
  const router = useRouter();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onDropColumn = useCallback(
    (toStateSlug: string, projectId: string, fromSlug: string) => {
      if (!canChangeState || toStateSlug === fromSlug) {
        return;
      }
      setBoardError(null);
      startTransition(async () => {
        const result = await changeStateAction(projectId, { toStateSlug });
        if (!result.ok) {
          setBoardError(result.error.message);
          return;
        }
        router.refresh();
      });
    },
    [canChangeState, router],
  );

  return (
    <div className="space-y-3">
      {boardError ? (
        <p className="text-sm text-red-700" role="alert" aria-live="polite">
          {boardError}
        </p>
      ) : null}
      <div
        className="flex gap-4 overflow-x-auto pb-2"
        data-testid="crm-pipeline-board"
        aria-busy={pending}
      >
        {columns.map((column) => (
          <section
            key={column.slug}
            className={`flex w-72 shrink-0 flex-col rounded-xl border bg-brand-neutral/40 ${
              dropTarget === column.slug
                ? 'border-brand-accent ring-2 ring-brand-accent/30'
                : 'border-brand-primary/10'
            }`}
            aria-label={`Columna ${column.name}`}
            onDragOver={(e) => {
              if (!canChangeState || !draggingId) return;
              e.preventDefault();
              setDropTarget(column.slug);
            }}
            onDragLeave={() => setDropTarget(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDropTarget(null);
              const projectId = e.dataTransfer.getData('text/project-id');
              const fromSlug = e.dataTransfer.getData('text/from-state');
              if (projectId) {
                onDropColumn(column.slug, projectId, fromSlug);
              }
              setDraggingId(null);
            }}
          >
            <header className="border-b border-brand-primary/10 px-3 py-2">
              <h3 className="text-sm font-semibold text-brand-primary">{column.name}</h3>
              <p className="text-xs text-brand-secondary" aria-live="polite">
                {column.projects.length} en esta página
              </p>
            </header>
            <ul className="flex flex-1 flex-col gap-2 p-2">
              {column.projects.map((project) => (
                <li key={project.id}>
                  <div
                    draggable={canChangeState && !pending}
                    onDragStart={(e) => {
                      if (!canChangeState) return;
                      e.dataTransfer.setData('text/project-id', project.id);
                      e.dataTransfer.setData('text/from-state', project.state.slug);
                      setDraggingId(project.id);
                    }}
                    onDragEnd={() => setDraggingId(null)}
                    className={canChangeState ? 'cursor-grab active:cursor-grabbing' : undefined}
                  >
                    <ProjectCard
                      project={project}
                      moveTargets={allStates}
                      canChangeState={canChangeState}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
