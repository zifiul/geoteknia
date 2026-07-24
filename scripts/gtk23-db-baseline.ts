import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main(): Promise<void> {
  const [sessions, loginAudits, users] = await Promise.all([
    db.session.count(),
    db.auditLog.count({
      where: { action: { in: ['login', 'login_failed'] } },
    }),
    db.user.count(),
  ]);

  console.log(JSON.stringify({ sessions, loginAudits, users }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
