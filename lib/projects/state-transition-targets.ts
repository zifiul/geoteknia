export type PipelineStateOption = {
  slug: string;
  name: string;
  isTerminal: boolean;
};

export type CurrentProjectState = {
  slug: string;
  isTerminal: boolean;
};

/**
 * Destinos permitidos para changeProjectState (ver lib/projects/transitions.ts).
 */
export function listAllowedStateTransitionTargets(
  current: CurrentProjectState,
  allStates: PipelineStateOption[],
): PipelineStateOption[] {
  if (current.isTerminal) {
    return [];
  }
  return allStates.filter((state) => state.slug !== current.slug);
}
