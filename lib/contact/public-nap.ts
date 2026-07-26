import type { PublicOrganizationProfile } from '@/lib/content/organization';

export type PublicNapSnapshot = {
  displayName: string;
  address: string | null;
  phone: string | null;
  email: string | null;
};

/** Campos NAP públicos derivados del perfil (footer y /contacto). */
export function publicNapFromProfile(
  profile: PublicOrganizationProfile | null,
): PublicNapSnapshot {
  return {
    displayName: profile?.displayName ?? 'Geoteknia',
    address: profile?.napAddress ?? null,
    phone: profile?.napPhone ?? null,
    email: profile?.napEmail ?? null,
  };
}
