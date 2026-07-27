'use server';

import { signOut } from '@/lib/auth/config';

export async function adminLogoutAction(): Promise<void> {
  await signOut({ redirectTo: '/admin/login' });
}
