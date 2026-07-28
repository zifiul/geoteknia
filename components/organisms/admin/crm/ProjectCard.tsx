'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

import { changeStateAction } from '@/app/(admin)/(portal)/admin/proyectos/[id]/actions';
import {
  formatLeadSource,
  formatLeadType,
  formatProjectAgeDays,
} from '@/lib/projects/lead-labels';
import type { ProjectListItem } from '@/lib/projects/queries';

type StateOption = { slug: string; name: string };

type Props = {
  project: ProjectListItem;
  moveTargets: StateOption[];
  canChangeState: boolean;
  onMoveSuccess?: () => void;
};

export function ProjectCard({
  project,
  moveTargets,
  canChangeState,
  onMoveSuccess,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const runMove = useCallback(
    (toStateSlug: string) => {
      if (!canChangeState || toStateSlug === project.state.slug) {
        return;
      }
      setError(null);
      startTransition(async () => {
        const result = await changeStateAction(project.id, {
          toStateSlug,
        });
        if (!result.ok) {
          setError(result.error.message);
          return;
        }
        onMoveSuccess?.();
        router.refresh();
      });
    },
    [canChangeState, onMoveSuccess, project.id, project.state.slug, router],
  );

  const targets = moveTargets.filter((s) => s.slug !== project.state.slug);

  return (
    <article
      className="rounded-lg border border-brand-primary/10 bg-brand-surface p-3 shadow-sm"
      data-testid="crm-project-card"
      data-project-id={project.id}
    >
      <h3 className="text-sm font-semibold text-brand-primary">
        <Link
          href={`/admin/proyectos/${project.id}`}
          className="hover:text-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
        >
          {project.title}
        </Link>
      </h3>
      <dl className="mt-2 space-y-1 text-xs text-brand-secondary">
        <div className="flex justify-between gap-2">
          <dt>Tipo lead</dt>
          <dd className="text-brand-on-surface">{formatLeadType(project.lead?.leadType)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Origen</dt>
          <dd className="text-brand-on-surface">{formatLeadSource(project.lead?.source)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Antigüedad</dt>
          <dd className="text-brand-on-surface">{formatProjectAgeDays(project.createdAt)}</dd>
        </div>
        {project.assignedTechnician ? (
          <div className="flex justify-between gap-2">
            <dt>Técnico</dt>
            <dd className="truncate text-brand-on-surface">
              {project.assignedTechnician.fullName}
            </dd>
          </div>
        ) : null}
      </dl>
      {canChangeState && targets.length > 0 ? (
        <label className="mt-3 block text-xs text-brand-secondary">
          <span className="sr-only">Mover {project.title} a otro estado</span>
          <select
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-2 py-1.5 text-sm disabled:opacity-60"
            disabled={pending}
            defaultValue=""
            onChange={(e) => {
              const slug = e.target.value;
              if (slug) {
                runMove(slug);
                e.target.value = '';
              }
            }}
            aria-label={`Mover proyecto ${project.title} a otro estado`}
          >
            <option value="">Mover a…</option>
            {targets.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {error ? (
        <p className="mt-2 text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </article>
  );
}
