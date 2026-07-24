import 'server-only';

import { randomUUID } from 'node:crypto';

import { CredentialsSignin } from '@auth/core/errors';
import type { RoleName } from '@prisma/client';
import type { NextAuthConfig } from 'next-auth';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { extractRequestAuditContext } from '@/lib/audit/request-context';
import {
  authenticateCredentials,
  type AuthenticatedUserRecord,
} from '@/lib/auth/authenticate-credentials';
import {
  recordLoginFailedAudit,
  recordLoginSuccessAudit,
} from '@/lib/auth/login-audit';
import { loginInputSchema } from '@/lib/auth/login-schemas';
import { verifyPassword } from '@/lib/auth/passwords';
import { hashSessionToken } from '@/lib/auth/session';
import { isTotpVerifierAvailable, verifyTotp } from '@/lib/auth/totp';
import { db } from '@/lib/db';
import { env } from '@/lib/env';

class InvalidLoginCredentials extends CredentialsSignin {
  code = 'invalid_credentials';
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      roleId: string;
      roleName: RoleName;
      sessionTokenHash?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    roleId: string;
    roleName: RoleName;
    emailVerified?: Date | null;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    userId?: string;
    email?: string;
    roleId?: string;
    roleName?: RoleName;
    sessionTokenHash?: string;
  }
}

async function findUserByEmail(
  email: string,
): Promise<AuthenticatedUserRecord | null> {
  const row = await db.user.findFirst({
    where: { email, deletedAt: null },
    include: { role: { select: { name: true } } },
  });

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    isActive: row.isActive,
    twofaEnabled: row.twofaEnabled,
    roleId: row.roleId,
    roleName: row.role.name,
  };
}

function sessionExpiresAt(): Date {
  return new Date(Date.now() + env.SESSION_TTL_MINUTES * 60_000);
}

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
        totp: { type: 'text', optional: true },
      },
      authorize: async (credentials, request) => {
        const parsed = loginInputSchema.safeParse({
          email: credentials.email,
          password: credentials.password,
          totp: credentials.totp,
        });
        const { ip, userAgent } = extractRequestAuditContext(request.headers);

        if (!parsed.success) {
          await recordLoginFailedAudit({
            userId: null,
            attemptReason: 'invalid_password',
            ip,
            userAgent,
          });
          throw new InvalidLoginCredentials();
        }

        const result = await authenticateCredentials(parsed.data, {
          findUserByEmail,
          verifyPassword,
          isTotpVerifierAvailable,
          verifyTotp,
        });

        if (!result.ok) {
          const failedUser =
            result.attemptReason === 'user_not_found'
              ? null
              : await findUserByEmail(parsed.data.email);

          await recordLoginFailedAudit({
            userId: failedUser?.id ?? null,
            attemptReason: result.attemptReason,
            ip,
            userAgent,
          });
          throw new InvalidLoginCredentials();
        }

        const sessionId = randomUUID();
        const tokenHash = hashSessionToken(sessionId);
        const expiresAt = sessionExpiresAt();

        await db.$transaction([
          db.session.create({
            data: {
              userId: result.user.id,
              tokenHash,
              ipAddress: ip,
              userAgent,
              expiresAt,
            },
          }),
          db.user.update({
            where: { id: result.user.id },
            data: { lastLoginAt: new Date() },
          }),
        ]);

        await recordLoginSuccessAudit({
          userId: result.user.id,
          roleName: result.user.roleName,
          ip,
          userAgent,
        });

        return {
          id: result.user.id,
          email: result.user.email,
          roleId: result.user.roleId,
          roleName: result.user.roleName,
          sessionTokenHash: tokenHash,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: env.SESSION_TTL_MINUTES * 60,
  },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.email = user.email;
        token.roleId = user.roleId;
        token.roleName = user.roleName;
        token.sessionTokenHash = (
          user as { sessionTokenHash?: string }
        ).sessionTokenHash;
      }

      if (token.sessionTokenHash) {
        const mirror = await db.session.findFirst({
          where: { tokenHash: token.sessionTokenHash as string },
          select: { revokedAt: true, expiresAt: true },
        });

        if (
          !mirror ||
          mirror.revokedAt !== null ||
          mirror.expiresAt.getTime() <= Date.now()
        ) {
          return null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (!token?.userId || !token.sessionTokenHash) {
        return session;
      }

      session.user = {
        id: token.userId as string,
        email: (token.email as string | undefined) ?? session.user?.email ?? '',
        roleId: token.roleId as string,
        roleName: token.roleName as RoleName,
        sessionTokenHash: token.sessionTokenHash as string,
        emailVerified: null,
      };
      return session;
    },
  },
  trustHost: true,
  secret: env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
