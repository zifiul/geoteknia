import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  const media = await db.mediaAsset.create({
    data: {
      fileUrl: '/uploads/curl-test.pdf',
      mimeType: 'application/pdf',
      fileSizeKb: 500,
      assetType: 'pdf',
    },
  });
  const slug = `guia-curl-gtk30-${Date.now()}`;
  const lm = await db.leadMagnet.create({
    data: {
      title: 'Guía Curl GTK-30',
      slug,
      thankYouUrl: `/recursos/${slug}/gracias`,
      isGated: true,
      fileId: media.id,
      schemaType: 'CreativeWork',
    },
  });
  console.log(`CREATED:${slug}:${lm.id}:${media.id}`);
  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
