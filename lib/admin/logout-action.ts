'use server';

import { redirect } from 'next/navigation';

import { signOut } from '@/lib/auth/config';

export async function adminLogoutAction(): Promise<void> {
  // signOut({ redirectTo }) resuelve la URL absoluta con NEXTAUTH_URL, que en
  // producción puede quedar en localhost si se hornea en el build de Docker.
  // redirect() de Next.js usa el host de la petición entrante.
  await signOut({ redirect: false });
  redirect('/admin/login');
}
