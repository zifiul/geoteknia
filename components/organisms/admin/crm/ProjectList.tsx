import Link from 'next/link';

import {
  formatLeadSource,
  formatLeadType,
  formatProjectAgeDays,
} from '@/lib/projects/lead-labels';
import type { ProjectListItem } from '@/lib/projects/queries';

import { ProjectRowActions } from './ProjectRowActions';

type StateOption = { slug: string; name: string };

type Props = {
  items: ProjectListItem[];
  allStates: StateOption[];
  canChangeState: boolean;
};

export function ProjectList({ items, allStates, canChangeState }: Props) {
  return (
    <section
      aria-labelledby="crm-project-list-heading"
      className="min-w-0 w-full"
      data-testid="crm-project-list"
    >
      <h2 id="crm-project-list-heading" className="sr-only">
        Listado de proyectos
      </h2>

      <ul className="space-y-3 md:hidden">
        {items.map((project) => (
          <li
            key={project.id}
            className="rounded-xl border border-brand-primary/10 bg-brand-surface p-4 shadow-sm"
          >
            <Link
              href={`/admin/proyectos/${project.id}`}
              className="font-medium text-brand-primary hover:text-brand-accent"
            >
              {project.title}
            </Link>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs font-medium text-brand-secondary">Estado</dt>
                <dd className="text-brand-on-surface">{project.state.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-brand-secondary">Tipo lead</dt>
                <dd className="text-brand-on-surface">
                  {formatLeadType(project.lead?.leadType)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-brand-secondary">Origen</dt>
                <dd className="text-brand-on-surface">
                  {formatLeadSource(project.lead?.source)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-brand-secondary">Antigüedad</dt>
                <dd className="text-brand-on-surface">
                  {formatProjectAgeDays(project.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-brand-secondary">Técnico</dt>
                <dd className="text-brand-on-surface">
                  {project.assignedTechnician?.fullName ?? '—'}
                </dd>
              </div>
            </dl>
            {canChangeState ? (
              <div className="mt-4">
                <ProjectRowActions project={project} moveTargets={allStates} />
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="hidden w-full min-w-0 max-w-full overflow-x-auto rounded-xl border border-brand-primary/10 bg-brand-surface shadow-sm md:block">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="border-b border-brand-primary/10 bg-brand-neutral/40 text-xs uppercase tracking-wide text-brand-secondary">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Proyecto
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Estado
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Tipo lead
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Origen
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Antigüedad
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Técnico
              </th>
              {canChangeState ? (
                <th scope="col" className="px-4 py-3 font-semibold">
                  Estado
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-primary/5">
            {items.map((project) => (
              <tr key={project.id} className="hover:bg-brand-neutral/30">
                <td className="px-4 py-3 font-medium text-brand-primary">
                  <Link
                    href={`/admin/proyectos/${project.id}`}
                    className="hover:text-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
                  >
                    {project.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-brand-on-surface">{project.state.name}</td>
                <td className="px-4 py-3 text-brand-on-surface">
                  {formatLeadType(project.lead?.leadType)}
                </td>
                <td className="px-4 py-3 text-brand-on-surface">
                  {formatLeadSource(project.lead?.source)}
                </td>
                <td className="px-4 py-3 text-brand-on-surface">
                  {formatProjectAgeDays(project.createdAt)}
                </td>
                <td className="px-4 py-3 text-brand-on-surface">
                  {project.assignedTechnician?.fullName ?? '—'}
                </td>
                {canChangeState ? (
                  <td className="px-4 py-3">
                    <ProjectRowActions project={project} moveTargets={allStates} />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
