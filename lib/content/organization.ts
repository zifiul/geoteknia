import 'server-only';

import { unstable_cache } from 'next/cache';

import { db } from '@/lib/db';

export const ORGANIZATION_PROFILE_CACHE_TAG = 'organization-profile';

export type PublicOrganizationProfile = {
  displayName: string;
  legalName: string;
  napAddress: string;
  napPhone: string;
  napEmail: string;
  areaServed: string[] | null;
  aggregateRating: number | null;
};

function parseAreaServed(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const items = value.filter(
    (entry): entry is string => typeof entry === 'string' && entry.trim().length > 0,
  );
  return items.length > 0 ? items : null;
}

export type PublicContactChannel = {
  phone: string | null;
  whatsappNumber: string | null;
  email: string | null;
};

const loadOrganizationProfile = unstable_cache(
  async (): Promise<PublicOrganizationProfile | null> => {
    const row = await db.organizationProfile.findFirst({
      where: { deletedAt: null },
      select: {
        displayName: true,
        legalName: true,
        napAddress: true,
        napPhone: true,
        napEmail: true,
        areaServed: true,
        aggregateRating: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    if (!row) {
      return null;
    }
    return {
      displayName: row.displayName,
      legalName: row.legalName,
      napAddress: row.napAddress,
      napPhone: row.napPhone,
      napEmail: row.napEmail,
      areaServed: parseAreaServed(row.areaServed),
      aggregateRating:
        row.aggregateRating !== null && row.aggregateRating !== undefined
          ? Number(row.aggregateRating)
          : null,
    };
  },
  ['organization-profile-public'],
  {
    revalidate: 3600,
    tags: [ORGANIZATION_PROFILE_CACHE_TAG],
  },
);

const loadGeneralContactChannel = unstable_cache(
  async (): Promise<PublicContactChannel | null> => {
    const row = await db.contactChannel.findFirst({
      where: {
        deletedAt: null,
        isActive: true,
        OR: [
          { phone: { not: null } },
          { whatsappNumber: { not: null } },
          { email: { not: null } },
        ],
      },
      select: {
        phone: true,
        whatsappNumber: true,
        email: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    return row;
  },
  ['general-contact-channel-public'],
  {
    revalidate: 3600,
    tags: [ORGANIZATION_PROFILE_CACHE_TAG],
  },
);

export async function getOrganizationProfile(): Promise<PublicOrganizationProfile | null> {
  return loadOrganizationProfile();
}

export async function getGeneralContactChannel(): Promise<PublicContactChannel | null> {
  return loadGeneralContactChannel();
}
