'use client';

import type { LeadSource, LeadType } from '@prisma/client';
import { useState } from 'react';

import {
  formatLeadSource,
  formatLeadType,
} from '@/lib/projects/lead-labels';
import type { PipelineStateOption } from '@/lib/projects/state-transition-targets';
import { listAllowedStateTransitionTargets } from '@/lib/projects/state-transition-targets';

import { StateChanger } from './StateChanger';
import { TechnicianAssign } from './TechnicianAssign';

type TechnicianOption = { id: string; fullName: string };

export type ProjectHeaderProps = {
  projectId: string;
  title: string;
  referenceNumber?: string | null;
  state: { slug: string; name: string; isTerminal: boolean };
  assignedTechnicianName: string | null;
  assignedTechnicianId: string | null;
  isQualified: boolean;
  leadType: LeadType | null | undefined;
  leadSource: LeadSource | null | undefined;
  firstResponseLabel: string | null;
  allStates: PipelineStateOption[];
  technicians: TechnicianOption[];
  canChangeState: boolean;
  canAssign: boolean;
};

export function ProjectHeader({
  projectId,
  title,
  referenceNumber,
  state,
  assignedTechnicianName,
  assignedTechnicianId,
  isQualified,
  leadType,
  leadSource,
  firstResponseLabel,
  allStates,
  technicians,
  canChangeState,
  canAssign,
}: ProjectHeaderProps) {
  const [stateOpen, setStateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const hasStateTargets =
    canChangeState &&
    listAllowedStateTransitionTargets(state, allStates).length > 0;

  return (
    <header
      className="rounded-xl border border-brand-primary/10 bg-brand-surface p-4 shadow-sm lg:p-6"
      data-testid="crm-project-header"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-secondary">
            {referenceNumber ? `Ref. ${referenceNumber}` : 'Proyecto CRM'}
          </p>
          <h1 className="text-xl font-semibold text-brand-primary lg:text-2xl">
            {title}
          </h1>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-brand-secondary">Estado</dt>
              <dd className="font-medium text-brand-on-surface">{state.name}</dd>
            </div>
            <div>
              <dt className="text-brand-secondary">Técnico</dt>
              <dd className="font-medium text-brand-on-surface">
                {assignedTechnicianName ?? 'Sin asignar'}
              </dd>
            </div>
            <div>
              <dt className="text-brand-secondary">Tipo lead</dt>
              <dd className="text-brand-on-surface">{formatLeadType(leadType)}</dd>
            </div>
            <div>
              <dt className="text-brand-secondary">Origen</dt>
              <dd className="text-brand-on-surface">
                {formatLeadSource(leadSource)}
              </dd>
            </div>
            <div>
              <dt className="text-brand-secondary">Cualificación</dt>
              <dd className="text-brand-on-surface">
                {isQualified ? 'Cualificado' : 'No cualificado'}
              </dd>
            </div>
            {firstResponseLabel ? (
              <div>
                <dt className="text-brand-secondary">Primera respuesta</dt>
                <dd className="text-brand-on-surface">{firstResponseLabel}</dd>
              </div>
            ) : null}
          </dl>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasStateTargets ? (
            <button
              type="button"
              className="rounded-md border border-brand-accent px-4 py-2 text-sm font-medium text-brand-accent hover:bg-brand-accent/5"
              onClick={() => setStateOpen(true)}
            >
              Cambiar estado
            </button>
          ) : null}
          {canAssign ? (
            <button
              type="button"
              className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              onClick={() => setAssignOpen(true)}
            >
              {assignedTechnicianId ? 'Reasignar técnico' : 'Asignar técnico'}
            </button>
          ) : null}
        </div>
      </div>
      <StateChanger
        projectId={projectId}
        projectTitle={title}
        currentState={state}
        allStates={allStates}
        canChangeState={canChangeState}
        open={stateOpen}
        onOpenChange={setStateOpen}
      />
      <TechnicianAssign
        projectId={projectId}
        projectTitle={title}
        currentTechnicianId={assignedTechnicianId}
        technicians={technicians}
        canAssign={canAssign}
        open={assignOpen}
        onOpenChange={setAssignOpen}
      />
    </header>
  );
}
