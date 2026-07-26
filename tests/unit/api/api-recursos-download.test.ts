/**
 * GTK-61 — GET /api/recursos/download
 */
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const leadFindUnique = vi.fn();
const leadMagnetFindFirst = vi.fn();
const mediaAssetFindFirst = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    lead: { findUnique: (...args: unknown[]) => leadFindUnique(...args) },
    leadMagnet: { findFirst: (...args: unknown[]) => leadMagnetFindFirst(...args) },
    mediaAsset: { findFirst: (...args: unknown[]) => mediaAssetFindFirst(...args) },
  },
}));

vi.mock('@/lib/env', () => ({
  env: { MEDIA_STORAGE_BASE_URL: 'https://cdn.example.com' },
}));

import { GET } from '@/app/api/recursos/download/route';

const leadId = '11111111-1111-4111-8111-111111111111';
const magnetId = '22222222-2222-4222-8222-222222222222';
const token = Buffer.from(`${leadId}:${magnetId}`).toString('base64url');

function buildRequest(tokenValue?: string) {
  const url = tokenValue
    ? `http://localhost:3000/api/recursos/download?token=${encodeURIComponent(tokenValue)}`
    : 'http://localhost:3000/api/recursos/download';
  return new NextRequest(url);
}

describe('GET /api/recursos/download (GTK-61)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    leadFindUnique.mockResolvedValue({ leadMagnetId: magnetId });
    leadMagnetFindFirst.mockResolvedValue({ fileId: '33333333-3333-4333-8333-333333333333' });
    mediaAssetFindFirst.mockResolvedValue({ fileUrl: '/files/guia.pdf' });
  });

  it('redirige con token válido sin JSON con file_url', async () => {
    const response = await GET(buildRequest(token));
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('https://cdn.example.com/files/guia.pdf');
    const text = await response.text();
    expect(text).not.toContain('file_url');
    expect(text).not.toContain('/files/guia.pdf');
  });

  it('400 si falta token', async () => {
    const response = await GET(buildRequest());
    expect(response.status).toBe(400);
  });

  it('400 si token inválido', async () => {
    const response = await GET(buildRequest('bad'));
    expect(response.status).toBe(400);
  });

  it('404 si lead no coincide', async () => {
    leadFindUnique.mockResolvedValue({ leadMagnetId: 'other' });
    const response = await GET(buildRequest(token));
    expect(response.status).toBe(404);
  });
});
