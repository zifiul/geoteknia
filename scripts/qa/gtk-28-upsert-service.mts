import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
await db.service.upsert({
  where: { slug: 'gtk28-qa-servicio' },
  create: {
    slug: 'gtk28-qa-servicio',
    name: 'Servicio QA GTK-28',
    body: 'QA',
    schemaType: 'Service',
  },
  update: {},
});
console.log('service ok');
await db.$disconnect();
