import 'server-only';

import type { Contact, Prisma } from '@prisma/client';

export type UpsertContactInput = {
  fullName?: string;
  email?: string;
  phone?: string;
  company?: string;
  professionalRole?: string;
  provinceId?: string;
};

/**
 * Dedupe por email OR teléfono (`deleted_at IS NULL`); rellena solo campos presentes.
 */
export async function upsertContact(
  tx: Prisma.TransactionClient,
  input: UpsertContactInput,
): Promise<Contact> {
  const orConditions: Prisma.ContactWhereInput[] = [];
  if (input.email) {
    orConditions.push({ email: input.email });
  }
  if (input.phone) {
    orConditions.push({ phone: input.phone });
  }

  const existing =
    orConditions.length > 0
      ? await tx.contact.findFirst({
          where: { deletedAt: null, OR: orConditions },
        })
      : null;

  if (!existing) {
    return tx.contact.create({
      data: {
        fullName: input.fullName ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        company: input.company ?? null,
        professionalRole: input.professionalRole ?? null,
        provinceId: input.provinceId ?? null,
      },
    });
  }

  return tx.contact.update({
    where: { id: existing.id },
    data: {
      fullName: existing.fullName ?? input.fullName ?? null,
      email: existing.email ?? input.email ?? null,
      phone: existing.phone ?? input.phone ?? null,
      company: existing.company ?? input.company ?? null,
      professionalRole:
        existing.professionalRole ?? input.professionalRole ?? null,
      provinceId: existing.provinceId ?? input.provinceId ?? null,
    },
  });
}
