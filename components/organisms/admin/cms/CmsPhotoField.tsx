'use client';

import { AssetType } from '@prisma/client';
import Image from 'next/image';
import { useEffect, useId, useRef, useState, useTransition } from 'react';

import {
  createMediaAssetAction,
  updateMediaAssetAction,
  uploadCmsImageAction,
} from '@/app/(admin)/(portal)/contenido/actions';
import type { CmsImageUploadCategory } from '@/lib/cms/media/cms-image-upload-constants';
import { CMS_IMAGE_MAX_BYTES } from '@/lib/cms/media/cms-image-upload-constants';
import { resolveNextImageMediaSrc } from '@/lib/content/slug';

type Props = {
  label?: string;
  uploadCategory: CmsImageUploadCategory;
  photoId: string | null;
  initialPreviewUrl: string | null;
  initialAltText: string | null;
  mediaStorageBaseUrl: string;
  siteUrl: string;
  onPhotoIdChange: (photoId: string | null) => void;
  onPendingChange?: (pending: boolean) => void;
  error?: string;
};

function nullableStr(value: string | null | undefined): string {
  return value ?? '';
}

function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen seleccionada.'));
    };
    img.src = url;
  });
}

function altFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, '');
  return base.replace(/[-_]+/g, ' ').trim();
}

