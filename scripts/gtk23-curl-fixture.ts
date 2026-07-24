/**
 * Usuario efímero para pruebas curl GTK-23. Eliminar tras QA.
 */
import argon2 from 'argon2';
import { PrismaClient, RoleName } from '@prisma/client';

const TEST_EMAIL = 'gtk23-curl-qa@test.geoteknia.local';
const TEST_PASSWORD = 'Gtk23QaTest1!';
const INACTIVE_EMAIL = 'gtk23-curl-inactive@test.geoteknia.local';

const db = new PrismaClient();

async function main(): Promise<void> {
  const action = process.argv[2] ?? 'setup';

  if (action === 'setup') {
    const adminRole = await db.role.findUniqueOrThrow({
      where: { name: RoleName.admin },
    });
    const hash = await argon2.hash(TEST_PASSWORD, { type: argon2.argon2id });

    await db.user.upsert({
      where: { email: TEST_EMAIL },
      create: {
        email: TEST_EMAIL,
        fullName: 'GTK23 QA Curl',
        passwordHash: hash,
        roleId: adminRole.id,
        isActive: true,
        twofaEnabled: false,
      },
      update: {
        passwordHash: hash,
        isActive: true,
        twofaEnabled: false,
        deletedAt: null,
      },
    });

    await db.user.upsert({
      where: { email: INACTIVE_EMAIL },
      create: {
        email: INACTIVE_EMAIL,
        fullName: 'GTK23 QA Inactive',
        passwordHash: hash,
        roleId: adminRole.id,
        isActive: false,
        twofaEnabled: false,
      },
      update: {
        passwordHash: hash,
        isActive: false,
        twofaEnabled: false,
        deletedAt: null,
      },
    });

    console.log(
      JSON.stringify({ ok: true, TEST_EMAIL, INACTIVE_EMAIL }, null, 2),
    );
    return;
  }

  if (action === 'cleanup') {
    const emails = [TEST_EMAIL, INACTIVE_EMAIL];
    const users = await db.user.findMany({
      where: { email: { in: emails } },
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);

    if (userIds.length > 0) {
      await db.session.deleteMany({ where: { userId: { in: userIds } } });
      await db.auditLog.deleteMany({
        where: {
          OR: [
            { userId: { in: userIds } },
            { entityId: { in: userIds } },
          ],
        },
      });
      await db.user.deleteMany({ where: { id: { in: userIds } } });
    }

    console.log(JSON.stringify({ ok: true, removedUsers: userIds.length }));
    return;
  }

  throw new Error(`Acción desconocida: ${action}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
