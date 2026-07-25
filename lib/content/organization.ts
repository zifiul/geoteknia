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
};

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
      },
      orderBy: { updatedAt: 'desc' },
    });
    return row;
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