export function CmsPhotoField({
  label = 'Foto',
  uploadCategory,
  photoId,
  initialPreviewUrl,
  initialAltText,
  mediaStorageBaseUrl,
  siteUrl,
  onPhotoIdChange,
  onPendingChange,
  error,
}: Props) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState(() => nullableStr(initialAltText));
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [storedFileUrl, setStoredFileUrl] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{
    width: number;
    height: number;
    fileSizeKb: number;
    mimeType: string;
  } | null>(null);

  useEffect(() => {
    setPreviewUrl(initialPreviewUrl);
    if (!selectedFile) {
      setAltText(nullableStr(initialAltText));
    }
  }, [initialPreviewUrl, initialAltText, selectedFile]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const displayPreview = localPreviewUrl ?? previewUrl;
  const fieldError = error ?? actionError ?? undefined;

  const applyPhoto = () => {
    const trimmedAlt = altText.trim();
    if (!trimmedAlt) {
      setActionError('El texto alternativo (alt) es obligatorio para imágenes.');
      return;
    }

    setActionError(null);
    onPendingChange?.(true);
    startTransition(async () => {
      try {
        if (!selectedFile) {
          if (photoId) {
            const result = await updateMediaAssetAction(photoId, {
              altText: trimmedAlt,
              assetType: AssetType.image,
            });
            if (!result.ok) {
              setActionError(result.error.message);
              return;
            }
            onPhotoIdChange(photoId);
            return;
          }
          setActionError('Seleccione una imagen antes de aplicar.');
          return;
        }

        if (selectedFile.size > CMS_IMAGE_MAX_BYTES) {
          setActionError('La imagen supera el tamaño máximo (5 MB).');
          return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('category', uploadCategory);
        const uploadResult = await uploadCmsImageAction(formData);
        if (!uploadResult.ok) {
          setActionError(uploadResult.error.message);
          return;
        }
        const fileUrl = uploadResult.data?.fileUrl ?? null;
        if (!fileUrl) {
          setActionError('No se recibió la ruta de la imagen subida.');
          return;
        }
        setStoredFileUrl(fileUrl);

        const payload = {
          fileUrl,
          assetType: AssetType.image,
          altText: trimmedAlt,
          mimeType: imageMeta?.mimeType ?? null,
          width: imageMeta?.width ?? null,
          height: imageMeta?.height ?? null,
          fileSizeKb: imageMeta?.fileSizeKb ?? null,
        };

        const result = photoId
          ? await updateMediaAssetAction(photoId, payload)
          : await createMediaAssetAction(payload);

        if (!result.ok) {
          setActionError(result.error.message);
          return;
        }

        const nextPhotoId = photoId ?? result.data?.id ?? null;
        if (!nextPhotoId) {
          setActionError('No se recibió el identificador del recurso multimedia.');
          return;
        }

        onPhotoIdChange(nextPhotoId);
        setPreviewUrl(
          resolveNextImageMediaSrc(fileUrl, mediaStorageBaseUrl, siteUrl),
        );
        setSelectedFile(null);
        if (localPreviewUrl) {
          URL.revokeObjectURL(localPreviewUrl);
          setLocalPreviewUrl(null);
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } finally {
        onPendingChange?.(false);
      }
    });
  };

  const removePhoto = () => {
    setActionError(null);
    setSelectedFile(null);
    setStoredFileUrl(null);
    setAltText('');
    setImageMeta(null);
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    setPreviewUrl(null);
    onPhotoIdChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onFileSelected = async (file: File | undefined) => {
    if (!file) return;
    setActionError(null);

    if (file.size > CMS_IMAGE_MAX_BYTES) {
      setActionError('La imagen supera el tamaño máximo (5 MB).');
      return;
    }

    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);
    setSelectedFile(file);
    setStoredFileUrl(null);

    if (!altText.trim()) {
      setAltText(altFromFilename(file.name));
    }

    try {
      const { width, height } = await readImageDimensions(file);
      setImageMeta({
        width,
        height,
        fileSizeKb: Math.max(1, Math.ceil(file.size / 1024)),
        mimeType: file.type || 'image/jpeg',
      });
    } catch {
      setImageMeta({
        width: 0,
        height: 0,
        fileSizeKb: Math.max(1, Math.ceil(file.size / 1024)),
        mimeType: file.type || 'image/jpeg',
      });
    }
  };

  return (
    <div className="mt-3 space-y-3" data-testid="cms-photo-field">
      <p className="text-sm font-medium text-brand-secondary">{label}</p>

      {displayPreview ? (
        <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border border-brand-primary/10 bg-brand-surface">
          <Image
            src={displayPreview}
            alt={altText.trim() || 'Vista previa'}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100vw, 320px"
            unoptimized
          />
        </div>
      ) : (
        <p className="text-sm text-brand-secondary">Sin imagen asignada.</p>
      )}

      <div>
        <label
          htmlFor={fileInputId}
          className="inline-flex min-h-11 cursor-pointer items-center rounded-md border border-brand-primary/20 px-3 py-2 text-sm font-medium text-brand-accent hover:bg-brand-surface"
        >
          {selectedFile ? 'Cambiar imagen' : 'Seleccionar imagen'}
        </label>
        <input
          ref={fileInputRef}
          id={fileInputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="sr-only"
          onChange={(e) => void onFileSelected(e.target.files?.[0])}
        />
        {selectedFile ? (
          <p className="mt-1 text-xs text-brand-secondary">
            Archivo seleccionado: {selectedFile.name}. Pulse «Aplicar foto» para
            subirla y vincularla.
          </p>
        ) : (
          <p className="mt-1 text-xs text-brand-secondary">
            Formatos: JPEG, PNG, WebP, GIF o AVIF. Máximo 5 MB.
          </p>
        )}
        {storedFileUrl ? (
          <p className="mt-1 text-xs text-brand-secondary">
            Ruta guardada: {storedFileUrl}
          </p>
        ) : null}
      </div>

      <label className="block text-sm text-brand-secondary">
        Texto alternativo (alt)
        <span className="text-red-700" aria-hidden="true">
          {' '}
          *
        </span>
        <input
          type="text"
          className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          aria-invalid={fieldError ? true : undefined}
        />
      </label>

      {fieldError ? (
        <p role="alert" className="text-sm text-red-700">
          {fieldError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="min-h-11 rounded-md bg-brand-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 cursor-pointer"
          disabled={pending}
          onClick={applyPhoto}
        >
          {pending ? 'Subiendo…' : 'Aplicar foto'}
        </button>
        {photoId || displayPreview ? (
          <button
            type="button"
            className="min-h-11 rounded-md border border-brand-primary/20 px-4 py-2 text-sm font-medium text-brand-accent disabled:opacity-50 cursor-pointer"
            disabled={pending}
            onClick={removePhoto}
          >
            Quitar foto
          </button>
        ) : null}
      </div>
    </div>
  );
}
