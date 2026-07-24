/**
 * Fixture efímera GTK-24 QA. Uso: setup | cleanup
 */
import argon2 from 'argon2';
import { PrismaClient, RoleName } from '@prisma/client';

export const GTK24_QA_EMAIL = 'gtk24-qa@test.geoteknia.local';
export const GTK24_QA_PASSWORD = 'Gtk24QaTest1!';

const db = new PrismaClient();

async function main(): Promise<void> {
  const action = process.argv[2] ?? 'setup';

  if (action === 'setup') {
    const adminRole = await db.role.findUniqueOrThrow({
      where: { name: RoleName.admin },
    });
    const hash = await argon2.hash(GTK24_QA_PASSWORD, {
      type: argon2.argon2id,
    });

    const user = await db.user.upsert({
      where: { email: GTK24_QA_EMAIL },
      create: {
        email: GTK24_QA_EMAIL,
        fullName: 'GTK24 QA TOTP',
        passwordHash: hash,
        roleId: adminRole.id,
        isActive: true,
        twofaEnabled: false,
        twofaSecret: null,
      },
      update: {
        passwordHash: hash,
        isActive: true,
        twofaEnabled: false,
        twofaSecret: null,
        deletedAt: null,
      },
    });

    console.log(JSON.stringify({ ok: true, userId: user.id }, null, 2));
    return;
  }

  if (action === 'cleanup') {
    const user = await db.user.findFirst({
      where: { email: GTK24_QA_EMAIL },
      select: { id: true },
    });

    if (user) {
      await db.session.deleteMany({ where: { userId: user.id } });
      await db.auditLog.deleteMany({
        where: {
          OR: [{ userId: user.id }, { entityId: user.id }],
        },
      });
      await db.user.delete({ where: { id: user.id } });
    }

    console.log(JSON.stringify({ ok: true, removed: Boolean(user) }, null, 2));
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
