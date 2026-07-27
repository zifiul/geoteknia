import { AdminAuthShell } from '@/components/organisms/admin/AdminAuthShell';
import { LoginForm } from '@/components/organisms/admin/LoginForm';
import { adminLoginMetadata } from '@/lib/admin/login-page-config';
import { resolveLoginCallbackUrl } from '@/lib/auth/login-callback-url';

export const metadata = adminLoginMetadata;

type PageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
};

function mapAuthJsError(error: string | undefined): string | null {
  if (!error) return null;
  if (error === 'CredentialsSignin') {
    return 'No se pudo iniciar sesión. Comprueba tus credenciales.';
  }
  return 'No se pudo completar el inicio de sesión. Inténtalo de nuevo.';
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const callbackUrl = resolveLoginCallbackUrl(params.callbackUrl);
  const authErrorMessage = mapAuthJsError(params.error);

  return (
    <AdminAuthShell>
      <LoginForm callbackUrl={callbackUrl} authErrorMessage={authErrorMessage} />
    </AdminAuthShell>
  );
}
