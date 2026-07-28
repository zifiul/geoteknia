'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { changeStateAction } from '@/app/(admin)/(portal)/admin/proyectos/[id]/actions';
import type { ProjectListItem } from '@/lib/projects/queries';

type StateOption = { slug: string; name: string };

type Props = {
  project: ProjectListItem;
  moveTargets: StateOption[];
};

export function ProjectRowActions({ project, moveTargets }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const targets = moveTargets.filter((s) => s.slug !== project.state.slug);

  return (
    <select
      className="w-full max-w-[12rem] rounded-md border border-brand-secondary/30 px-2 py-1.5 text-sm disabled:opacity-60"
      disabled={pending}
      defaultValue=""
      aria-label={`Mover ${project.title} a otro estado`}
      onChange={(e) => {
        const slug = e.target.value;
        if (!slug) return;
        startTransition(async () => {
          await changeStateAction(project.id, { toStateSlug: slug });
          router.refresh();
        });
        e.target.value = '';
      }}
    >
      <option value="">Mover a…</option>
      {targets.map((s) => (
        <option key={s.slug} value={s.slug}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
