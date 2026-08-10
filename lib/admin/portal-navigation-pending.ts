const STORAGE_KEY = 'geoteknia:admin-portal-navigation-pending';

export const ADMIN_PORTAL_NAVIGATION_EVENT = 'geoteknia:admin-portal-navigation';

export function markAdminPortalNavigationPending(): void {
  if (typeof window === 'undefined') return;

  sessionStorage.setItem(STORAGE_KEY, '1');
  window.dispatchEvent(new Event(ADMIN_PORTAL_NAVIGATION_EVENT));
}

export function isAdminPortalNavigationPending(): boolean {
  if (typeof window === 'undefined') return false;

  return sessionStorage.getItem(STORAGE_KEY) === '1';
}

export function clearAdminPortalNavigationPending(): void {
  if (typeof window === 'undefined') return;

  sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(ADMIN_PORTAL_NAVIGATION_EVENT));
}
