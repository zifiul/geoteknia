import type { Prisma } from '@prisma/client';

/** Fija first_response_at una sola vez (GTK-35 / GTK-34 métrica). */
export async function maybeSetFirstResponseAt(
  tx: Prisma.TransactionClient,
  projectId: string,
): Promise<void> {
  await tx.project.updateMany({
    where: { id: projectId, firstResponseAt: null },
    data: { firstResponseAt: new Date() },
  });
}
