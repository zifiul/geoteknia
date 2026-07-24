import 'server-only';

import { decryptSecret } from '@/lib/auth/crypto';
import { verifyTotpCode } from '@/lib/auth/totp-core';
import { registerVerifyTotp } from '@/lib/auth/totp';
import { db } from '@/lib/db';

async function verifyUserTotp(userId: string, code: string): Promise<boolean> {
  const user = await db.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { twofaSecret: true, twofaEnabled: true },
  });

  if (!user?.twofaSecret || !user.twofaEnabled) {
    return false;
  }

  try {
    const plainSecret = decryptSecret(user.twofaSecret);
    return verifyTotpCode(plainSecret, code);
  } catch {
    return false;
  }
}

registerVerifyTotp(verifyUserTotp);
