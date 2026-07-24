/**
 * GTK-31 — createProjectFromLead expediente/importe.
 */
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const projectCreateMock = vi.fn();

describe('createProjectFromLead (GTK-31 extension)', () => {
  it('persiste expedienteRef y estimatedValue cuando se pasan', async () => {
    projectCreateMock.mockResolvedValue({ id: 'p1' });
    const tx = { project: { create: projectCreateMock } };

    const { createProjectFromLead } = await import(
      '@/lib/projects/create-project-from-lead'
    );

    await createProjectFromLead(tx as never, {
      leadId: 'lead-1',
      referenceNumber: 'LIC-20260724-ABCD',
      service: null,
      province: null,
      initialStateId: 'state-1',
      titlePrefix: 'Licitación',
      expedienteRef: 'EXP-99',
      estimatedValue: 1000.5,
    });

    expect(projectCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          expedienteRef: 'EXP-99',
          estimatedValue: expect.objectContaining({}),
        }),
      }),
    );
  });
});
