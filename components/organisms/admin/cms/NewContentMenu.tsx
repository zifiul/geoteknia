'use client';

import Link from 'next/link';
import { useId, useState } from 'react';

import { CMS_CONTENT_TYPE_CATALOG } from '@/lib/admin/cms-content-types';
import { cn } from '@/lib/shared/cn';

type Props = {
  canCreate: boolean;
};

export function NewContentMenu({ canCreate }: Props) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  if (!canCreate) {
    return null;
  }

  const close = () => setOpen(false);

  return (
    <div
      className="relative w-full sm:w-auto"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          close();
        }
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-brand-accent px-4 py-2 text-sm font-semibold text-white hover:bg-brand-accent/90 sm:w-auto sm:justify-start"
        onClick={() => setOpen((value) => !value)}
      >
        Crear contenido
        <span aria-hidden className="text-xs">
          ▾
        </span>
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-brand-primary/40 backdrop-blur-sm sm:hidden"
            aria-label="Cerrar menú de creación"
            onClick={close}
          />
          <ul
            id={menuId}
            role="menu"
            className={cn(
              'z-50 overflow-y-auto border border-brand-primary/10 bg-brand-surface shadow-lg',
              'fixed inset-x-0 top-16 max-h-[calc(100dvh-4rem)] rounded-b-xl py-2',
              'sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-80 sm:w-64 sm:rounded-lg sm:py-1',
            )}
            onMouseDown={(event) => event.preventDefault()}
          >
            <li
              className="border-b border-brand-primary/10 px-4 py-3 sm:hidden"
              role="presentation"
            >
              <span className="text-sm font-semibold text-brand-primary">
                Tipo de contenido
              </span>
            </li>
            {CMS_CONTENT_TYPE_CATALOG.map((row) => (
              <li key={row.type} role="none">
                <Link
                  role="menuitem"
                  href={row.createPath}
                  className="flex min-h-11 items-center px-4 py-3 text-sm text-brand-on-surface hover:bg-brand-neutral/50 active:bg-brand-neutral/50 sm:block sm:min-h-0 sm:py-2"
                  onClick={close}
                >
                  {row.label}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
