'use server';

import { randomBytes } from 'node:crypto';

import { AuditAction, RoleName } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import {
  createUserFormSchema,
  updateUserFormSchema,
} from '@/lib/admin/user-form-schemas';
import { runUsersAction } from '@/lib/admin/users-action-result';
import {
  assertActorNotSelfTarget,
  assertNotRemovingLastAdmin,
  isAdminRoleName,
} from '@/lib/admin/users-guardrails';
import {
  countOtherActiveAdmins,
  getUserDetail,
  UserNotFoundError,
} from '@/lib/admin/users-queries';
import { recordAudit } from '@/lib/audit/log';
import { withPermission } from '@/lib/auth/rbac';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/passwords';
import { revokeAllSessionsForUser } from '@/lib/auth/session';
import { db } from '@/lib/db';

const USERS_PATH = '/admin/usuarios';

function generateTemporaryPassword(): string {
  return randomBytes(12).toString('base64url');
}

function parseFormData(formData: FormData): Record<string, string> {
  return {
    fullName: String(formData.get('fullName') ?? ''),
    email: String(formData.get('email') ?? ''),
    roleId: String(formData.get('roleId') ?? ''),
  };
}

async function getRoleNameById(roleId: string): Promise<RoleName> {
  const role = await db.role.findUniqueOrThrow({
    where: { id: roleId },
    select: { name: true },
  });
  return role.name;
}

export const createUserAction = withPermission(
  'users.create',
  async (actor, formData: FormData) => {
    return runUsersAction(async () => {
      const parsed = createUserFormSchema.parse(parseFormData(formData));
      const tempPassword = generateTemporaryPassword();
      const passwordHash = await hashPassword(tempPassword);

      const user = await db.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: {
            fullName: parsed.fullName,
            email: parsed.email.toLowerCase(),
            roleId: parsed.roleId,
            passwordHash,
            isActive: true,
            createdById: actor.userId,
            updatedById: actor.userId,
          },
          select: { id: true },
        });

        await recordAudit(
          {
            userId: actor.userId,
            action: AuditAction.state_change,
            entityType: 'user',
            entityId: created.id,
            metadata: {
              event: 'user_created',
              targetUserId: created.id,
              toState: 'active',
            },
          },
          { tx },
        );

        return created;
      });

      revalidatePath(USERS_PATH);
      return { userId: user.id, temporaryPassword: tempPassword };
    });
  },
);

export const updateUserAction = withPermission(
  'users.update',
  async (actor, userId: string, formData: FormData) => {
    return runUsersAction(async () => {
      const parsed = updateUserFormSchema.parse(parseFormData(formData));
      const existing = await getUserDetail(userId);
      const newRoleName = await getRoleNameById(parsed.roleId);
      const roleChanged = existing.roleId !== parsed.roleId;

      if (roleChanged) {
        const otherAdmins = await countOtherActiveAdmins(userId);
        assertNotRemovingLastAdmin(
          {
            targetIsAdmin: isAdminRoleName(existing.role.name),
            targetIsActive: existing.isActive,
            otherActiveAdminCount: otherAdmins,
          },
          'demote',
        );
        if (
          isAdminRoleName(existing.role.name) &&
          !isAdminRoleName(newRoleName)
        ) {
          assertActorNotSelfTarget(actor.userId, userId, 'degradar el rol de');
        }
      }

      await db.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            fullName: parsed.fullName,
            email: parsed.email.toLowerCase(),
            roleId: parsed.roleId,
            updatedById: actor.userId,
          },
        });

        if (roleChanged) {
          await recordAudit(
            {
              userId: actor.userId,
              action: AuditAction.role_change,
              entityType: 'user',
              entityId: userId,
              metadata: {
                targetUserId: userId,
                previousRole: existing.role.name,
                newRole: newRoleName,
                event: 'admin_update',
              },
            },
            { tx },
          );
        }
      });

      if (roleChanged) {
        await revokeAllSessionsForUser(userId);
      }

      revalidatePath(USERS_PATH);
      revalidatePath(`${USERS_PATH}/${userId}`);
      return undefined;
    });
  },
);

export const setUserActiveAction = withPermission(
  'users.update',
  async (actor, userId: string, isActive: boolean) => {
    return runUsersAction(async () => {
      const existing = await getUserDetail(userId);

      if (!isActive) {
        assertActorNotSelfTarget(actor.userId, userId, 'desactivar');
        const otherAdmins = await countOtherActiveAdmins(userId);
        assertNotRemovingLastAdmin(
          {
            targetIsAdmin: isAdminRoleName(existing.role.name),
            targetIsActive: existing.isActive,
            otherActiveAdminCount: otherAdmins,
          },
          'deactivate',
        );
      }

      await db.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { isActive, updatedById: actor.userId },
        });

        await recordAudit(
          {
            userId: actor.userId,
            action: AuditAction.state_change,
            entityType: 'user',
            entityId: userId,
            metadata: {
              event: isActive ? 'activated' : 'deactivated',
              targetUserId: userId,
              fromState: existing.isActive ? 'active' : 'inactive',
              toState: isActive ? 'active' : 'inactive',
            },
          },
          { tx },
        );
      });

      if (!isActive) {
        await revokeAllSessionsForUser(userId);
      }

      revalidatePath(USERS_PATH);
      revalidatePath(`${USERS_PATH}/${userId}`);
      return undefined;
    });
  },
);

export const resetUserPasswordAction = withPermission(
  'users.update',
  async (_actor: PortalSessionPayload, userId: string) => {
    return runUsersAction(async () => {
      await getUserDetail(userId);
      const tempPassword = generateTemporaryPassword();
      const passwordHash = await hashPassword(tempPassword);

      await db.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { passwordHash },
        });

        await recordAudit(
          {
            userId: _actor.userId,
            action: AuditAction.state_change,
            entityType: 'user',
            entityId: userId,
            metadata: {
              event: 'password_reset',
              targetUserId: userId,
            },
          },
          { tx },
        );
      });

      revalidatePath(`${USERS_PATH}/${userId}`);
      return { temporaryPassword: tempPassword };
    });
  },
);

export const resetUser2faAction = withPermission(
  'users.update',
  async (actor, userId: string) => {
    return runUsersAction(async () => {
      await getUserDetail(userId);

      await db.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            twofaEnabled: false,
            twofaSecret: null,
            updatedById: actor.userId,
          },
        });

        await recordAudit(
          {
            userId: actor.userId,
            action: AuditAction.state_change,
            entityType: 'user',
            entityId: userId,
            metadata: {
              event: 'twofa_reset',
              targetUserId: userId,
            },
          },
          { tx },
        );
      });

      revalidatePath(`${USERS_PATH}/${userId}`);
      return undefined;
    });
  },
);

/** Expuesto para tests de seguridad (abuse cases). */
export async function listUsersForPermissionTest() {
  const { listUsers } = await import('@/lib/admin/users-queries');
  return listUsers({
    page: 1,
    pageSize: 1,
    sort: 'fullName',
  });
}

export { UserNotFoundError };
