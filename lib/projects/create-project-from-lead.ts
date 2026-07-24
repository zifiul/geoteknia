import 'server-only';

import type { Lead, Prisma, Service, Province, WorkTypology } from '@prisma/client';

import { db } from '@/lib/db';

export type CreateProjectFromLeadInput = {
  leadId: string;
  referenceNumber: string;
  service: Service | null;
  province: Province | null;
  initialStateId: string;
  titlePrefix?: string;
};

export function buildProjectTitle(
  referenceNumber: string,
  service: Service | null,
  province: Province | null,
  titlePrefix = 'Presupuesto',
): string {
  const serviceLabel = service?.name ?? 'sin servicio';
  const provinceLabel = province?.name ?? 'sin provincia';
  return `${titlePrefix} ${serviceLabel} — ${provinceLabel} (${referenceNumber})`;
}

export async function createProjectFromLead(
  tx: Prisma.TransactionClient,
  input: CreateProjectFromLeadInput,
) {
  const title = buildProjectTitle(
    input.referenceNumber,
    input.service,
    input.province,
    input.titlePrefix,
  );

  return tx.project.create({
    data: {
      leadId: input.leadId,
      stateId: input.initialStateId,
      title,
      serviceId: input.service?.id ?? null,
      provinceId: input.province?.id ?? null,
    },
  });
}

export async function findInitialProjectStateId(
  tx: Prisma.TransactionClient = db,
): Promise<string> {
  const state = await tx.projectState.findFirst({
    where: { isInitial: true },
    select: { id: true },
  });
  if (!state) {
    throw new Error('Estado inicial de proyecto no configurado (seed lead-nuevo)');
  }
  return state.id;
}
