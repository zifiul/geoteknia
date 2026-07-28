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
    <div className="overflow-x-auto rounded-xl border border-brand-primary/10 bg-brand-surface shadow-sm">
      <table className="min-w-full text-left text-sm" data-testid="crm-project-list">
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
  );
}
