import { mkdir, writeFile } from 'node:fs/promises';

import { put } from '@vercel/blob';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildCmsImageFilename } from '@/lib/cms/media/cms-image-filename';
import { uploadCmsImageFile } from '@/lib/cms/media/cms-image-upload';

vi.mock('server-only', () => ({}));

vi.mock('@vercel/blob', () => ({
  put: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
}));

const mockedPut = vi.mocked(put);
const mockedMkdir = vi.mocked(mkdir);
const mockedWriteFile = vi.mocked(writeFile);

function makeImageFile(name = 'foto.jpg'): File {
  return new File([new Uint8Array([0xff, 0xd8, 0xff])], name, {
    type: 'image/jpeg',
  });
}

describe('buildCmsImageFilename', () => {
  it('genera un nombre seguro con extensión según el mime', () => {
    const filename = buildCmsImageFilename('Hilty.JPG', 'image/jpeg');
    expect(filename).toMatch(/^hilty-[a-f0-9]{8}\.jpg$/);
  });

  it('rechaza mime no permitido', () => {
    expect(() => buildCmsImageFilename('doc.pdf', 'application/pdf')).toThrow(
      'Tipo de imagen no permitido',
    );
  });
});

describe('uploadCmsImageFile', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.BLOB_STORE_ID;
    delete process.env.VERCEL_OIDC_TOKEN;
    delete process.env.VERCEL;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('sube a Vercel Blob cuando hay BLOB_READ_WRITE_TOKEN', async () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
    mockedPut.mockResolvedValue({
      url: 'https://store.public.blob.vercel-storage.com/images/blog/foto.jpg',
      pathname: 'images/blog/foto.jpg',
      contentType: 'image/jpeg',
      contentDisposition: 'inline',
      downloadUrl:
        'https://store.public.blob.vercel-storage.com/images/blog/foto.jpg?download=1',
      etag: '"abc"',
    });

    const file = makeImageFile();
    const result = await uploadCmsImageFile(file, 'blog');

    expect(result.fileUrl).toMatch(/^\/images\/blog\/foto-[a-f0-9]{8}\.jpg$/);
    expect(mockedPut).toHaveBeenCalledOnce();
    expect(mockedPut).toHaveBeenCalledWith(
      expect.stringMatching(/^images\/blog\/foto-[a-f0-9]{8}\.jpg$/),
      file,
      {
        access: 'public',
        contentType: 'image/jpeg',
        addRandomSuffix: false,
      },
    );
    expect(mockedWriteFile).not.toHaveBeenCalled();
  });

  it('sube a Vercel Blob con credenciales OIDC', async () => {
    process.env.BLOB_STORE_ID = 'store_123';
    process.env.VERCEL_OIDC_TOKEN = 'oidc-token';
    mockedPut.mockResolvedValue({
      url: 'https://store.public.blob.vercel-storage.com/images/general/foto.jpg',
      pathname: 'images/general/foto.jpg',
      contentType: 'image/jpeg',
      contentDisposition: 'inline',
      downloadUrl:
        'https://store.public.blob.vercel-storage.com/images/general/foto.jpg?download=1',
      etag: '"abc"',
    });

    const file = makeImageFile();
    const result = await uploadCmsImageFile(file, 'general');

    expect(result.fileUrl).toMatch(/^\/images\/general\/foto-[a-f0-9]{8}\.jpg$/);
    expect(mockedPut).toHaveBeenCalledOnce();
    expect(mockedWriteFile).not.toHaveBeenCalled();
  });

  it('usa disco local si Blob falla en development', async () => {
    process.env.NODE_ENV = 'development';
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
    mockedPut.mockRejectedValue(new Error('Vercel Blob: This store does not exist.'));

    const file = makeImageFile();
    const result = await uploadCmsImageFile(file, 'blog');

    expect(result.fileUrl).toMatch(/^\/images\/blog\/foto-[a-f0-9]{8}\.jpg$/);
    expect(mockedPut).toHaveBeenCalledOnce();
    expect(mockedWriteFile).toHaveBeenCalledOnce();
  });

  it('escribe en public/ cuando no hay credenciales Blob', async () => {
    const file = makeImageFile();
    const result = await uploadCmsImageFile(file, 'equipo');

    expect(result.fileUrl).toMatch(/^\/images\/equipo\/foto-[a-f0-9]{8}\.jpg$/);
    expect(mockedPut).not.toHaveBeenCalled();
    expect(mockedMkdir).toHaveBeenCalledOnce();
    expect(mockedWriteFile).toHaveBeenCalledOnce();
  });

  it('rechaza archivos vacíos', async () => {
    const file = new File([], 'vacio.jpg', { type: 'image/jpeg' });

    await expect(uploadCmsImageFile(file, 'blog')).rejects.toThrow(
      'No se recibió ningún archivo',
    );
  });
});
