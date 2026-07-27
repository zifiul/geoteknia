const DEFAULT_CALLBACK = '/admin';

/**
 * Restringe post-login a paths internos (SEC-2 open redirect).
 */
export function resolveLoginCallbackUrl(
  callbackUrl: string | undefined | null,
): string {
  if (!callbackUrl || callbackUrl.trim() === '') {
    return DEFAULT_CALLBACK;
  }

  const trimmed = callbackUrl.trim();

  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return DEFAULT_CALLBACK;
  }

  if (trimmed.includes('\\') || trimmed.includes('\0')) {
    return DEFAULT_CALLBACK;
  }

  try {
    const parsed = new URL(trimmed, 'http://localhost');
    if (parsed.origin !== 'http://localhost') {
      return DEFAULT_CALLBACK;
    }
    const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    if (!path.startsWith('/')) {
      return DEFAULT_CALLBACK;
    }
    return path;
  } catch {
    return DEFAULT_CALLBACK;
  }
}
