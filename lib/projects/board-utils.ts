import type { ProjectListItem } from './queries';

export type PipelineBoardColumn = {
  slug: string;
  name: string;
  order: number;
  projects: ProjectListItem[];
};

export type PipelineBoardStateRow = {
  slug: string;
  name: string;
  order: number;
};

/** Agrupa items paginados en columnas según el catálogo de estados (orden estable). */
export function groupProjectsByState(
  states: PipelineBoardStateRow[],
  items: ProjectListItem[],
): PipelineBoardColumn[] {
  const bySlug = new Map<string, ProjectListItem[]>();
  for (const state of states) {
    bySlug.set(state.slug, []);
  }
  for (const project of items) {
    const bucket = bySlug.get(project.state.slug);
    if (bucket) {
      bucket.push(project);
    }
  }
  return states.map((state) => ({
    ...state,
    projects: bySlug.get(state.slug) ?? [],
  }));
}
