'use server';

import { headers } from 'next/headers';
import QRCode from 'qrcode';

import { recordAudit } from '@/lib/audit';
import { extractRequestAuditContext } from '@/lib/audit/request-context';
import { encryptSecret, decryptSecret } from '@/lib/auth/crypto';
import { verifyPassword } from '@/lib/auth/passwords';
import { getPortalSession, InvalidSessionError } from '@/lib/auth/session';
import { generateTotpSecret, verifyTotpCode } from '@/lib/auth/totp-core';
import { verifyTotp } from '@/lib/auth/totp';
import {
  confirmTotpActivationInputSchema,
  disableTotpInputSchema,
  type GenerateTotpSecretActionResult,
  type TotpActionResult,
  type TotpVoidActionResult,
} from '@/lib/auth/totp-schemas';
import { db } from '@/lib/db';

export type {
  ConfirmTotpActivationInput,
  DisableTotpInput,
  GenerateTotpSecretActionResult,
  TotpActionError,
  TotpActionErrorCode,
  TotpActionResult,
  TotpVoidActionResult,
} from '@/lib/auth/totp-schemas';

async function auditContext() {
  const headerList = await headers();
  return extractRequestAuditContext(headerList);
}

async function requireActorUserId(): Promise<string> {
  const session = await getPortalSession();
  return session.userId;
}

function unauthorized<T extends Record<string, unknown> | void = void>(): TotpActionResult<T> {
  return {
    ok: false,
    error: { code: 'UNAUTHORIZED', message: 'Sesión no válida' },
  };
}

export async function generateTotpSecretAction(): Promise<GenerateTotpSecretActionResult> {
  let userId: string;
  try {
    userId = await requireActorUserId();
  } catch (error) {
    if (error instanceof InvalidSessionError) {
      return unauthorized<{ otpauthUri: string; qrDataUrl: string }>();
    }
    throw error;
  }

  const user = await db.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { email: true, twofaEnabled: true },
  });

  if (!user) {
    return unauthorized<{ otpauthUri: string; qrDataUrl: string }>();
  }

  if (user.twofaEnabled) {
    return {
      ok: false,
      error: {
        code: 'CONFLICT',
        message: 'El segundo factor ya está activo',
      },
    };
  }

  const { secret, otpauthUri } = generateTotpSecret(user.email);
  const encrypted = encryptSecret(secret);

  await db.user.update({
    where: { id: userId },
    data: { twofaSecret: encrypted, twofaEnabled: false },
  });

  const qrDataUrl = await QRCode.toDataURL(otpauthUri, {
    margin: 1,
    width: 200,
  });

  return { ok: true, otpauthUri, qrDataUrl };
}

export async function confirmTotpActivationAction(
  input: unknown,
): Promise<TotpVoidActionResult> {
  let userId: string;
  try {
    userId = await requireActorUserId();
  } catch (error) {
    if (error instanceof InvalidSessionError) {
      return unauthorized();
    }
    throw error;
  }

  const parsed = confirmTotpActivationInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Código TOTP no válido',
      },
    };
  }

  const user = await db.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { twofaSecret: true, twofaEnabled: true },
  });

  if (!user?.twofaSecret || user.twofaEnabled) {
    return {
      ok: false,
      error: {
        code: 'FORBIDDEN',
        message: 'No hay un enrolamiento TOTP pendiente',
      },
    };
  }

  let plainSecret: string;
  try {
    plainSecret = decryptSecret(user.twofaSecret);
  } catch {
    return {
      ok: false,
      error: {
        code: 'FORBIDDEN',
        message: 'No hay un enrolamiento TOTP pendiente',
      },
    };
  }

  const valid = await verifyTotpCode(plainSecret, parsed.data.totp);
  if (!valid) {
    return {
      ok: false,
      error: {
        code: 'INVALID_TOTP',
        message: 'Código incorrecto o caducado',
      },
    };
  }

  const { ip, userAgent } = await auditContext();

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { twofaEnabled: true },
    });

    await recordAudit(
      {
        userId,
        action: 'role_change',
        entityType: 'users',
        entityId: userId,
        ip,
        userAgent,
        metadata: { event: '2fa_enabled', targetUserId: userId },
      },
      { tx },
    );
  });

  return { ok: true };
}

export async function disableTotpAction(
  input: unknown,
): Promise<TotpVoidActionResult> {
  let userId: string;
  try {
    userId = await requireActorUserId();
  } catch (error) {
    if (error instanceof InvalidSessionError) {
      return unauthorized();
    }
    throw error;
  }

  const parsed = disableTotpInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Datos no válidos',
      },
    };
  }

  const user = await db.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: {
      passwordHash: true,
      twofaEnabled: true,
    },
  });

  if (!user?.twofaEnabled) {
    return {
      ok: false,
      error: {
        code: 'FORBIDDEN',
        message: 'El segundo factor no está activo',
      },
    };
  }

  const passwordOk = await verifyPassword(
    user.passwordHash,
    parsed.data.password,
  );
  if (!passwordOk) {
    return {
      ok: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Contraseña incorrecta',
      },
    };
  }

  const totpOk = await verifyTotp(userId, parsed.data.totp);
  if (!totpOk) {
    return {
      ok: false,
      error: {
        code: 'INVALID_TOTP',
        message: 'Código incorrecto o caducado',
      },
    };
  }

  const { ip, userAgent } = await auditContext();

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { twofaEnabled: false, twofaSecret: null },
    });

    await recordAudit(
      {
        userId,
        action: 'role_change',
        entityType: 'users',
        entityId: userId,
        ip,
        userAgent,
        metadata: { event: '2fa_disabled', targetUserId: userId },
      },
      { tx },
    );
  });

  return { ok: true };
}
