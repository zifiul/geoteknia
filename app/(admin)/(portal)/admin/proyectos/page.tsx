import type { Metadata } from 'next';
import Link from 'next/link';

import { runWithPortalReadAccess } from '@/lib/admin/portal-page-errors';
import {
  getPipelineMetrics,
  listProjects,
  parseProjectFiltersFromSearchParams,
} from '@/lib/projects';

export const metadata: Metadata = {
  title: 'Proyectos — Portal Geoteknia',
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminProyectosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseProjectFiltersFromSearchParams(params);

  const { items, total, page, pageSize } = await runWithPortalReadAccess(() =>
    listProjects(filters),
  );
  const metrics = await runWithPortalReadAccess(() => getPipelineMetrics(filters));

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main>
      <h1>Pipeline de proyectos</h1>
      <p>
        {total} proyecto{total === 1 ? '' : 's'} · página {page} de {totalPages}
      </p>

      <section aria-labelledby="metricas-heading">
        <h2 id="metricas-heading">Métricas</h2>
        <p>
          Tasa de cualificación:{' '}
          {metrics.qualificationRate === null
            ? 'sin datos'
            : `${(metrics.qualificationRate * 100).toFixed(1)} %`}
        </p>
        <p>
          Tiempo medio 1.ª respuesta:{' '}
          {metrics.avgFirstResponseHours === null
            ? 'sin datos'
            : `${metrics.avgFirstResponseHours.toFixed(1)} h`}
        </p>
        <ul>
          {metrics.byService.map((row) => (
            <li key={row.serviceId ?? 'none'}>
              {row.label}: {row.count}
            </li>
          ))}
        </ul>
        <ul>
          {metrics.byProvince.map((row) => (
            <li key={row.provinceId ?? 'none'}>
              {row.label}: {row.count}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="filtros-heading">
        <h2 id="filtros-heading">Filtros</h2>
        <form method="get">
          <label>
            Estado (slug)
            <input name="stateSlug" defaultValue={filters.stateSlug ?? ''} />
          </label>
          <label>
            Servicio (slug)
            <input name="serviceSlug" defaultValue={filters.serviceSlug ?? ''} />
          </label>
          <label>
            Provincia (slug)
            <input name="provinceSlug" defaultValue={filters.provinceSlug ?? ''} />
          </label>
          <label>
            Técnico (UUID)
            <input name="technicianId" defaultValue={filters.technicianId ?? ''} />
          </label>
          <label>
            Desde
            <input
              name="from"
              type="date"
              defaultValue={
                filters.from ? filters.from.toISOString().slice(0, 10) : ''
              }
            />
          </label>
          <label>
            Hasta
            <input
              name="to"
              type="date"
              defaultValue={filters.to ? filters.to.toISOString().slice(0, 10) : ''}
            />
          </label>
          <input type="hidden" name="pageSize" value={String(pageSize)} />
          <button type="submit">Aplicar</button>
        </form>
      </section>

      <section aria-labelledby="listado-heading">
        <h2 id="listado-heading">Listado</h2>
        <ul>
          {items.map((project) => (
            <li key={project.id}>
              <Link href={`/admin/proyectos/${project.id}`}>{project.title}</Link>
              {' — '}
              {project.state.name}
              {project.assignedTechnician
                ? ` · ${project.assignedTechnician.fullName}`
                : ''}
            </li>
          ))}
        </ul>
        {items.length === 0 ? <p>No hay proyectos con estos filtros.</p> : null}
        <nav aria-label="Paginación">
          {page > 1 ? (
            <Link
              href={`?${buildPageQuery(params, page - 1, pageSize)}`}
            >
              Anterior
            </Link>
          ) : null}
          {page < totalPages ? (
            <Link
              href={`?${buildPageQuery(params, page + 1, pageSize)}`}
            >
              Siguiente
            </Link>
          ) : null}
        </nav>
      </section>
    </main>
  );
}

function buildPageQuery(
  params: Record<string, string | string[] | undefined>,
  page: number,
  pageSize: number,
): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === 'page') continue;
    const v = Array.isArray(value) ? value[0] : value;
    if (v) q.set(key, v);
  }
  q.set('page', String(page));
  q.set('pageSize', String(pageSize));
  return q.toString();
}
