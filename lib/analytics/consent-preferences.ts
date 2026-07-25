let preferencesOpener: (() => void) | null = null;

export function registerConsentPreferencesOpener(opener: () => void): void {
  preferencesOpener = opener;
}

export function openConsentPreferences(): void {
  preferencesOpener?.();
}
