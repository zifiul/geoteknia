'use client';

import Link from 'next/link';
import { useId, useState } from 'react';

import { CMS_CONTENT_TYPE_CATALOG } from '@/lib/admin/cms-content-types';

type Props = {
  canCreate: boolean;
};

export function NewContentMenu({ canCreate }: Props) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  if (!canCreate) {
    return null;
  }

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        className="inline-flex min-h-11 items-center gap-2 rounded-md bg-brand-accent px-4 py-2 text-sm font-semibold text-white hover:bg-brand-accent/90 cursor-pointer"
        onClick={() => setOpen((value) => !value)}
      >
        Crear contenido
        <span aria-hidden className="text-xs">
          ▾
        </span>
      </button>
      {open ? (
        <ul
          id={menuId}
          role="menu"
          className="absolute right-0 z-20 mt-2 max-h-80 w-64 overflow-y-auto rounded-lg border border-brand-primary/10 bg-brand-surface py-1 shadow-lg"
          onMouseDown={(event) => event.preventDefault()}
        >
          {CMS_CONTENT_TYPE_CATALOG.map((row) => (
            <li key={row.type} role="none">
              <Link
                role="menuitem"
                href={row.createPath}
                className="block px-4 py-2 text-sm text-brand-on-surface hover:bg-brand-neutral/50"
                onClick={() => setOpen(false)}
              >
                {row.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
