import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const ref = process.argv[2];
const email = process.argv[3] ?? 'curl-gtk28@test.geoteknia.local';

if (ref) {
  const lead = await db.lead.findUnique({
    where: { referenceNumber: ref },
    include: { project: true },
  });
  if (lead?.project) {
    await db.project.delete({ where: { id: lead.project.id } });
  }
  if (lead) {
    await db.lead.delete({ where: { id: lead.id } });
  }
}

const contact = await db.contact.findFirst({
  where: { email, deletedAt: null },
});
if (contact) {
  await db.contact.delete({ where: { id: contact.id } });
}

await db.service.delete({ where: { slug: 'gtk28-qa-servicio' } }).catch(() => {});
console.log('cleanup ok');
await db.$disconnect();
