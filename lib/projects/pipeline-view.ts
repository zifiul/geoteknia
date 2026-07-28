export type PipelineView = 'board' | 'list';

export function resolvePipelineView(
  roleName: string,
  rawView: string | undefined,
): PipelineView {
  if (roleName === 'tecnico') {
    return 'list';
  }
  if (rawView === 'list') {
    return 'list';
  }
  return 'board';
}

export function firstSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return Array.isArray(value) ? value[0] : value;
}
