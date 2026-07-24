/**
 * Línea base BD para QA GTK-24 (conteos, sin PII).
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main(): Promise<void> {
  const [users, twofaEnabledUsers, roleChangeAudits, sessions] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { twofaEnabled: true } }),
    db.auditLog.count({ where: { action: 'role_change' } }),
    db.session.count(),
  ]);

  const qaUser = await db.user.findFirst({
    where: { email: 'gtk24-qa@test.geoteknia.local' },
    select: {
      id: true,
      twofaEnabled: true,
      twofaSecret: true,
    },
  });

  console.log(
    JSON.stringify(
      {
        users,
        twofaEnabledUsers,
        roleChangeAudits,
        sessions,
        qaUser: qaUser
          ? {
              id: qaUser.id,
              twofaEnabled: qaUser.twofaEnabled,
              hasTwofaSecret: qaUser.twofaSecret !== null,
            }
          : null,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
