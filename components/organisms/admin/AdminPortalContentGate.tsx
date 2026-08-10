'use client';

import { useEffect, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  onContentReady: () => void;
};

export function AdminPortalContentGate({ children, onContentReady }: Props) {
  useEffect(() => {
    onContentReady();
  }, [onContentReady]);

  return children;
}
