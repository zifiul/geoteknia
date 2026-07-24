import type { RoleName } from '@prisma/client';

import type { LoginInput } from '@/lib/auth/login-schemas';

export type AuthenticatedUserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  twofaEnabled: boolean;
  roleId: string;
  roleName: RoleName;
};

export type LoginFailedAttemptReason =
  | 'user_not_found'
  | 'inactive_user'
  | 'invalid_password'
  | 'totp_unavailable'
  | 'totp_invalid';

export type AuthenticateCredentialsDeps = {
  findUserByEmail: (email: string) => Promise<AuthenticatedUserRecord | null>;
  verifyPassword: (hash: string, plain: string) => Promise<boolean>;
  isTotpVerifierAvailable: () => boolean;
  verifyTotp?: (userId: string, code: string) => Promise<boolean>;
};

export type AuthenticateCredentialsResult =
  | {
      ok: true;
      user: {
        id: string;
        email: string;
        roleId: string;
        roleName: RoleName;
      };
    }
  | {
      ok: false;
      reason: 'invalid_credentials';
      attemptReason: LoginFailedAttemptReason;
    }
  | {
      ok: false;
      reason: 'totp_unavailable';
      attemptReason: 'totp_unavailable';
    };

export async function authenticateCredentials(
  input: LoginInput,
  deps: AuthenticateCredentialsDeps,
): Promise<AuthenticateCredentialsResult> {
  const user = await deps.findUserByEmail(input.email);

  if (!user) {
    return {
      ok: false,
      reason: 'invalid_credentials',
      attemptReason: 'user_not_found',
    };
  }

  const passwordValid = await deps.verifyPassword(
    user.passwordHash,
    input.password,
  );

  if (!passwordValid) {
    return {
      ok: false,
      reason: 'invalid_credentials',
      attemptReason: 'invalid_password',
    };
  }

  if (!user.isActive) {
    return {
      ok: false,
      reason: 'invalid_credentials',
      attemptReason: 'inactive_user',
    };
  }

  if (user.twofaEnabled) {
    if (!deps.isTotpVerifierAvailable() || !deps.verifyTotp) {
      return {
        ok: false,
        reason: 'totp_unavailable',
        attemptReason: 'totp_unavailable',
      };
    }

    if (!input.totp) {
      return {
        ok: false,
        reason: 'invalid_credentials',
        attemptReason: 'totp_invalid',
      };
    }

    const totpValid = await deps.verifyTotp(user.id, input.totp);
    if (!totpValid) {
      return {
        ok: false,
        reason: 'invalid_credentials',
        attemptReason: 'totp_invalid',
      };
    }
  }

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
    },
  };
}
