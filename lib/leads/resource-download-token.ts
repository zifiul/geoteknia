const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export type ParsedResourceDownloadToken = {
  leadId: string;
  leadMagnetId: string;
};

/**
 * Decodifica el token MVP de descarga (`base64url(leadId:leadMagnetId)`).
 */
export function parseResourceDownloadToken(
  token: string,
): ParsedResourceDownloadToken | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const colon = decoded.indexOf(':');
    if (colon <= 0) {
      return null;
    }
    const leadId = decoded.slice(0, colon);
    const leadMagnetId = decoded.slice(colon + 1);
    if (!isUuid(leadId) || !isUuid(leadMagnetId)) {
      return null;
    }
    return { leadId, leadMagnetId };
  } catch {
    return null;
  }
}
