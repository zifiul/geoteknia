import { describe, expect, it } from 'vitest';

import { parseResourceDownloadToken } from '@/lib/leads/resource-download-token';

describe('parseResourceDownloadToken (GTK-61)', () => {
  const leadId = '11111111-1111-4111-8111-111111111111';
  const magnetId = '22222222-2222-4222-8222-222222222222';
  const token = Buffer.from(`${leadId}:${magnetId}`).toString('base64url');

  it('decodifica token válido', () => {
    expect(parseResourceDownloadToken(token)).toEqual({
      leadId,
      leadMagnetId: magnetId,
    });
  });

  it('rechaza token malformado', () => {
    expect(parseResourceDownloadToken('not-a-token')).toBeNull();
    expect(parseResourceDownloadToken('')).toBeNull();
  });
});
