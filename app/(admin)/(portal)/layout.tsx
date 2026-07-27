import { AdminPortalLayout } from '@/components/organisms/admin/AdminPortalLayout';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function PortalGroupLayout({ children }: Props) {
  return <AdminPortalLayout>{children}</AdminPortalLayout>;
}
