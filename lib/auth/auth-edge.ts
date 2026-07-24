import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';

/**
 * Auth.js mínimo para Edge/middleware: solo verificación JWT, sin Prisma ni providers.
 * La revocación en BD sigue en `lib/auth/config.ts` + `requireSession()` (Node).
 */
const authEdgeConfig = {
  providers: [],
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
} satisfies NextAuthConfig;

export const { auth } = NextAuth(authEdgeConfig);
